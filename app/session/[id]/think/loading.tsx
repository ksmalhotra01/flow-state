function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />
}

export default function ThinkLoading() {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">

      {/* Left sidebar skeleton */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900/40 p-3 md:flex gap-2">
        <Skeleton className="h-4 w-20 mb-1" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </aside>

      {/* Main chat area skeleton */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {/* AI message */}
          <div className="flex gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="space-y-2 flex-1 max-w-lg">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
          {/* User message */}
          <div className="flex justify-end gap-3">
            <div className="space-y-2 max-w-sm">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 ml-auto" />
            </div>
          </div>
          {/* AI message */}
          <div className="flex gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="space-y-2 flex-1 max-w-xl">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-slate-800 px-4 py-3 flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>

      {/* Right panel skeleton */}
      <aside className="hidden w-72 shrink-0 flex-col border-l border-slate-800 bg-slate-900/40 p-4 xl:flex gap-3">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-4 w-28 mt-2" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </aside>

    </div>
  )
}
