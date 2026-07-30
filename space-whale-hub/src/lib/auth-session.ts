/**
 * In-memory access token cache synced from AuthContext.
 * Needed because the Supabase session may live in memory when localStorage
 * is unavailable or not yet written, but secure API routes require JWT.
 */
let cachedAccessToken: string | null = null

export function setAuthAccessToken(token: string | null) {
  cachedAccessToken = token
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken
}

/** Resolve a usable access token: memory cache → getSession → refreshSession. */
export async function resolveAccessToken(): Promise<string | null> {
  if (cachedAccessToken) return cachedAccessToken

  const { supabase } = await import('@/lib/supabase')

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    cachedAccessToken = session.access_token
    return session.access_token
  }

  const { data: { session: refreshed }, error } = await supabase.auth.refreshSession()
  if (!error && refreshed?.access_token) {
    cachedAccessToken = refreshed.access_token
    return refreshed.access_token
  }

  return null
}
