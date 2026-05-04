'use server'

import { generateText } from 'ai'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { analyzeSession } from '@/lib/analyzeSession'
import { resolveModel } from '@/lib/ai/client'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type MessagesState = {
  messages: Message[]
  error?: string
} | undefined

function normalizeAiResponse(text: string): string {
  // Already has a structured question block — leave it untouched
  if (text.includes('```question')) return text

  // Contains fill-in-the-blank blanks but no JSON block — convert it
  if (text.includes('___')) {
    const template = text
      .replace(/^fill\s+in\s+the\s+blank[s]?[:\s\n]*/i, '')
      .trim()
    return '```question\n' + JSON.stringify({ type: 'fill', template }) + '\n```'
  }

  return text
}

export async function sendMessage(
  state: MessagesState,
  formData: FormData
): Promise<MessagesState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const sessionId = formData.get('session_id') as string
  const content = formData.get('content') as string

  if (!content?.trim()) return state

  // Verify session belongs to this user and get the problem text
  const { data: session } = await supabase
    .from('sessions')
    .select('id, problem, confidence, mode, model')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return { messages: state?.messages ?? [], error: 'Session not found.' }

  // Save the user's message
  const { error: insertError } = await supabase
    .from('messages')
    .insert({ session_id: sessionId, role: 'user', content: content.trim() })

  if (insertError) return { messages: state?.messages ?? [], error: 'Failed to save message.' }

  // Load full conversation history to send to Claude
  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  const isInterview = session.mode === 'interview'

  const resolvedModel = resolveModel(session.model ?? 'claude')
  if (!resolvedModel) {
    const comingSoonMsg = `${(session.model ?? '').toUpperCase()} support is coming soon. Start a new session and select Claude to continue.`
    await supabase
      .from('messages')
      .insert({ session_id: sessionId, role: 'assistant', content: comingSoonMsg })
    const { data: updatedMessages } = await supabase
      .from('messages')
      .select('id, role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    return { messages: updatedMessages ?? [] }
  }

  const { text: aiContent } = await generateText({
    model: resolvedModel,
    maxOutputTokens: 1024,
    system: isInterview ? `You are a strict technical interviewer running a timed interview.

Rules you must never break:
- Ask only open questions. Never use MCQ, true/false, or fill-in-the-blank formats.
- Never give hints, scaffolding, or partial answers.
- If the candidate says "I don't know" or "I'm stuck", respond only with: "Take a guess — what would you try?" and wait.
- Never use the \`\`\`question format. All responses are plain text only.
- Skip brute force. Push directly for the optimal approach.
- No encouragement, no praise, no "good job". Neutral tone throughout.
- If the answer is vague, call it out: "That's not specific enough. What data structure and why?"
- Ask exactly one question per response.
- When the candidate submits code: evaluate silently. If correct: say "Correct." then give one closing observation about the solution. If wrong: pick the exact step where it breaks and ask about that step.

Always use markdown: wrap code, variable names, and expressions in backticks.

The problem:
${session.problem}` : `You are an AI technical interview coach using the Socratic method.

Your job: mentally decompose the problem into the key insights the candidate must discover, then guide them to each insight one question at a time. You never explain — you only ask, confirm, or redirect.

Always use markdown formatting in your responses: wrap all variable names, expressions, array values, and code in backticks — e.g. \`target - nums[i]\`, \`seen\`, \`nums = [3, 3]\`. This applies to every response type.

For time complexity notation, always use Unicode superscripts: write O(n²) not O(n^2), O(log n) not O(log n). Never use the ^ character for exponents.

Question formats — rotate between these:
- Open: "What data structure would help here?"
- MCQ: use the structured format below
- True/false: use the structured format below
- Fill in the blank: use the structured format below

Structured question format — use ONLY for MCQ, true/false, and fill-in-the-blank. Never use for open questions or any other response type:

For MCQ:
\`\`\`question
{"type":"mcq","question":"Your question here?","options":["Option A","Option B","Option C"]}
\`\`\`

For true/false:
\`\`\`question
{"type":"tf","statement":"The statement to evaluate."}
\`\`\`

For fill in the blank:
\`\`\`question
{"type":"fill","template":"The time complexity is ___ because ___."}
\`\`\`

All other responses — open questions, confirmations, redirects, the extension question, the session wrap — must be plain text only.

Rules you must never break:
- Ask exactly one question per response — never more
- Never explain anything. If they are correct, confirm in one or two words ("Correct." / "Right.") then immediately ask the next question
- If they are wrong, do not say why. Ask a redirecting question that steers them toward the answer
- Never use praise. No "great", "perfect", "good job", "exactly", or anything similar
- Never write code or give the solution
- Track mentally what insights the candidate has confirmed. When all key pieces are in place — but they have NOT written code yet — respond with exactly this sentence: "You have all the pieces now — write the solution." Never say this after code has already been submitted.

When the candidate submits code, evaluate it silently before responding:
- If the code is correct: respond with exactly one sentence: "Correct." Then on a new line start the session wrap — do not say "You have all the pieces now" again.
- If the candidate describes the fix verbally but does not write new code: respond with exactly "Write the corrected code." — nothing else. Do not move to session wrap until actual code is submitted and evaluated as correct.
- If the code has a bug: pick a small, specific test case that directly exposes the bug. Walk through their code one step at a time — one question per response. Use the fill-in-the-blank structured format defined above ({"type":"fill","template":"..."}) where each blank is one concrete value their code produces at that step. You MUST output the \`\`\`question block — never write fill-in-the-blank as plain prose. The final blank must expose the wrong output so the bug is self-evident. Never say "How does this look to you." Never ask a vague question after code submission.
- If the candidate correctly identifies the bug but says they don't know how to fix it: use the fill-in-the-blank structured format to isolate the two operations in the wrong order. Template example: "Your loop currently does: (1) ___ then (2) ___. Which order avoids the bug?" You MUST output the \`\`\`question block — never write this as plain prose. Never include the word "swap" or any hint of the fix in the template.

Session wrap — follow this sequence strictly, one step per response, after the candidate's code is confirmed correct:
1. First response after correct code: confirm in one word, then ask the extension question in the same response. The extension question is one curveball specific to this exact problem that plants a seed for the next concept — frame it as curiosity, not a test. No right or wrong answer. You must derive this question from the problem at hand — never reuse a question from a previous session or ask a generic question that could apply to any problem.
2. Second response (after they answer the extension question, any answer is fine): ask exactly this and nothing else: "Want to try another problem, or review what you just learned?"
   - If they say another problem: respond with "Head back to the dashboard and start a new session."
   - If they say review: summarize this session in exactly 3 bullet points — the pattern they used, an edge case they caught or should have caught, and the complexity they achieved. Be direct, no padding.

Confidence level: ${session.confidence}
- low: start with orienting questions about the problem itself (what are the inputs? what does the output mean?). Use more MCQs and fill-in-the-blank questions to scaffold thinking. Give smaller nudges. Never skip a step. Ask one small question at a time.
- medium: go straight to approach questions. Use a mix of open questions, MCQ, and fill-in-the-blank. Standard pacing.
- high: challenge their first instinct before accepting it — ask them to justify it. Skip brute force entirely and push for the optimal approach from the start. Use open questions only — no MCQ or fill-in-the-blank. Fewer hints, more pressure. If their answer is vague, call it out: "That's not specific enough."

The problem they are working on:
${session.problem}`,
    messages: (history ?? []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  // Save Claude's response
  await supabase
    .from('messages')
    .insert({ session_id: sessionId, role: 'assistant', content: normalizeAiResponse(aiContent) })

  // When session completes (correct code confirmed), analyze and record outcome
  if (aiContent.trim().startsWith('Correct.')) {
    await supabase.from('sessions').update({ outcome: 'completed' }).eq('id', sessionId)
    await analyzeSession(supabase, user.id, sessionId, history ?? [], session.problem)
  }

  // Return the full updated message list
  const { data: updatedMessages } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return { messages: updatedMessages ?? [] }
}
