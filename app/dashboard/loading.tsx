import Nav from '@/app/components/Nav'

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />
}

export default function DashboardLoading() {
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200">
      <Nav />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900/50 p-4 md:flex gap-2">
          <Skeleton className="h-4 w-24 mb-2" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </aside>

        {/* Main content skeleton */}
        <main className="flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-4 py-10">
          <div className="w-full max-w-2xl space-y-6">
            {/* Mode cards */}
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
            {/* Form card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <div className="flex gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 flex-1 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
