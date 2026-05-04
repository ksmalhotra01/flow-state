'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { analyzeSession } from '@/lib/analyzeSession'

export type SessionOutcome = 'completed' | 'abandoned' | 'timed_out'

export async function endSession(sessionId: string, outcome: SessionOutcome): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('id, problem, mode, user_id, outcome')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session || session.outcome) return

  await supabase
    .from('sessions')
    .update({ outcome })
    .eq('id', sessionId)

  // Analyze pattern for weakness profile — works for both prep and interview mode
  // because the pattern is inferred from the problem text, not session completeness
  if (outcome === 'abandoned' || outcome === 'timed_out') {
    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    await analyzeSession(supabase, user.id, sessionId, history ?? [], session.problem)
  }
}
