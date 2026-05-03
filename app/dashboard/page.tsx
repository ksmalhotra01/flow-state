import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, problem, created_at, confidence')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: weaknessRows } = await supabase
    .from('weakness_profile')
    .select('session_id, pattern')
    .eq('user_id', user.id)

  const patternBySession = new Map(weaknessRows?.map(r => [r.session_id, r.pattern as string]) ?? [])
  const sessionsWithPattern = (sessions ?? []).map(s => ({ ...s, pattern: patternBySession.get(s.id) }))

  return <DashboardClient sessions={sessionsWithPattern} />
}
