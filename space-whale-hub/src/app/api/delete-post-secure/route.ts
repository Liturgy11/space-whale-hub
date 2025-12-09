import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't evaluate at build time
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { postId, userId } = await request.json()
    
    if (!postId) {
      return NextResponse.json({
        success: false,
        error: 'Post ID is required'
      }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // First, verify the post exists and belongs to the user
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

    // Verify the post belongs to the user
    if (post.user_id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: You can only delete your own posts'
      }, { status: 403 })
    }

    // Delete the post using service role (bypasses RLS)
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId) // Double-check user ownership
    
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

