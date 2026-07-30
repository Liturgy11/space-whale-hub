import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

/** GET — current user's profile row (includes UI flags). */
export async function GET(request: NextRequest) {
  const auth = await verifyAuthUser(request)
  if (!auth.ok) return auth.response

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(
        'id, display_name, pronouns, country, bio, avatar_url, welcome_seen_at, first_post_ack_at'
      )
      .eq('id', auth.userId)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data ?? null })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load profile'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
