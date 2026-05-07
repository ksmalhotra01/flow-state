'use server'

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type InterviewSessionState = { error?: string } | undefined

const PATTERN_NAMES: Record<string, string> = {
  prefix_sum: 'Prefix Sum — uses a running cumulative sum to answer subarray or range queries in O(n). Example: pivot index, range sum, subarray sum equals k.',
  hashmap: 'Hash Maps — primary technique is a hash map or hash set for O(1) lookups (NOT arrays alone)',
  two_pointers: 'Two Pointers — left/right or slow/fast pointer technique on a sorted array or linked list',
  sliding_window: 'Sliding Window — variable or fixed-size window moving over a sequence',
  binary_search: 'Binary Search — halving the search space on a sorted structure',
  stack: 'Stack — LIFO stack for matching, ordering, or tracking nested structure',
  recursion: 'Recursion — problem solved by breaking into identical sub-problems without memoization',
  trees: 'Trees / Binary Trees — traversal, path problems, or properties of binary trees',
  graphs: 'Graphs / BFS / DFS — connectivity, shortest path, or component problems on a graph',
  dp: 'Dynamic Programming — overlapping sub-problems solved with memoization or tabulation',
  greedy: 'Greedy — locally optimal choices at each step that produce a globally optimal result',
  sorting: 'Sorting',
  bit_manipulation: 'Bit Manipulation',
  math: 'Math',
  strings: 'Strings — pattern matching, parsing, or manipulation of character sequences',
}

export async function startInterviewSession(
  state: InterviewSessionState,
  formData: FormData
): Promise<InterviewSessionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const difficulty = formData.get('difficulty') as string
  const patterns = formData.getAll('patterns') as string[]

  const VALID_DIFFICULTIES = ['junior', 'mid', 'senior']
  const VALID_PATTERNS = Object.keys(PATTERN_NAMES)

  if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty)) return { error: 'Please select a difficulty.' }
  if (patterns.length > 3) return { error: 'Select up to 3 patterns.' }
  if (patterns.some(p => !VALID_PATTERNS.includes(p))) return { error: 'Invalid pattern selected.' }

  const patternClause = patterns.length > 0
    ? `The problem MUST use one of these specific patterns as its PRIMARY technique — do not generate a problem that merely touches on it or uses the data structure incidentally:\n${patterns.map(p => `- ${PATTERN_NAMES[p]}`).join('\n')}`
    : 'Pick any common algorithm pattern.'

  let sessionId: string

  try {
    const { text: problem } = await generateText({
      model: anthropic('claude-sonnet-4-6'),
      temperature: 0.5,
      maxOutputTokens: 600,
      system: `You generate LeetCode-style coding problems. Return ONLY the problem text — no commentary, no explanation, no notes.

CRITICAL: When a pattern is specified, the PRIMARY solving technique must be exactly that pattern and nothing else. Do not generate a problem where the specified pattern is merely incidental or where a different pattern is actually needed to solve it optimally.

Pattern disambiguation (these are commonly confused — be precise):
- Two Pointers: requires TWO pointers moving through the array simultaneously (e.g. slow/fast, left/right). If a single traversal suffices, it is NOT two pointers.
- Prefix Sum: uses a running cumulative sum to avoid recomputing sums. "Sum to the left/right of index" is prefix sum, not two pointers.
- Hash Maps: the key insight is O(1) lookup via a hash map/set. If you can solve it without a hash map, it is NOT a hash map problem.
- Sliding Window: a window with two boundaries that expands/contracts. Not just any subarray problem.`,
      messages: [{
        role: 'user',
        content: `Generate a coding interview problem for a ${difficulty}-level developer.

Difficulty calibration — follow this strictly:
- junior: Easy LeetCode only. Single static array or string. One concept, one data structure, one pass. No streams, no dynamic updates, no nested structures, no variants. Examples of appropriate problems: Two Sum, Valid Anagram, Contains Duplicate, First Unique Character (static string only), Maximum Subarray.
- mid: Medium LeetCode. May combine two ideas or use trees/graphs/sliding window. Examples: Group Anagrams, Longest Substring Without Repeating Characters, Binary Tree Level Order Traversal.
- senior: Hard LeetCode. Non-obvious optimization, complex constraints, or advanced data structures. Examples: LRU Cache, Minimum Window Substring, Trapping Rain Water.
${patternClause}

Format exactly like this:
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
        patterns,
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
