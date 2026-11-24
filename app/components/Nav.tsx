import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function Nav({ locked = false }: { locked?: boolean }) {
  return (
    <nav className="shrink-0 flex items-center justify-between border-b border-stone-800 bg-stone-900 px-5 py-3">

      {locked ? (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-600">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-white">FlowState</span>
        </div>
      ) : (
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-orange-600 transition-colors group-hover:bg-orange-500">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-white transition-colors group-hover:text-stone-200">
            FlowState
          </span>
        </Link>
      )}

      {!locked && (
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
          >
            Prep
          </Link>
          <Link
            href="/dashboard/interview"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
          >
            Interview
          </Link>
          <Link
            href="/dashboard/weakness"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
          >
            Weakness
          </Link>

          <div className="mx-2 h-4 w-px bg-stone-700" />

          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-800 hover:text-stone-300"
            >
              Sign out
            </button>
          </form>
        </div>
      )}

    </nav>
  )
}
