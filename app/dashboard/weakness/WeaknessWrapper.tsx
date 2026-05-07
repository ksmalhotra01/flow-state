'use client'

import dynamic from 'next/dynamic'
import type { PatternStats } from './types'

function ChartSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="animate-pulse rounded bg-slate-800 h-72 w-full" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-800 bg-slate-900 h-28" />
          ))}
        </div>
      </div>
    </div>
  )
}

const WeaknessClient = dynamic(() => import('./WeaknessClient'), {
  ssr: false,
  loading: ChartSkeleton,
})

export default function WeaknessWrapper({ stats }: { stats: PatternStats[] }) {
  return <WeaknessClient stats={stats} />
}
