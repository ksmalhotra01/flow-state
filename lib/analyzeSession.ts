import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import type { SupabaseClient } from '@supabase/supabase-js'

export const PATTERNS = [
  'prefix_sum', 'hashmap', 'two_pointers', 'sliding_window', 'binary_search',
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
  prefix_sum: 'Prefix Sum',
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

// Called at session creation — classifies the pattern from problem text only,
// writes a placeholder record so the sidebar badge appears immediately.
// The full analyzeSession will overwrite this with real hint counts later.
export async function classifyPatternOnly(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  problem: string
): Promise<void> {
  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      temperature: 0.2,
      maxOutputTokens: 30,
      system: 'Return ONLY valid JSON, no markdown, no explanation.',
      messages: [{
        role: 'user',
        content: `Identify the PRIMARY algorithmic pattern for this coding problem.
Problem: "${problem.slice(0, 400)}"
Return exactly: {"pattern":"ONE_OF[${PATTERNS.join('|')}]"}`,
      }],
    })

    const clean = text.replace(/```json\n?|```\n?/g, '').trim()
    const result = JSON.parse(clean) as { pattern: string }
    const pattern: Pattern = (PATTERNS as readonly string[]).includes(result.pattern)
      ? result.pattern as Pattern : 'hashmap'

    await supabase
      .from('weakness_profile')
      .upsert(
        { user_id: userId, session_id: sessionId, pattern, hint_count: 0, breakdown_point: 'pattern_identification' },
        { onConflict: 'session_id' }
      )
  } catch (err) {
    console.error('[classifyPatternOnly] failed for session', sessionId, err)
  }
}

export async function analyzeSession(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  messages: { role: string; content: string }[],
  problem: string
): Promise<void> {
  try {
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
      temperature: 0.2,
      maxOutputTokens: 80,
      system: 'Return ONLY valid JSON, no markdown, no explanation.',
      messages: [{
        role: 'user',
        content: `Identify the PRIMARY algorithmic pattern used to solve this problem.

Pattern disambiguation (commonly confused):
- prefix_sum: uses a running cumulative sum to answer queries about subarrays or ranges. "Sum of elements to the left/right" is prefix_sum, NOT two_pointers.
- two_pointers: requires two pointers moving through a sequence simultaneously. Single traversal is NOT two_pointers.
- hashmap: primary insight is O(1) lookup via a hash map or hash set.
- sliding_window: a window with two boundaries that expands and contracts.

Problem: "${problem.slice(0, 200)}"

Conversation:
${conversationText}

Return exactly: {"pattern":"ONE_OF[${PATTERNS.join('|')}]","breakdown_point":"ONE_OF[${BREAKDOWN_POINTS.join('|')}]"}`,
      }],
    })

    const clean = text.replace(/```json\n?|```\n?/g, '').trim()
    const result = JSON.parse(clean) as { pattern: string; breakdown_point: string }

    const pattern: Pattern = (PATTERNS as readonly string[]).includes(result.pattern)
      ? result.pattern as Pattern : 'two_pointers'
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
