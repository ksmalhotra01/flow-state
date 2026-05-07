'use server'

import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reconstructProblem } from '@/lib/reconstructProblem'
import { classifyPatternOnly } from '@/lib/analyzeSession'

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
  const model = (formData.get('model') as string) || 'claude'

  if (!problem?.trim()) return { error: 'Please paste a problem.' }
  if (problem.trim().length > 10000) return { error: 'Problem text is too long (max 10,000 characters).' }
  if (!confidence) return { error: 'Please select your confidence level.' }

  const { text: finalProblem } = await reconstructProblem(problem.trim())

  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: user.id, problem: finalProblem, confidence, model })
    .select('id')
    .single()

  if (error) return { error: 'Something went wrong. Please try again.' }

  // Classify pattern in the background — fires after the redirect, user feels no delay
  after(() => classifyPatternOnly(supabase, user.id, data.id, finalProblem))

  redirect(`/session/${data.id}/think`)
}
