'use client'

import { useActionState, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { startInterviewSession } from '@/app/actions/interviewSession'
import Nav from '@/app/components/Nav'

const DIFFICULTIES = [
  { value: 'junior', label: 'Junior', description: 'New grad or < 2 years', color: 'hover:border-green-500 has-checked:border-green-500 has-checked:bg-green-950/30', accent: 'text-green-400', dot: 'bg-green-500' },
  { value: 'mid', label: 'Mid', description: '2–5 years, mid-level', color: 'hover:border-yellow-500 has-checked:border-yellow-500 has-checked:bg-yellow-950/30', accent: 'text-yellow-400', dot: 'bg-yellow-500' },
  { value: 'senior', label: 'Senior', description: '5+ years, FAANG bar', color: 'hover:border-red-500 has-checked:border-red-500 has-checked:bg-red-950/30', accent: 'text-red-400', dot: 'bg-red-500' },
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
    <div className="relative flex h-screen flex-col bg-stone-950 text-stone-200 overflow-hidden">

      {pending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-stone-950/95 backdrop-blur">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-500 animate-pulse [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-stone-500 animate-pulse [animation-delay:200ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-stone-500 animate-pulse [animation-delay:400ms]" />
          </div>
          <p className="text-sm font-medium text-stone-300">Generating your interview problem…</p>
          <p className="text-xs text-stone-600">Calibrating difficulty · This takes a few seconds</p>
        </div>
      )}

      <Nav />

      <div className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-4 py-16">

          <div className="mb-2">
            <Link href="/dashboard" className="text-xs text-stone-600 transition-colors hover:text-stone-400">
              ← Back to dashboard
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-100">Interview Mode</h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">
              30 minutes. Fresh problem. No hints. Just you and the clock.
            </p>
          </div>

          <form action={action} className="space-y-6">

            <div className="space-y-3">
              <p className="text-xs font-medium text-stone-500">Difficulty</p>
              <div className="grid grid-cols-3 gap-3">
                {DIFFICULTIES.map(({ value, label, description, color, accent, dot }) => (
                  <label
                    key={value}
                    className={`group relative flex cursor-pointer flex-col rounded-xl border border-stone-700 bg-stone-900 p-4 transition-all ${color}`}
                  >
                    <input type="radio" name="difficulty" value={value} className="sr-only" />
                    <div className={`mb-2 h-1.5 w-1.5 rounded-full ${dot} opacity-60 group-has-checked:opacity-100`} />
                    <span className="text-sm font-semibold text-stone-200">{label}</span>
                    <span className={`mt-1 text-xs ${accent} opacity-0 transition-opacity group-has-checked:opacity-100`}>{description}</span>
                    <span className={`mt-1 text-xs text-stone-500 group-has-checked:hidden`}>{description}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-stone-500">
                Pattern <span className="normal-case font-normal text-stone-600">(optional, up to 3)</span>
              </p>

              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setOpen(prev => !prev)}
                  className="flex w-full items-center justify-between rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-sm transition-colors hover:border-stone-600"
                >
                  <span className={selected.length === 0 ? 'text-stone-500' : 'text-stone-200'}>
                    {triggerLabel}
                  </span>
                  <div className="flex items-center gap-2">
                    {selected.length > 0 && (
                      <span className="font-mono text-xs text-stone-400">
                        {selected.length}/{MAX_PATTERNS}
                      </span>
                    )}
                    <svg className={`h-4 w-4 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>

                {open && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-stone-700 bg-stone-900 py-1 shadow-2xl shadow-black/50">
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
                            ${isSelected ? 'text-orange-300 bg-orange-950/40' : isDisabled ? 'cursor-not-allowed text-stone-700' : 'text-stone-300 hover:bg-stone-800'}`}
                        >
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-stone-600'}`}>
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
                <p className="text-xs text-stone-600">Nothing selected — any pattern may appear.</p>
              )}
            </div>

            {state?.error && (
              <p className="rounded-xl border border-red-800/50 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {pending ? 'Generating problem…' : 'Start Interview →'}
            </button>

          </form>

          {/* What to expect */}
          <div className="mt-8 rounded-xl border border-stone-800 bg-stone-900/60 p-5">
            <p className="mb-3 text-xs font-medium text-stone-500">What to expect</p>
            <ul className="space-y-2">
              {[
                '30-minute countdown starts the moment the problem appears',
                'AI acts as a fair but strict interviewer — questions only',
                'If you say "I don\'t know", it will ask you to guess anyway',
                'When time runs out, the session ends automatically',
              ].map((item, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-stone-500">
                  <span className="mt-0.5 shrink-0 text-stone-700">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  )
}
