import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { userId, postId } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    if (!postId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: postId'
      }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: existingLike, error: checkError } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', auth.userId)
      .eq('post_id', postId)
      .single()

    if (existingLike) {
      const { error: deleteError } = await supabaseAdmin
        .from('likes')
        .delete()
        .eq('id', existingLike.id)

      if (deleteError) {
        console.error('Delete like error:', deleteError)
        return NextResponse.json({
          success: false,
          error: deleteError.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        liked: false
      })
    }

    const { data, error: insertError } = await supabaseAdmin
      .from('likes')
      .insert({
        user_id: auth.userId,
        post_id: postId
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert like error:', insertError)
      return NextResponse.json({
        success: false,
        error: insertError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      liked: true,
      like: data
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
