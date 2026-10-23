import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { displayName } = await request.json()

    if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Display name is required' },
        { status: 400 }
      )
    }

    const trimmed = displayName.trim().slice(0, 80)
    const supabaseAdmin = getSupabaseAdmin()

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(auth.userId, {
      user_metadata: {
        ...auth.user.user_metadata,
        display_name: trimmed,
      },
    })

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 })
    }

    await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: auth.userId,
          display_name: trimmed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    return NextResponse.json({
      success: true,
      message: 'Display name updated successfully',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
