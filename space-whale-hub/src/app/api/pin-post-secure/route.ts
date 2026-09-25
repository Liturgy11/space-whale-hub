import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAdminUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

/** Admin-only. Pinning one post clears any previous pin. */
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminUser(request)
    if (!auth.ok) return auth.response

    const { postId, pinned } = await request.json()

    if (!postId || typeof pinned !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'postId and pinned are required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    if (pinned) {
      const { error: clearError } = await supabaseAdmin
        .from('posts')
        .update({ pinned_at: null })
        .not('pinned_at', 'is', null)

      if (clearError) {
        return NextResponse.json({ success: false, error: clearError.message }, { status: 500 })
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from('posts')
      .update({ pinned_at: pinned ? new Date().toISOString() : null })
      .eq('id', postId)

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, pinned })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update pin'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
