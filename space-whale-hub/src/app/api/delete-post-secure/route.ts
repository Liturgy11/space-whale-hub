import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { postId, userId } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    if (!postId) {
      return NextResponse.json({
        success: false,
        error: 'Post ID is required'
      }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json({
        success: false,
        error: 'Post not found'
      }, { status: 404 })
    }

    if (post.user_id !== auth.userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: You can only delete your own posts'
      }, { status: 403 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', auth.userId)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({
        success: false,
        error: deleteError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
