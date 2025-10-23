import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { 
      postId, 
      content, 
      userId 
    } = await request.json()
    
    if (!postId || !content || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: postId, content, and userId'
      }, { status: 400 })
    }

    // Create a Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create the comment using service role
    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        user_id: userId,
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
