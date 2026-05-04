export type PatternStats = {
  pattern: string
  displayName: string
  totalSessions: number
  completedCount: number
  abandonedCount: number
  avgHintCount: number
  strengthScore: number
  mostCommonBreakdown: string
  breakdownLabel: string
  trend: 'improving' | 'stable' | 'regressing'
  last5: { n: number; hints: number }[]
}
