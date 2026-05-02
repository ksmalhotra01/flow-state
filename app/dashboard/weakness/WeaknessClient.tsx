'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PatternStats } from './types'
import type { BreakdownPoint } from '@/lib/analyzeSession'

const BREAKDOWN_COLORS: Record<BreakdownPoint, { bg: string; text: string; label: string }> = {
  pattern_identification: { bg: 'bg-red-950', text: 'text-red-400', label: 'Identifying Pattern' },
  brute_force: { bg: 'bg-orange-950', text: 'text-orange-400', label: 'Brute Force' },
  optimization: { bg: 'bg-orange-950', text: 'text-orange-400', label: 'Optimization' },
  edge_cases: { bg: 'bg-yellow-950', text: 'text-yellow-400', label: 'Edge Cases' },
  complexity_analysis: { bg: 'bg-yellow-950', text: 'text-yellow-400', label: 'Complexity Analysis' },
  coding: { bg: 'bg-green-950', text: 'text-green-400', label: 'Coding' },
}

const RECOMMENDATIONS: Record<BreakdownPoint, string> = {
  pattern_identification:
    'Before writing any code, spend 2 minutes asking: what data structure naturally fits this? Practice pattern recognition from the problem statement alone.',
  brute_force:
    'Always start with brute force, no matter how slow. A working solution gives you something concrete to optimize from.',
  optimization:
    'After brute force, ask: where is redundant work happening? Repeated lookups → hash map. Repeated range scans → sliding window.',
  edge_cases:
    'Before submitting, explicitly test: empty input, single element, duplicates, negatives, and maximum bounds. Write test cases first.',
  complexity_analysis:
    'For every solution, state time and space complexity before moving on. Count loops nested inside other loops.',
  coding:
    'Your conceptual understanding is strong. Focus on fluency — implement each pattern from scratch until it feels automatic.',
}

function TrendBadge({ trend }: { trend: PatternStats['trend'] }) {
  if (trend === 'improving')
    return <span className="text-xs font-semibold text-green-400">↑ Improving</span>
  if (trend === 'regressing')
    return <span className="text-xs font-semibold text-red-400">↓ Regressing</span>
  return <span className="text-xs font-semibold text-slate-500">→ Stable</span>
}

function BreakdownBadge({ bp }: { bp: string }) {
  const style = BREAKDOWN_COLORS[bp as BreakdownPoint] ?? {
    bg: 'bg-slate-800',
    text: 'text-slate-400',
    label: bp,
  }
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}

export default function WeaknessClient({ stats }: { stats: PatternStats[] }) {
  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="mb-4 text-4xl">📊</div>
        <p className="text-lg font-semibold text-slate-200">No data yet</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Complete a session and submit correct code — the AI will analyze your performance and
          populate this profile automatically.
        </p>
      </div>
    )
  }

  const radarData = stats.map(s => ({
    pattern: s.displayName,
    strength: s.strengthScore,
    fullMark: 100,
  }))

  const top3 = stats.slice(0, 3)
  const weakest = stats[0]
  const recommendation =
    RECOMMENDATIONS[weakest.mostCommonBreakdown as BreakdownPoint] ??
    RECOMMENDATIONS.optimization

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Weakness Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          Based on {stats.reduce((s, p) => s + p.totalSessions, 0)} analyzed sessions across{' '}
          {stats.length} pattern{stats.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Radar + Top 3 side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Radar chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            Pattern Strength
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis
                dataKey="pattern"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Radar
                name="Strength"
                dataKey="strength"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                }}
                formatter={(value) => [`${Number(value)}%`, 'Strength']}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-slate-600">
            Higher = stronger. Based on hint count per session.
          </p>
        </div>

        {/* Top 3 weakest */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Top Weaknesses
          </p>
          {top3.map((p, i) => (
            <div
              key={p.pattern}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">#{i + 1}</span>
                  <span className="font-semibold text-slate-100">{p.displayName}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs font-mono text-indigo-300">
                    avg {p.avgHintCount} hints
                  </span>
                </div>
                <TrendBadge trend={p.trend} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Breaks down at:</span>
                <BreakdownBadge bp={p.mostCommonBreakdown} />
              </div>

              {/* Mini bar chart — hint counts for last 5 sessions */}
              {p.last5.length > 1 && (
                <div>
                  <p className="mb-1 text-xs text-slate-600">Last {p.last5.length} sessions</p>
                  <BarChart
                    width={220}
                    height={56}
                    data={p.last5}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    <XAxis dataKey="n" hide />
                    <Bar dataKey="hints" fill="#6366f1" radius={[2, 2, 0, 0]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '0.5rem',
                        fontSize: '0.7rem',
                      }}
                      formatter={(v) => [Number(v), 'hints']}
                    />
                  </BarChart>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* All patterns table */}
      {stats.length > 3 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <p className="border-b border-slate-800 px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            All Patterns
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                <th className="px-5 py-2 font-medium">Pattern</th>
                <th className="px-5 py-2 font-medium">Sessions</th>
                <th className="px-5 py-2 font-medium">Avg Hints</th>
                <th className="px-5 py-2 font-medium">Breaks at</th>
                <th className="px-5 py-2 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(p => (
                <tr key={p.pattern} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-5 py-2.5 font-medium text-slate-200">{p.displayName}</td>
                  <td className="px-5 py-2.5 text-slate-400">{p.totalSessions}</td>
                  <td className="px-5 py-2.5 font-mono text-indigo-300">{p.avgHintCount}</td>
                  <td className="px-5 py-2.5">
                    <BreakdownBadge bp={p.mostCommonBreakdown} />
                  </td>
                  <td className="px-5 py-2.5">
                    <TrendBadge trend={p.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recommendation */}
      <div className="rounded-2xl border border-indigo-800 bg-indigo-950/40 p-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-400">
          Recommended Focus
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-100">
          {weakest.displayName} — {weakest.breakdownLabel}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{recommendation}</p>
      </div>

    </div>
  )
}
