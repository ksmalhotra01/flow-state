'use server'

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type Feedback = {
  communication: number
  problemSolving: number
  codeQuality: number
  verdict: 'Not Ready' | 'Getting Close' | 'Ready'
  observations: string[]
  improvements: string[]
  nextProblem: string
}

export async function generateFeedback(sessionId: string): Promise<Feedback | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('id, problem, feedback')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return null

  // Return cached feedback if already generated
  if (session.feedback) return session.feedback as Feedback

  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (!history || history.length === 0) return null

  const transcript = history
    .map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`)
    .join('\n\n')

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    maxOutputTokens: 600,
    system: `You are a senior engineering manager scoring a technical interview. Return ONLY valid JSON, no commentary.`,
    messages: [{
      role: 'user',
      content: `Score this interview transcript and return a JSON object with exactly these fields:
- communication: integer 1-5 — how clearly they explained their reasoning and approach. This is a text-based interface, so treat every candidate response as if it were spoken aloud. NEVER mention spelling, typos, or text clarity anywhere in the observations or improvements arrays. Only judge whether the ideas and logic were communicated clearly.
- problemSolving: integer 1-5 — quality of approach, edge case awareness, ability to optimize
- codeQuality: integer 1-5 — correctness, clarity, naming. Give 1 if no code was written.
- verdict: one of exactly "Not Ready", "Getting Close", or "Ready". Calibrate for a junior developer bar: if they reached correct working code (even with help), that is at least "Getting Close". "Ready" means minimal prompting needed and they knew complexity. "Not Ready" means they could not produce correct code or required constant leading.
- observations: array of exactly 2-3 short strings — concrete observations about what happened in this session (what they did well or got wrong)
- improvements: array of exactly 2-3 short strings — specific, actionable things they should practice before the next interview (e.g. "Practice stating time and space complexity immediately after writing code", "Dry-run your code on a small example before submitting")
- nextProblem: string — name of one specific LeetCode problem they should try next based on their gaps

Problem: ${session.problem}

Transcript:
${transcript}`,
    }],
  })

  let feedback: Feedback
  try {
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    feedback = JSON.parse(cleaned)
  } catch {
    console.error('[generateFeedback] failed to parse AI response for session', sessionId)
    return null
  }

  await supabase
    .from('sessions')
    .update({ feedback })
    .eq('id', sessionId)

  return feedback
}
