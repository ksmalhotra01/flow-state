'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { createSession } from '@/app/actions/sessions'
import Nav from '@/app/components/Nav'
import SessionSidebar, { type SessionSummary } from '@/app/components/SessionSidebar'
import { AI_MODELS, MODEL_LABELS, isComingSoon, type AIModel } from '@/lib/ai/client'

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

        <SessionSidebar
          sessions={sessions}
          currentSessionId=""
          isVisible={true}
          onToggle={() => {}}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-12">

            {/* Mode selector — top of page, most prominent element */}
            <div className="mb-12">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Choose a mode
              </p>
              <div className="grid grid-cols-2 gap-4">

                <a
                  href="#prep"
                  className="group flex flex-col rounded-2xl border border-slate-700 bg-slate-900 p-6 transition-colors hover:border-indigo-500 hover:bg-indigo-950/30"
                >
                  <span className="mb-2 text-2xl">📚</span>
                  <span className="text-base font-semibold text-slate-100">Prep Mode</span>
                  <span className="mt-1 text-xs leading-relaxed text-slate-400">
                    Guided learning with MCQs, hints, and fill-in-the-blank. No time pressure.
                  </span>
                </a>

                <Link
                  href="/dashboard/interview"
                  className="group flex flex-col rounded-2xl border border-slate-700 bg-slate-900 p-6 transition-colors hover:border-red-500 hover:bg-red-950/20"
                >
                  <span className="mb-2 text-2xl">⏱️</span>
                  <span className="text-base font-semibold text-slate-100">Interview Mode</span>
                  <span className="mt-1 text-xs leading-relaxed text-slate-400">
                    30-minute timer, AI-generated problem, strict interviewer. No hints.
                  </span>
                </Link>

              </div>
            </div>

            {/* Prep Mode form */}
            <div id="prep">
              <div className="mb-8">
                <h2 className="text-xl font-semibold tracking-tight text-slate-100">Prep Mode</h2>
                <p className="mt-1 text-slate-400 text-sm">Paste a problem, then walk through your thinking.</p>
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
                    placeholder="Paste a problem, or just type a name — 'Two Sum', 'LeetCode 1', 'easy sliding window'…"
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

                <div className="space-y-2">
                  <label htmlFor="model" className="text-sm font-medium text-slate-300">
                    AI model
                  </label>
                  <div className="flex gap-2">
                    {AI_MODELS.map((m: AIModel) => (
                      <label
                        key={m}
                        className={`relative flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs transition-colors has-checked:border-indigo-500 has-checked:bg-indigo-950 ${
                          isComingSoon(m) ? 'opacity-40 cursor-not-allowed' : 'hover:border-slate-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="model"
                          value={m}
                          defaultChecked={m === 'claude'}
                          disabled={isComingSoon(m)}
                          className="sr-only"
                        />
                        <span className="font-medium text-slate-200">{MODEL_LABELS[m]}</span>
                        {isComingSoon(m) && (
                          <span className="text-slate-500">Soon</span>
                        )}
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
                  {pending ? 'Preparing problem…' : 'Start thinking →'}
                </button>

              </form>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
