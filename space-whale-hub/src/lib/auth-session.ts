/**
 * In-memory access token cache synced from AuthContext.
 * Needed when localStorage has not persisted the session yet.
 */
let cachedAccessToken: string | null = null

export function setAuthAccessToken(token: string | null) {
  cachedAccessToken = token
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken
}

function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.exp) return false
    return payload.exp * 1000 < Date.now() + bufferSeconds * 1000
  } catch {
    return true
  }
}

/** Resolve a usable access token: getSession → memory cache → refreshSession. */
export async function resolveAccessToken(): Promise<string | null> {
  const { supabase } = await import('@/lib/supabase')

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token && !isTokenExpired(session.access_token)) {
    cachedAccessToken = session.access_token
    return session.access_token
  }

  if (cachedAccessToken && !isTokenExpired(cachedAccessToken)) {
    return cachedAccessToken
  }

  const { data: { session: refreshed }, error } = await supabase.auth.refreshSession()
  if (!error && refreshed?.access_token) {
    cachedAccessToken = refreshed.access_token
    return refreshed.access_token
  }

  cachedAccessToken = null
  return null
}
