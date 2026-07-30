/**
 * Authenticated fetch for secure API routes.
 * Attaches the Supabase access token from the current session.
 */
import { resolveAccessToken } from '@/lib/auth-session'

export async function secureFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  accessTokenOverride?: string | null
): Promise<Response> {
  const accessToken = accessTokenOverride ?? await resolveAccessToken()

  if (!accessToken) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing access token' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)

  return fetch(input, { ...init, headers })
}

/** Parse JSON from a secure API response, surfacing auth and server errors. */
export async function parseSecureResponse<T = Record<string, unknown>>(
  response: Response
): Promise<T> {
  let body: Record<string, unknown> = {}
  try {
    body = await response.json()
  } catch {
    // response body wasn't JSON
  }

  if (!response.ok) {
    const message =
      (typeof body.error === 'string' && body.error) ||
      `Request failed (${response.status})`
    throw new Error(message)
  }

  return body as T
}
