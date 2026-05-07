'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { startInterviewSession } from '@/app/actions/interviewSession'
import Nav from '@/app/components/Nav'

const DIFFICULTIES = [
  { value: 'junior', label: 'Junior', description: 'New grad or < 2 years experience', color: 'hover:border-green-500 has-checked:border-green-500 has-checked:bg-green-950/30' },
  { value: 'mid', label: 'Mid', description: '2–5 years, mid-level roles', color: 'hover:border-yellow-500 has-checked:border-yellow-500 has-checked:bg-yellow-950/30' },
  { value: 'senior', label: 'Senior', description: '5+ years, staff / FAANG bar', color: 'hover:border-red-500 has-checked:border-red-500 has-checked:bg-red-950/30' },
]

const PATTERNS = [
  { value: 'prefix_sum', label: 'Prefix Sum' },
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

const MAX_PATTERNS = 3

export default function InterviewSetupClient() {
  const [state, action, pending] = useActionState(startInterviewSession, undefined)
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function toggle(value: string) {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : prev.length < MAX_PATTERNS ? [...prev, value] : prev
    )
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const triggerLabel = selected.length === 0
    ? 'Any pattern'
    : selected.map(v => PATTERNS.find(p => p.value === v)?.label).join(', ')

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
              <p className="text-sm font-medium text-slate-300">
                Pattern <span className="text-slate-500">(optional, pick up to 3)</span>
              </p>

              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setOpen(prev => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm transition-colors hover:border-slate-500"
                >
                  <span className={selected.length === 0 ? 'text-slate-500' : 'text-slate-200'}>
                    {triggerLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    {selected.length > 0 && (
                      <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                        {selected.length}/{MAX_PATTERNS}
                      </span>
                    )}
                    <svg className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>

                {open && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl">
                    {PATTERNS.map(({ value, label }) => {
                      const isSelected = selected.includes(value)
                      const isDisabled = !isSelected && selected.length >= MAX_PATTERNS
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => toggle(value)}
                          className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors
                            ${isSelected ? 'text-indigo-300' : isDisabled ? 'cursor-not-allowed text-slate-600' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                          <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'}`}>
                            {isSelected && (
                              <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          {label}
                        </button>
                      )
                    })}
                  </div>
                )}

                {selected.map(v => (
                  <input key={v} type="hidden" name="patterns" value={v} />
                ))}
              </div>

              {selected.length === 0 && (
                <p className="text-xs text-slate-500">Nothing selected — any pattern may appear.</p>
              )}
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
              <li>• AI acts as a fair interviewer — questions only, no scaffolding</li>
              <li>• If you say "I don't know", it will ask you to guess anyway</li>
              <li>• When time runs out, the session ends automatically</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
