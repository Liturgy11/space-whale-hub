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

export async function PUT(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { id, title, description, artist_name, tags } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }

    console.log('Updating archive item:', { id, title, description, artist_name, tags })

    // Update the archive item using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('archive_items')
      .update({
        title: title || null,
        description: description || null,
        artist_name: artist_name || null,
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating archive item:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Archive item updated successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('API error updating archive item:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
