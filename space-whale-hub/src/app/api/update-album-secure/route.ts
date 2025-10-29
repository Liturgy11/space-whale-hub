import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, cover_image_url, event_date, event_location, is_featured, sort_order } = await request.json()

    if (!id || !title) {
      return NextResponse.json({ success: false, error: 'Album ID and title are required' }, { status: 400 })
    }

    console.log('Updating album:', { id, title, description, event_date, event_location })

    // Update album using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('albums')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        cover_image_url: cover_image_url || null,
        event_date: event_date || null,
        event_location: event_location?.trim() || null,
        is_featured: is_featured || false,
        sort_order: sort_order || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating album:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Album updated successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('API error updating album:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'Album ID is required' }, { status: 400 })
    }

    console.log('Deleting album:', id)

    // Delete album using service role (bypasses RLS)
    const { error } = await supabaseAdmin
      .from('albums')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting album:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Album deleted successfully')
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('API error deleting album:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

