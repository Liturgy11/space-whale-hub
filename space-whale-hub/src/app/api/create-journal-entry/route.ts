import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      content, 
      mood, 
      tags, 
      media_url, 
      media_type, 
      is_private,
      accessToken 
    } = await request.json()
    
    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Content is required'
      }, { status: 400 })
    }

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        error: 'Access token is required'
      }, { status: 401 })
    }

    // Create a Supabase client with the access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Create the journal entry
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        title: title?.trim() || null,
        content: content.trim(),
        mood: mood || null,
        tags: tags || [],
        media_url: media_url || null,
        media_type: media_type || null,
        is_private: is_private ?? true
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
      entry: data
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
