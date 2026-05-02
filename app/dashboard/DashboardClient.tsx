'use client'

import { useActionState } from 'react'
import { createSession } from '@/app/actions/sessions'
import Nav from '@/app/components/Nav'
import SessionSidebar, { type SessionSummary } from '@/app/components/SessionSidebar'

const confidenceLevels = [
  { value: 'low', label: 'Low', description: "I'm not sure where to start" },
  { value: 'medium', label: 'Medium', description: 'I have some ideas' },
  { value: 'high', label: 'High', description: 'I know how to approach this' },
]

export default function DashboardClient({ sessions }: { sessions: SessionSummary[] }) {
  const [state, action, pending] = useActionState(createSession, undefined)

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200">
      <Nav />

      <div className="flex flex-1 overflow-hidden">

        {/* Left: past sessions */}
        <SessionSidebar
          sessions={sessions}
          currentSessionId=""
          isVisible={true}
          onToggle={() => {}}
        />

        {/* Right: new session form */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-16">

            <div className="mb-10">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-100">New session</h1>
              <p className="mt-2 text-slate-400">Paste a problem, then walk through your thinking.</p>
            </div>

            <form action={action} className="space-y-8">

              <div className="space-y-2">
                <label htmlFor="problem" className="text-sm font-medium text-slate-300">
                  The problem
                </label>
                <textarea
                  id="problem"
                  name="problem"
                  rows={10}
                  placeholder="Paste the coding problem here..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">How confident are you?</p>
                <div className="grid grid-cols-3 gap-3">
                  {confidenceLevels.map(({ value, label, description }) => (
                    <label
                      key={value}
                      className="relative flex cursor-pointer flex-col rounded-xl border border-slate-700 bg-slate-800 p-4 hover:border-slate-500 has-checked:border-indigo-500 has-checked:bg-indigo-950"
                    >
                      <input
                        type="radio"
                        name="confidence"
                        value={value}
                        className="sr-only"
                      />
                      <span className="text-sm font-semibold text-slate-200">{label}</span>
                      <span className="mt-1 text-xs text-slate-400">{description}</span>
                    </label>
                  ))}
                </div>
              </div>

              {state?.error && (
                <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {pending ? 'Starting session…' : 'Start thinking →'}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
