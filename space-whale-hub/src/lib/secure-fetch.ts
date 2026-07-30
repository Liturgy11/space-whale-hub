/**
 * Authenticated fetch for secure API routes.
 * Attaches the Supabase access token from the current session.
 */
export async function secureFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const { supabase } = await import('@/lib/supabase')
  const { data: { session } } = await supabase.auth.getSession()

  const headers = new Headers(init.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  return fetch(input, { ...init, headers })
}
