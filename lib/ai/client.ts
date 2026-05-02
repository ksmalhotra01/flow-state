import { anthropic } from '@ai-sdk/anthropic'

export const AI_MODELS = ['claude', 'gpt-4', 'gemini'] as const
export type AIModel = typeof AI_MODELS[number]

export const MODEL_LABELS: Record<AIModel, string> = {
  claude: 'Claude (Opus)',
  'gpt-4': 'GPT-4',
  gemini: 'Gemini',
}

export function isComingSoon(model: AIModel): boolean {
  return model !== 'claude'
}

export function getAnthropicModel() {
  return anthropic('claude-opus-4-7')
}

// Returns null for unsupported models — caller should return "coming soon" message
export function resolveModel(model: string): ReturnType<typeof anthropic> | null {
  if (model === 'claude') return getAnthropicModel()
  return null
}
