import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { 
      content, 
      tags, 
      content_warning, 
      media_url, 
      media_urls,
      media_type,
      userId 
    } = await request.json()
    
    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Content is required'
      }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
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

    const urlList: string[] = Array.isArray(media_urls)
      ? media_urls.filter((u: unknown) => typeof u === 'string' && u.length > 0)
      : media_url
        ? [media_url]
        : []

    const primaryUrl = urlList[0] || media_url || null
    const resolvedType =
      urlList.length > 1
        ? 'gallery'
        : urlList.length === 1
          ? media_type || 'image'
          : media_type || null

    // Create the post using service role
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: userId,
        content: content.trim(),
        tags: tags || [],
        has_content_warning: !!content_warning,
        content_warning_text: content_warning || null,
        media_url: primaryUrl,
        media_urls: urlList.length > 0 ? urlList : null,
        media_type: resolvedType,
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
      post: data
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
