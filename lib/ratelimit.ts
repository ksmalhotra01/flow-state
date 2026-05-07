import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const noopLimiter = { limit: async () => ({ success: true }) } as unknown as Ratelimit

function makeLimiter(prefix: string, tokens: number, window: string): Ratelimit {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return noopLimiter
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    prefix,
  })
}

// 30 messages per minute — generous for active chat
export const messageLimiter = makeLimiter('rl:msg', 30, '1 m')

// 10 feedback requests per hour — one per session end
export const feedbackLimiter = makeLimiter('rl:feedback', 10, '1 h')

// 10 new interview sessions per hour
export const interviewLimiter = makeLimiter('rl:interview', 10, '1 h')
