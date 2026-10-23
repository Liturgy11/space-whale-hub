import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const {
      userId,
      display_name,
      avatar_url,
      bio,
      location,
      offerings,
      curiosities,
      connection_formats,
    } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin.from('spores').upsert(
      {
        user_id: auth.userId,
        display_name: display_name || null,
        avatar_url: avatar_url || null,
        bio: bio || null,
        location: location || null,
        offerings: offerings || [],
        curiosities: curiosities || [],
        connection_formats: connection_formats || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      console.error('Spore upsert error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('API error:', err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
