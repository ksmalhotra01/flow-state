'use client'

import { useActionState } from 'react'
import { createSession } from '@/app/actions/sessions'

const confidenceLevels = [
  { value: 'low', label: 'Low', description: "I'm not sure where to start" },
  { value: 'medium', label: 'Medium', description: 'I have some ideas' },
  { value: 'high', label: 'High', description: 'I know how to approach this' },
]

export default function DashboardPage() {
  const [state, action, pending] = useActionState(createSession, undefined)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-2xl px-4 py-16">

        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">New session</h1>
          <p className="mt-2 text-zinc-500">Paste a problem, then walk through your thinking.</p>
        </div>

        <form action={action} className="space-y-8">

          {/* Problem input */}
          <div className="space-y-2">
            <label htmlFor="problem" className="text-sm font-medium">
              The problem
            </label>
            <textarea
              id="problem"
              name="problem"
              rows={10}
              placeholder="Paste the coding problem here..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-100"
            />
          </div>

          {/* Confidence selector */}
          <div className="space-y-3">
            <p className="text-sm font-medium">How confident are you?</p>
            <div className="grid grid-cols-3 gap-3">
              {confidenceLevels.map(({ value, label, description }) => (
                <label
                  key={value}
                  className="relative flex cursor-pointer flex-col rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 has-[:checked]:border-zinc-900 has-[:checked]:bg-zinc-900 has-[:checked]:text-white dark:border-zinc-700 dark:bg-zinc-900 dark:has-[:checked]:border-zinc-100 dark:has-[:checked]:bg-zinc-100 dark:has-[:checked]:text-zinc-900"
                >
                  <input
                    type="radio"
                    name="confidence"
                    value={value}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="mt-1 text-xs opacity-70">{description}</span>
                </label>
              ))}
            </div>
          </div>

          {state?.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {pending ? 'Starting session…' : 'Start thinking →'}
          </button>

        </form>
      </div>
    </div>
  )
}
