'use client'

import dynamic from 'next/dynamic'
import type { PatternStats } from './types'

const WeaknessClient = dynamic(() => import('./WeaknessClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-32 text-slate-500 text-sm">
      Loading charts…
    </div>
  ),
})

export default function WeaknessWrapper({ stats }: { stats: PatternStats[] }) {
  return <WeaknessClient stats={stats} />
}
