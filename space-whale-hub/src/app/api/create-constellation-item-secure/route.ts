import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, content_type, media_url, artist_name, tags } = body

    if (!title || !content_type || !media_url) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, content_type, and media_url are required'
      }, { status: 400 })
    }

    console.log('Creating constellation item:', { title, content_type, media_url })

    // Get the first existing user ID to use as the system user
    const { data: existingUsers, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (userError || !existingUsers || existingUsers.length === 0) {
      console.error('Error finding existing user:', userError)
      return NextResponse.json({
        success: false,
        error: 'No users found in the system. Please create a user account first.'
      }, { status: 400 })
    }

    const systemUserId = existingUsers[0].id
    console.log('Using system user ID:', systemUserId)

    // Create constellation item using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('archive_items')
      .insert({
        user_id: systemUserId, // Use the first existing user ID for archive items
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
