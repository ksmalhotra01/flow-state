'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import OAuthButtons from '@/app/components/OAuthButtons'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)
  const searchParams = useSearchParams()
  const oauthError = searchParams.get('error') === 'auth_failed'

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to FlowState</h1>
          <p className="mt-1 text-sm text-zinc-500">Enter your email and password below.</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-100"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:ring-zinc-100"
            />
          </div>

          {(state?.error || oauthError) && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {state?.error ?? 'Sign-in failed. Please try again.'}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <OAuthButtons />

        <p className="text-center text-sm text-zinc-500">
          No account?{' '}
          <Link href="/signup" className="font-medium text-zinc-900 underline dark:text-zinc-100">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
