'use client'

import { useEffect, useRef, useState } from 'react'

export default function InterviewTimer({
  durationSeconds = 1800,
  onTimeUp,
}: {
  durationSeconds?: number
  onTimeUp: () => void
}) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const firedRef = useRef(false)

  // Tick the timer down
  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Fire onTimeUp once when remaining hits 0 — outside the updater so React stays happy
  useEffect(() => {
    if (remaining === 0 && !firedRef.current) {
      firedRef.current = true
      onTimeUp()
    }
  // onTimeUp intentionally excluded — captured once at mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  const colorClass =
    remaining <= 60
      ? 'text-red-400'
      : remaining <= 300
      ? 'text-yellow-400'
      : 'text-stone-200'

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-stone-500">Time</span>
      <span className={`font-mono text-base font-bold tabular-nums ${colorClass}`}>
        {display}
      </span>
    </div>
  )
}
