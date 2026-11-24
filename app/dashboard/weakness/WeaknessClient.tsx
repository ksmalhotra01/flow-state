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

const PATTERN_DOT_COLORS: Record<string, string> = {
  arrays:           'bg-blue-400',
  hashmap:          'bg-green-400',
  two_pointers:     'bg-purple-400',
  sliding_window:   'bg-cyan-400',
  binary_search:    'bg-yellow-400',
  stack:            'bg-orange-400',
  recursion:        'bg-pink-400',
  trees:            'bg-emerald-400',
  graphs:           'bg-teal-400',
  dp:               'bg-red-400',
  greedy:           'bg-lime-400',
  sorting:          'bg-amber-400',
  bit_manipulation: 'bg-violet-400',
  math:             'bg-sky-400',
  strings:          'bg-rose-400',
}

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
  return <span className="text-xs font-semibold text-stone-500">→ Stable</span>
}

function BreakdownBadge({ bp }: { bp: string }) {
  const style = BREAKDOWN_COLORS[bp as BreakdownPoint] ?? {
    bg: 'bg-stone-800',
    text: 'text-stone-400',
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
        <p className="text-base font-medium text-stone-300">No data yet</p>
        <p className="mt-2 max-w-sm text-sm text-stone-500">
          Complete a session — the AI will analyze your performance and populate this profile automatically.
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

  const abandonedPatterns = stats
    .filter(p => p.abandonedCount > 0)
    .sort((a, b) => b.abandonedCount - a.abandonedCount)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-100">Weakness Profile</h1>
        <p className="mt-1 text-sm text-stone-400">
          Based on {stats.reduce((s, p) => s + p.totalSessions, 0)} analyzed sessions across{' '}
          {stats.length} pattern{stats.length !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Patterns you often abandon */}
      {abandonedPatterns.length > 0 && (
        <div className="rounded-2xl border border-red-800/50 bg-red-950/20 p-6">
          <p className="mb-3 text-xs font-medium text-red-400">
            Patterns You Often Abandon
          </p>
          <div className="flex flex-wrap gap-3">
            {abandonedPatterns.map(p => (
              <div key={p.pattern} className="flex items-center gap-2 rounded-xl border border-red-800/40 bg-stone-900 px-4 py-2.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${PATTERN_DOT_COLORS[p.pattern] ?? 'bg-stone-500'}`} />
                <span className="text-sm font-semibold text-stone-200">{p.displayName}</span>
                <span className="rounded-full bg-red-900/60 px-2 py-0.5 text-xs font-medium text-red-300">
                  {p.abandonedCount} abandoned
                </span>
                {p.abandonedCount > p.completedCount && (
                  <span className="rounded-full bg-red-700/40 px-2 py-0.5 text-xs font-bold text-red-300">
                    Priority
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-stone-500">
            These patterns need practice before your next interview. Start with easier problems in these areas.
          </p>
        </div>
      )}

      {/* Radar + Top 3 side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Radar chart */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <p className="mb-4 text-xs font-medium text-stone-400">
            Pattern Strength
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#292524" />
              <PolarAngleAxis
                dataKey="pattern"
                tick={{ fill: '#a8a29e', fontSize: 10 }}
              />
              <Radar
                name="Strength"
                dataKey="strength"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1917',
                  border: '1px solid #44403c',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                }}
                formatter={(value) => [`${Number(value)}%`, 'Strength']}
              />
            </RadarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-center text-xs text-stone-600">
            Higher = stronger. Based on hint count per session.
          </p>
        </div>

        {/* Top 3 weakest */}
        <div className="space-y-4">
          <p className="text-xs font-medium text-stone-400">
            Top Weaknesses
          </p>
          {top3.map((p, i) => (
            <div
              key={p.pattern}
              className="rounded-xl border border-stone-800 bg-stone-900 p-4 space-y-3 transition-all duration-200 hover:border-orange-800 hover:bg-stone-900/80"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-stone-600">#{i + 1}</span>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${PATTERN_DOT_COLORS[p.pattern] ?? 'bg-stone-500'}`} />
                  <span className="font-semibold text-stone-100">{p.displayName}</span>
                  <span className="rounded bg-stone-800 px-1.5 py-0.5 text-xs font-mono text-orange-300">
                    avg {p.avgHintCount} hints
                  </span>
                  {p.abandonedCount > 0 && (
                    <span className="rounded bg-red-900/50 px-1.5 py-0.5 text-xs font-medium text-red-400">
                      {p.abandonedCount} abandoned
                    </span>
                  )}
                </div>
                <TrendBadge trend={p.trend} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Breaks down at:</span>
                <BreakdownBadge bp={p.mostCommonBreakdown} />
              </div>

              {/* Mini bar chart — hint counts for last 5 sessions */}
              {p.last5.length > 1 && (
                <div>
                  <p className="mb-1 text-xs text-stone-600">Last {p.last5.length} sessions</p>
                  <BarChart
                    width={220}
                    height={56}
                    data={p.last5}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    <XAxis dataKey="n" hide />
                    <Bar dataKey="hints" fill="#f97316" radius={[2, 2, 0, 0]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1c1917',
                        border: '1px solid #44403c',
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
        <div className="rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden">
          <p className="border-b border-stone-800 px-5 py-3 text-xs font-medium text-stone-400">
            All patterns
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800 text-left text-xs text-stone-500">
                <th className="px-5 py-2 font-medium">Pattern</th>
                <th className="px-5 py-2 font-medium">Sessions</th>
                <th className="px-5 py-2 font-medium">Abandoned</th>
                <th className="px-5 py-2 font-medium">Avg Hints</th>
                <th className="px-5 py-2 font-medium">Breaks at</th>
                <th className="px-5 py-2 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(p => (
                <tr key={p.pattern} className="border-b border-stone-800/50 hover:bg-stone-800/30">
                  <td className="px-5 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${PATTERN_DOT_COLORS[p.pattern] ?? 'bg-stone-500'}`} />
                      <span className="font-medium text-stone-200">{p.displayName}</span>
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-stone-400">{p.totalSessions}</td>
                  <td className="px-5 py-2.5">
                    {p.abandonedCount > 0
                      ? <span className="text-red-400 font-medium">{p.abandonedCount}</span>
                      : <span className="text-stone-600">—</span>
                    }
                  </td>
                  <td className="px-5 py-2.5 font-mono text-orange-300">{p.avgHintCount}</td>
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
      <div className="relative rounded-2xl border border-orange-800/60 bg-orange-950/30 p-6 overflow-hidden">
        <p className="mb-1 text-xs font-medium text-orange-400">
          Recommended focus
        </p>
        <p className="mt-2 text-sm font-semibold text-stone-100">
          {weakest.displayName} — {weakest.breakdownLabel}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-stone-300">{recommendation}</p>
      </div>

    </div>
  )
}
