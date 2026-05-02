'use server'

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type InterviewSessionState = { error?: string } | undefined

const PATTERN_NAMES: Record<string, string> = {
  arrays: 'Arrays',
  hashmap: 'Hash Maps',
  two_pointers: 'Two Pointers',
  sliding_window: 'Sliding Window',
  binary_search: 'Binary Search',
  stack: 'Stack',
  recursion: 'Recursion',
  trees: 'Trees / Binary Trees',
  graphs: 'Graphs / BFS / DFS',
  dp: 'Dynamic Programming',
  greedy: 'Greedy',
  sorting: 'Sorting',
  bit_manipulation: 'Bit Manipulation',
  math: 'Math',
  strings: 'Strings',
}

export async function startInterviewSession(
  state: InterviewSessionState,
  formData: FormData
): Promise<InterviewSessionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const difficulty = formData.get('difficulty') as string
  const pattern = formData.get('pattern') as string | null

  if (!difficulty) return { error: 'Please select a difficulty.' }

  const patternClause = pattern && pattern !== 'random'
    ? `The problem must use the ${PATTERN_NAMES[pattern] ?? pattern} pattern.`
    : 'Pick any common algorithm pattern.'

  let sessionId: string

  try {
    const { text: problem } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 600,
      system: `You generate LeetCode-style coding problems. Return ONLY the problem text, no commentary.`,
      messages: [{
        role: 'user',
        content: `Generate a ${difficulty} difficulty coding interview problem.
${patternClause}

Format exactly like this (no markdown, no extra text):
[Problem Name] (#[LeetCode number if applicable])

[Full problem description in plain English]

Example 1:
Input: [example input]
Output: [example output]
Explanation: [brief explanation]

Example 2:
Input: [example input]
Output: [example output]

Constraints:
- [constraint 1]
- [constraint 2]`,
      }],
    })

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        problem: problem.trim(),
        confidence: 'high',
        mode: 'interview',
        difficulty,
      })
      .select('id')
      .single()

    if (error) return { error: 'Failed to create session. Please try again.' }

    sessionId = data.id
  } catch {
    return { error: 'Failed to generate problem. Please try again.' }
  }

  redirect(`/session/${sessionId}/think`)
}
