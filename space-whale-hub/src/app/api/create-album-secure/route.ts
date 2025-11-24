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
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { title, description, cover_image_url, event_date, event_location, created_by, is_featured, sort_order } = await request.json()

    if (!title || !created_by) {
      return NextResponse.json({ success: false, error: 'Title and created_by are required' }, { status: 400 })
    }

    console.log('Creating album:', { title, description, event_date, event_location })

    // Create album using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('albums')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        cover_image_url: cover_image_url || null,
        event_date: event_date || null,
        event_location: event_location?.trim() || null,
        created_by: created_by,
        is_featured: is_featured || false,
        sort_order: sort_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating album:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Album created successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('API error creating album:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}



