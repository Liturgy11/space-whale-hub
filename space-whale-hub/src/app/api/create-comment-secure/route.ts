import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { postId, content, userId } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    if (!postId || !content) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: postId and content'
      }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        user_id: auth.userId,
        post_id: postId,
        content: content.trim()
      })
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comment: data
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
