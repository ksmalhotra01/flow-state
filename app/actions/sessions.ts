'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { reconstructProblem } from '@/lib/reconstructProblem'

export type SessionState = { error?: string } | undefined

export async function createSession(
  state: SessionState,
  formData: FormData
): Promise<SessionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const problem = formData.get('problem') as string
  const confidence = formData.get('confidence') as string

  if (!problem?.trim()) return { error: 'Please paste a problem.' }
  if (!confidence) return { error: 'Please select your confidence level.' }

  const { text: finalProblem } = await reconstructProblem(problem.trim())

  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: user.id, problem: finalProblem, confidence })
    .select('id')
    .single()

  if (error) return { error: 'Something went wrong. Please try again.' }

  redirect(`/session/${data.id}/think`)
}
