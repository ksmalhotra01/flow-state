'use client'

import Link from 'next/link'
import { useActionState, useState, useEffect } from 'react'
import { createSession } from '@/app/actions/sessions'
import Nav from '@/app/components/Nav'
import SessionSidebar, { type SessionSummary } from '@/app/components/SessionSidebar'
import { AI_MODELS, MODEL_LABELS, isComingSoon, type AIModel } from '@/lib/ai/client'

const confidenceLevels = [
  { value: 'low', label: 'Low', description: "Not sure where to start" },
  { value: 'medium', label: 'Medium', description: 'I have some ideas' },
  { value: 'high', label: 'High', description: 'I know the approach' },
]

export default function DashboardClient({ sessions }: { sessions: SessionSummary[] }) {
  const [state, action, pending] = useActionState(createSession, undefined)
  const [problemValue, setProblemValue] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const p = params.get('problem')
    if (p) {
      setProblemValue(p)
      document.getElementById('prep')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200">

      {pending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-950/95 backdrop-blur">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-sm font-medium text-slate-300">Preparing your problem…</p>
          <p className="text-xs text-slate-600">This usually takes a few seconds</p>
        </div>
      )}

      <Nav />

      <div className="flex flex-1 overflow-hidden">

        <SessionSidebar
          sessions={sessions}
          currentSessionId=""
          isVisible={true}
          onToggle={() => {}}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-8">

            {/* Mode selector */}
            <div className="mb-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Choose a mode
              </p>
              <div className="grid grid-cols-2 gap-4">

                <a
                  href="#prep"
                  className="group flex flex-col rounded-2xl border border-slate-700 bg-slate-900 p-6 transition-all hover:border-indigo-500 hover:bg-indigo-950/20 hover:shadow-lg hover:shadow-indigo-950/30"
                >
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 transition-colors group-hover:bg-indigo-900">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-slate-100">Prep Mode</span>
                  <span className="mt-1 text-xs leading-relaxed text-slate-400">
                    Guided learning with hints, MCQs, and fill-in-the-blank. No time pressure.
                  </span>
                </a>

                <Link
                  href="/dashboard/interview"
                  className="group flex flex-col rounded-2xl border border-slate-700 bg-slate-900 p-6 transition-all hover:border-red-500 hover:bg-red-950/15 hover:shadow-lg hover:shadow-red-950/20"
                >
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/50 text-red-400 transition-colors group-hover:bg-red-950">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-slate-100">Interview Mode</span>
                  <span className="mt-1 text-xs leading-relaxed text-slate-400">
                    30-minute timer, AI-generated problem, strict interviewer. No hints.
                  </span>
                </Link>

              </div>
            </div>

            {/* Prep Mode form */}
            <div id="prep" className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold tracking-tight text-slate-100">Prep Mode</h2>
                <p className="mt-1 text-sm text-slate-500">Paste a problem, then walk through your thinking.</p>
              </div>

              <form action={action} className="space-y-5">

                <div className="space-y-2">
                  <label htmlFor="problem" className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Problem
                  </label>
                  <textarea
                    id="problem"
                    name="problem"
                    rows={5}
                    value={problemValue}
                    onChange={e => setProblemValue(e.target.value)}
                    placeholder="Paste a problem, or just type a name — 'Two Sum', 'LeetCode 1', 'easy sliding window'…"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder-slate-600 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Confidence</p>
                  <div className="grid grid-cols-3 gap-3">
                    {confidenceLevels.map(({ value, label, description }) => (
                      <label
                        key={value}
                        className="relative flex cursor-pointer flex-col rounded-xl border border-slate-700 bg-slate-800 p-4 transition-colors hover:border-slate-600 has-checked:border-indigo-500 has-checked:bg-indigo-950/40"
                      >
                        <input type="radio" name="confidence" value={value} className="sr-only" />
                        <span className="text-sm font-semibold text-slate-200">{label}</span>
                        <span className="mt-1 text-xs text-slate-500">{description}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">AI Model</p>
                  <div className="flex gap-2">
                    {AI_MODELS.map((m: AIModel) => (
                      <label
                        key={m}
                        className={`relative flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs transition-colors has-checked:border-indigo-500 has-checked:bg-indigo-950/40 ${
                          isComingSoon(m) ? 'opacity-40 cursor-not-allowed' : 'hover:border-slate-600'
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
                          <span className="text-slate-600">Soon</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {state?.error && (
                  <p className="rounded-xl border border-red-800/50 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
                    {state.error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
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
