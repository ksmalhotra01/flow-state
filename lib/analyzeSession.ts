import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { SupabaseClient } from '@supabase/supabase-js'

export const PATTERNS = [
  'arrays', 'hashmap', 'two_pointers', 'sliding_window', 'binary_search',
  'stack', 'recursion', 'trees', 'graphs', 'dp', 'greedy', 'sorting',
  'bit_manipulation', 'math', 'strings',
] as const

export const BREAKDOWN_POINTS = [
  'pattern_identification', 'brute_force', 'optimization',
  'edge_cases', 'complexity_analysis', 'coding',
] as const

export type Pattern = typeof PATTERNS[number]
export type BreakdownPoint = typeof BREAKDOWN_POINTS[number]

export const PATTERN_LABELS: Record<Pattern, string> = {
  arrays: 'Arrays',
  hashmap: 'Hash Map',
  two_pointers: 'Two Pointers',
  sliding_window: 'Sliding Window',
  binary_search: 'Binary Search',
  stack: 'Stack',
  recursion: 'Recursion',
  trees: 'Trees',
  graphs: 'Graphs',
  dp: 'Dynamic Programming',
  greedy: 'Greedy',
  sorting: 'Sorting',
  bit_manipulation: 'Bit Manipulation',
  math: 'Math',
  strings: 'Strings',
}

export const BREAKDOWN_LABELS: Record<BreakdownPoint, string> = {
  pattern_identification: 'Identifying Pattern',
  brute_force: 'Brute Force',
  optimization: 'Optimization',
  edge_cases: 'Edge Cases',
  complexity_analysis: 'Complexity Analysis',
  coding: 'Coding',
}

export async function analyzeSession(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  messages: { role: string; content: string }[],
  problem: string
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('weakness_profile')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle()
    if (existing) return

    // Count AI turns before the first code submission
    let hintCount = 0
    for (const msg of messages) {
      if (msg.role === 'user' && msg.content.includes('```')) break
      if (msg.role === 'assistant') hintCount++
    }

    const conversationText = messages
      .slice(0, 20)
      .map(m => `${m.role === 'user' ? 'USER' : 'AI'}: ${m.content.slice(0, 300)}`)
      .join('\n\n')

    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 80,
      system: 'Return ONLY valid JSON, no markdown, no explanation.',
      messages: [{
        role: 'user',
        content: `Problem: "${problem.slice(0, 200)}"

Conversation:
${conversationText}

Return exactly: {"pattern":"ONE_OF[${PATTERNS.join('|')}]","breakdown_point":"ONE_OF[${BREAKDOWN_POINTS.join('|')}]"}`,
      }],
    })

    const clean = text.replace(/```json\n?|```\n?/g, '').trim()
    const result = JSON.parse(clean) as { pattern: string; breakdown_point: string }

    const pattern: Pattern = (PATTERNS as readonly string[]).includes(result.pattern)
      ? result.pattern as Pattern : 'arrays'
    const breakdownPoint: BreakdownPoint = (BREAKDOWN_POINTS as readonly string[]).includes(result.breakdown_point)
      ? result.breakdown_point as BreakdownPoint : 'optimization'

    await supabase
      .from('weakness_profile')
      .upsert(
        { user_id: userId, session_id: sessionId, pattern, hint_count: hintCount, breakdown_point: breakdownPoint },
        { onConflict: 'session_id' }
      )
  } catch (err) {
    console.error('[analyzeSession] failed for session', sessionId, err)
  }
}
