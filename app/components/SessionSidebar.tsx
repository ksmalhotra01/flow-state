'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { PATTERN_LABELS, type Pattern } from '@/lib/analyzeSession'

const PATTERN_COLORS: Record<string, string> = {
  arrays:           'bg-blue-900/60 text-blue-300',
  hashmap:          'bg-green-900/60 text-green-300',
  two_pointers:     'bg-purple-900/60 text-purple-300',
  sliding_window:   'bg-cyan-900/60 text-cyan-300',
  binary_search:    'bg-yellow-900/60 text-yellow-300',
  stack:            'bg-orange-900/60 text-orange-300',
  recursion:        'bg-pink-900/60 text-pink-300',
  trees:            'bg-emerald-900/60 text-emerald-300',
  graphs:           'bg-teal-900/60 text-teal-300',
  dp:               'bg-red-900/60 text-red-300',
  greedy:           'bg-lime-900/60 text-lime-300',
  sorting:          'bg-amber-900/60 text-amber-300',
  bit_manipulation: 'bg-violet-900/60 text-violet-300',
  math:             'bg-sky-900/60 text-sky-300',
  strings:          'bg-rose-900/60 text-rose-300',
}

export type SessionSummary = {
  id: string
  problem: string
  created_at: string
  confidence?: string
  pattern?: string
}

type Props = {
  sessions: SessionSummary[]
  currentSessionId: string
  isVisible: boolean
  onToggle: () => void
}

function getProblemTitle(problem: string): string {
  const firstLine = problem.split('\n')[0].trim()
  return firstLine.length > 45 ? firstLine.slice(0, 45) + '…' : firstLine
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupSessions(sessions: SessionSummary[]) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const weekAgoStart = new Date(todayStart)
  weekAgoStart.setDate(weekAgoStart.getDate() - 6)

  const groups = [
    { label: 'Today', items: [] as SessionSummary[] },
    { label: 'This week', items: [] as SessionSummary[] },
    { label: 'Earlier', items: [] as SessionSummary[] },
  ]

  for (const session of sessions) {
    const date = new Date(session.created_at)
    if (date >= todayStart) {
      groups[0].items.push(session)
    } else if (date >= weekAgoStart) {
      groups[1].items.push(session)
    } else {
      groups[2].items.push(session)
    }
  }

  return groups.filter(g => g.items.length > 0)
}

export default function SessionSidebar({ sessions, currentSessionId, isVisible, onToggle }: Props) {
  const [width, setWidth] = useState(256)
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(256)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isResizing.current) return
      const delta = e.clientX - startX.current
      setWidth(Math.max(180, Math.min(480, startWidth.current + delta)))
    }
    function onMouseUp() {
      if (!isResizing.current) return
      isResizing.current = false
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  function startResize(e: React.MouseEvent) {
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
    e.preventDefault()
  }

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        title="Show session history"
        className="flex w-8 shrink-0 items-start justify-center border-r border-slate-800 bg-slate-900 pt-4 text-lg text-slate-600 hover:text-slate-400 transition-colors"
      >
        ›
      </button>
    )
  }

  const groups = groupSessions(sessions)

  return (
    <div
      style={{ width }}
      className="relative flex shrink-0 flex-col border-r border-slate-800 bg-slate-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <span className="text-sm font-bold tracking-wide text-slate-100">
          Sessions
        </span>
        <button
          onClick={onToggle}
          title="Hide session history"
          className="text-slate-600 hover:text-slate-400 transition-colors"
        >
          ‹
        </button>
      </div>

      {/* New session button */}
      <div className="border-b border-slate-800 px-3 py-3">
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 transition-colors hover:border-indigo-500 hover:text-indigo-400"
        >
          + New session
        </Link>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto py-2">
        {groups.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-slate-600">No sessions yet.</p>
        )}

        {groups.map((group) => (
          <div key={group.label} className="mb-2">
            <p className="px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
              {group.label}
            </p>
            {group.items.map((session) => {
              const isActive = session.id === currentSessionId
              return (
                <Link
                  key={session.id}
                  href={`/session/${session.id}/think`}
                  className={`mx-2 mb-0.5 block rounded-lg border px-3 py-2.5 transition-colors ${
                    isActive
                      ? 'border-indigo-700 bg-indigo-950'
                      : 'border-transparent hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <p className={`truncate text-xs font-medium leading-snug ${
                    isActive ? 'text-indigo-100' : 'text-slate-200'
                  }`}>
                    {getProblemTitle(session.problem)}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">{formatDate(session.created_at)}</span>
                    {session.pattern && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PATTERN_COLORS[session.pattern] ?? 'bg-slate-800 text-slate-400'}`}>
                        {PATTERN_LABELS[session.pattern as Pattern] ?? session.pattern}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize bg-transparent hover:bg-indigo-500/40 transition-colors"
      />
    </div>
  )
}
