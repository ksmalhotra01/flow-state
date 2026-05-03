import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function Nav() {
  return (
    <nav className="shrink-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
      <span className="text-xl font-bold tracking-tight text-white">FlowState</span>
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
        >
          New session
        </Link>
        <Link
          href="/dashboard/weakness"
          className="rounded-lg border border-indigo-800 bg-indigo-950/60 px-3 py-1.5 text-sm font-medium text-indigo-300 transition-colors hover:border-indigo-600 hover:text-indigo-200"
        >
          Weakness
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  )
}
