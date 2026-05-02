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
          className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
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
