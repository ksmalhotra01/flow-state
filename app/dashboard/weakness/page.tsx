import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PATTERN_LABELS, BREAKDOWN_LABELS, type Pattern, type BreakdownPoint } from '@/lib/analyzeSession'
import Nav from '@/app/components/Nav'
import WeaknessWrapper from './WeaknessWrapper'
import type { PatternStats } from './types'

type WeaknessRow = {
  session_id: string
  pattern: string
  hint_count: number
  breakdown_point: string
  created_at: string
}

function computeStats(rows: WeaknessRow[], outcomeMap: Map<string, string>): PatternStats[] {
  const byPattern = new Map<string, WeaknessRow[]>()
  for (const row of rows) {
    if (!byPattern.has(row.pattern)) byPattern.set(row.pattern, [])
    byPattern.get(row.pattern)!.push(row)
  }

  const stats: PatternStats[] = []
  for (const [pattern, entries] of byPattern.entries()) {
    const allSorted = [...entries].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // Separate completed from abandoned/timed_out for scoring purposes
    const completedEntries = allSorted.filter(r => outcomeMap.get(r.session_id) === 'completed')
    const abandonedCount = allSorted.filter(
      r => outcomeMap.get(r.session_id) === 'abandoned' || outcomeMap.get(r.session_id) === 'timed_out'
    ).length

    // Use completed entries for strength scoring; fall back to all entries for older sessions without outcome
    const scoringEntries = completedEntries.length > 0 ? completedEntries : allSorted

    const avgHintCount =
      scoringEntries.reduce((s, r) => s + r.hint_count, 0) / scoringEntries.length
    const strengthScore = Math.max(0, Math.min(100, Math.round(100 - avgHintCount * 8)))

    const bpCounts = new Map<string, number>()
    for (const r of scoringEntries)
      bpCounts.set(r.breakdown_point, (bpCounts.get(r.breakdown_point) ?? 0) + 1)
    const mostCommonBreakdown = [...bpCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]

    const mid = Math.ceil(scoringEntries.length / 2)
    const firstHalf = scoringEntries.slice(0, mid)
    const secondHalf = scoringEntries.slice(mid)
    const firstAvg = firstHalf.reduce((s, r) => s + r.hint_count, 0) / firstHalf.length
    const secondAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((s, r) => s + r.hint_count, 0) / secondHalf.length
        : firstAvg
    const trend: PatternStats['trend'] =
      scoringEntries.length < 2 ? 'stable'
      : secondAvg < firstAvg - 0.5 ? 'improving'
      : secondAvg > firstAvg + 0.5 ? 'regressing'
      : 'stable'

    const last5 = scoringEntries.slice(-5).map((r, i) => ({ n: i + 1, hints: r.hint_count }))

    stats.push({
      pattern,
      displayName: PATTERN_LABELS[pattern as Pattern] ?? pattern,
      totalSessions: allSorted.length,
      completedCount: completedEntries.length,
      abandonedCount,
      avgHintCount: Math.round(avgHintCount * 10) / 10,
      strengthScore,
      mostCommonBreakdown,
      breakdownLabel: BREAKDOWN_LABELS[mostCommonBreakdown as BreakdownPoint] ?? mostCommonBreakdown,
      trend,
      last5,
    })
  }

  return stats.sort((a, b) => b.avgHintCount - a.avgHintCount)
}

export default async function WeaknessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('weakness_profile')
    .select('session_id, pattern, hint_count, breakdown_point, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch outcomes so we can separate completed vs abandoned sessions in scoring
  const { data: sessionOutcomes } = await supabase
    .from('sessions')
    .select('id, outcome')
    .eq('user_id', user.id)
    .not('outcome', 'is', null)

  const outcomeMap = new Map<string, string>(
    (sessionOutcomes ?? []).map(s => [s.id, s.outcome as string])
  )

  const stats = rows && rows.length > 0 ? computeStats(rows as WeaknessRow[], outcomeMap) : []

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <WeaknessWrapper stats={stats} />
      </div>
    </div>
  )
}
