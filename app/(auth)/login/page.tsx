'use client'

import { Suspense } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import OAuthButtons from '@/app/components/OAuthButtons'

function OAuthErrorBanner() {
  const searchParams = useSearchParams()
  if (searchParams.get('error') !== 'auth_failed') return null
  return (
    <p className="rounded-xl border border-red-800/50 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
      Sign-in failed. Please try again.
    </p>
  )
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950">

      <div className="w-full max-w-sm px-4">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FlowState</span>
          </div>
          <p className="text-sm text-stone-500">Coding interview prep that teaches you to think</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-stone-100">Sign in to your account</h1>
            <p className="mt-1 text-sm text-stone-500">Welcome back. Let's get to work.</p>
          </div>

          <Suspense fallback={null}>
            <OAuthErrorBanner />
          </Suspense>

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-stone-500">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-stone-500">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-sm text-stone-100 placeholder-stone-600 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {state?.error && (
              <p className="rounded-xl border border-red-800/50 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
            >
              {pending ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <OAuthButtons />

          <p className="mt-6 text-center text-sm text-stone-500">
            No account?{' '}
            <Link href="/signup" className="font-semibold text-orange-400 transition-colors hover:text-orange-300">
              Sign up free
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
