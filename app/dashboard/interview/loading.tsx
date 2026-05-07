import Nav from '@/app/components/Nav'

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ''}`} />
}

export default function InterviewLoading() {
  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-200">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-4 py-16 space-y-8">
          {/* Badge + heading */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-80" />
          </div>
          {/* Difficulty cards */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
          {/* Pattern dropdown */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          {/* Start button */}
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
