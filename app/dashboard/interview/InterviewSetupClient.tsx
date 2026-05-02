'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { startInterviewSession } from '@/app/actions/interviewSession'
import Nav from '@/app/components/Nav'

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', description: 'Arrays, basic hash maps, simple loops', color: 'hover:border-green-500 has-checked:border-green-500 has-checked:bg-green-950/30' },
  { value: 'medium', label: 'Medium', description: 'Sliding window, two pointers, trees', color: 'hover:border-yellow-500 has-checked:border-yellow-500 has-checked:bg-yellow-950/30' },
  { value: 'hard', label: 'Hard', description: 'DP, graphs, complex optimizations', color: 'hover:border-red-500 has-checked:border-red-500 has-checked:bg-red-950/30' },
]

const PATTERNS = [
  { value: 'random', label: 'Random' },
  { value: 'arrays', label: 'Arrays' },
  { value: 'hashmap', label: 'Hash Map' },
  { value: 'two_pointers', label: 'Two Pointers' },
  { value: 'sliding_window', label: 'Sliding Window' },
  { value: 'binary_search', label: 'Binary Search' },
  { value: 'stack', label: 'Stack' },
  { value: 'recursion', label: 'Recursion' },
  { value: 'trees', label: 'Trees' },
  { value: 'graphs', label: 'Graphs' },
  { value: 'dp', label: 'Dynamic Programming' },
  { value: 'greedy', label: 'Greedy' },
  { value: 'strings', label: 'Strings' },
]

export default function InterviewSetupClient() {
  const [state, action, pending] = useActionState(startInterviewSession, undefined)

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-4 py-16">

          <div className="mb-2">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to dashboard
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Interview Mode</h1>
            <p className="mt-2 text-sm text-slate-400">
              You'll get 30 minutes. The problem is generated fresh — you won't have seen it before.
              No hints. No fill-in-the-blank. Just you and the problem.
            </p>
          </div>

          <form action={action} className="space-y-8">

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-300">Difficulty</p>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map(({ value, label, description, color }) => (
                  <label
                    key={value}
                    className={`relative flex cursor-pointer flex-col rounded-xl border border-slate-700 bg-slate-800 p-4 transition-colors ${color}`}
                  >
                    <input type="radio" name="difficulty" value={value} className="sr-only" />
                    <span className="text-sm font-semibold text-slate-200">{label}</span>
                    <span className="mt-1 text-xs text-slate-400">{description}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="pattern" className="text-sm font-medium text-slate-300">
                Pattern <span className="text-slate-500">(optional)</span>
              </label>
              <select
                id="pattern"
                name="pattern"
                defaultValue="random"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {PATTERNS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-400">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {pending ? 'Generating problem…' : 'Start Interview →'}
            </button>

          </form>

          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">What to expect</p>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• 30-minute countdown starts the moment the problem appears</li>
              <li>• AI acts as a strict interviewer — questions only, no scaffolding</li>
              <li>• If you say "I don't know", it will ask you to guess anyway</li>
              <li>• When time runs out, the session ends automatically</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
