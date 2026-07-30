import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { trimUserMetadata, buildTrimMetadataPayload } from '@/lib/user-metadata'
import {
  assertMatchingUserId,
  verifyAuthUser,
} from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const body = await request.json()
    const {
      userId,
      display_name,
      pronouns,
      country,
      avatar_url,
      welcome_seen_at,
      first_post_ack_at,
    } = body

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    const supabaseAdmin = getSupabaseAdmin()

    const profilePatch: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    }

    if (display_name !== undefined) profilePatch.display_name = display_name || null
    if (pronouns !== undefined) profilePatch.pronouns = pronouns || null
    if (country !== undefined) profilePatch.country = country || null
    if (avatar_url !== undefined) profilePatch.avatar_url = avatar_url || null
    if (welcome_seen_at !== undefined) profilePatch.welcome_seen_at = welcome_seen_at || null
    if (first_post_ack_at !== undefined) profilePatch.first_post_ack_at = first_post_ack_at || null

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: auth.userId, ...profilePatch }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
    }

    // Keep auth metadata small — only whitelisted string fields
    const trimmedMetadata = trimUserMetadata({
      display_name: display_name ?? auth.user.user_metadata?.display_name,
      pronouns: pronouns ?? auth.user.user_metadata?.pronouns,
      country: country ?? auth.user.user_metadata?.country,
      avatar_url: avatar_url ?? auth.user.user_metadata?.avatar_url,
      email_opt_in: auth.user.user_metadata?.email_opt_in,
    })

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(auth.userId, {
      user_metadata: buildTrimMetadataPayload({
        ...auth.user.user_metadata,
        ...trimmedMetadata,
      }),
    })

    if (authError) {
      console.error('Auth metadata update error (non-fatal):', authError)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed'
    console.error('API error:', err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
