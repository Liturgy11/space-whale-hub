import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { title, description, content_type, media_url, artist_name, tags, user_id } = body

    const mismatch = assertMatchingUserId(auth.userId, user_id)
    if (mismatch) return mismatch

    if (!title || !content_type || !media_url) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, content_type, and media_url are required'
      }, { status: 400 })
    }

    console.log('Creating constellation item:', { title, content_type, media_url, user_id: auth.userId })

    const { data, error } = await supabaseAdmin
      .from('archive_items')
      .insert({
        user_id: auth.userId,
        title,
        description: description || null,
        content_type,
        media_url,
        artist_name: artist_name || null,
        tags: tags || [],
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating constellation item:', error)
      return NextResponse.json({
        success: false,
        error: `Failed to create constellation item: ${error.message}`,
        details: error
      }, { status: 500 })
    }

    console.log('Constellation item created successfully:', data)

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Constellation item created successfully'
    })

  } catch (error) {
    console.error('Create constellation item API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    }, { status: 500 })
  }
}
