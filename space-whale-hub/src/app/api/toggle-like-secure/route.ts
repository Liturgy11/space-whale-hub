import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, postId } = await request.json()
    
    if (!userId || !postId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId and postId'
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: Missing Supabase environment variables'
      }, { status: 500 })
    }

    // Create a Supabase client with service role (bypasses RLS)
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if already liked
    const { data: existingLike, error: checkError } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()

    if (existingLike) {
      // Unlike - delete the like
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
    } else {
      // Like - create new like
      const { data, error: insertError } = await supabaseAdmin
        .from('likes')
        .insert({
          user_id: userId,
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
    }
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
