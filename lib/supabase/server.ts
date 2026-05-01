import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Call this inside Server Components, Server Actions, and Route Handlers.
// Never share this across requests — create a new one each time.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components can't set cookies — the proxy handles token refresh.
          }
        },
      },
    }
  )
}
