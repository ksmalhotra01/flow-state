import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function reconstructProblem(
  input: string
): Promise<{ text: string; wasReconstructed: boolean }> {
  // Full problem already pasted — skip reconstruction
  const looksComplete = input.length > 200 && input.toLowerCase().includes('example')
  if (looksComplete) return { text: input, wasReconstructed: false }

  try {
    const { text } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      maxOutputTokens: 600,
      system: `You reconstruct coding problems from partial names or descriptions.
If given a full problem already, return it unchanged.
Otherwise, return the canonical full problem in this exact format (no markdown, no preamble):

[Problem Name] (#[number if LeetCode])

[Full description in plain English]

Example 1:
Input: [input]
Output: [output]
Explanation: [brief explanation]

Example 2:
Input: [input]
Output: [output]

Constraints:
- [constraint]
- [constraint]`,
      messages: [{
        role: 'user',
        content: input,
      }],
    })
    return { text: text.trim(), wasReconstructed: true }
  } catch {
    return { text: input, wasReconstructed: false }
  }
}
