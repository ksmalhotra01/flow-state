import Nav from '@/app/components/Nav'

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />
}

export default function WeaknessLoading() {
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">

          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Radar + Top 3 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-14 w-56 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-2xl border border-indigo-800/60 bg-indigo-950/30 p-6 space-y-3">
            <Skeleton className="h-3 w-36 bg-indigo-900/50" />
            <Skeleton className="h-5 w-56 bg-indigo-900/30" />
            <Skeleton className="h-4 w-full bg-indigo-900/20" />
            <Skeleton className="h-4 w-4/5 bg-indigo-900/20" />
          </div>

        </div>
      </div>
    </div>
  )
}
