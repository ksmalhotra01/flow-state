import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ThinkingPad from './ThinkingPad'

export default async function ThinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('id, problem, mode, model, outcome')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!session) redirect('/dashboard')

  const { data: messages } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('session_id', id)
    .order('created_at', { ascending: true })

  const { data: allSessions } = await supabase
    .from('sessions')
    .select('id, problem, created_at, confidence')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: weaknessRows } = await supabase
    .from('weakness_profile')
    .select('session_id, pattern')
    .eq('user_id', user.id)

  const patternBySession = new Map(weaknessRows?.map(r => [r.session_id, r.pattern as string]) ?? [])
  const allSessionsWithPattern = (allSessions ?? []).map(s => ({ ...s, pattern: patternBySession.get(s.id) }))

  return (
    <ThinkingPad
      sessionId={id}
      problem={session.problem}
      initialMessages={messages ?? []}
      allSessions={allSessionsWithPattern}
      mode={(session.mode ?? 'prep') as 'prep' | 'interview'}
      model={session.model ?? 'claude'}
      outcome={session.outcome ?? null}
    />
  )
}
