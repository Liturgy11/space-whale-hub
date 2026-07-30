import { NextRequest, NextResponse } from 'next/server'
import { createClient, User } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lizwamc@gmail.com'

export type AuthResult =
  | { ok: true; userId: string; user: User; accessToken: string }
  | { ok: false; response: NextResponse }

function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ success: false, error: message }, { status: 401 })
}

function forbidden(message = 'Forbidden') {
  return NextResponse.json({ success: false, error: message }, { status: 403 })
}

/** Verify Bearer JWT from Authorization header. */
export async function verifyAuthUser(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, response: unauthorized('Missing or invalid Authorization header') }
  }

  const accessToken = authHeader.slice('Bearer '.length).trim()
  if (!accessToken) {
    return { ok: false, response: unauthorized('Missing access token') }
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    let user: User | null = null

    const { data, error } = await supabaseAdmin.auth.getUser(accessToken)
    if (!error && data.user) {
      user = data.user
    } else {
      // Fallback: verify via anon client (same path Supabase client uses)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: { autoRefreshToken: false, persistSession: false },
          global: { headers: { Authorization: `Bearer ${accessToken}` } },
        })
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (!userError && userData.user) {
          user = userData.user
        }
      }
    }

    if (!user) {
      return { ok: false, response: unauthorized(error?.message || 'Invalid or expired token') }
    }

    return { ok: true, userId: user.id, user, accessToken }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Authentication failed'
    return { ok: false, response: unauthorized(message) }
  }
}

/** Optional auth — returns userId when a valid Bearer token is present. */
export async function verifyAuthUserOptional(
  request: NextRequest
): Promise<{ userId: string | null; user: User | null }> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { userId: null, user: null }
  }

  const auth = await verifyAuthUser(request)
  if (!auth.ok) return { userId: null, user: null }
  return { userId: auth.userId, user: auth.user }
}

/** Require authenticated admin (portal owner). */
export async function verifyAdminUser(request: NextRequest): Promise<AuthResult> {
  const auth = await verifyAuthUser(request)
  if (!auth.ok) return auth

  if (auth.user.email !== ADMIN_EMAIL) {
    return { ok: false, response: forbidden('Admin access required') }
  }

  return auth
}

/**
 * Ensure a client-supplied userId (if any) matches the verified JWT subject.
 * Always prefer the verified userId for mutations.
 */
export function assertMatchingUserId(
  verifiedUserId: string,
  clientUserId: string | undefined | null
): NextResponse | null {
  if (clientUserId && clientUserId !== verifiedUserId) {
    return forbidden('User ID does not match authenticated session')
  }
  return null
}
