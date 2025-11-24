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
    const { album_id, item_id, added_by, sort_order } = await request.json()

    if (!album_id || !item_id || !added_by) {
      return NextResponse.json({ success: false, error: 'album_id, item_id, and added_by are required' }, { status: 400 })
    }

    console.log('Adding item to album:', { album_id, item_id, added_by })

    // Add item to album using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('album_items')
      .insert({
        album_id: album_id,
        item_id: item_id,
        added_by: added_by,
        sort_order: sort_order || 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding item to album:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Item added to album successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('API error adding item to album:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { album_id, item_id } = await request.json()

    if (!album_id || !item_id) {
      return NextResponse.json({ success: false, error: 'album_id and item_id are required' }, { status: 400 })
    }

    console.log('Removing item from album:', { album_id, item_id })

    // Remove item from album using service role (bypasses RLS)
    const { error } = await supabaseAdmin
      .from('album_items')
      .delete()
      .eq('album_id', album_id)
      .eq('item_id', item_id)

    if (error) {
      console.error('Error removing item from album:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Item removed from album successfully')
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('API error removing item from album:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Update sort order of items within an album
export async function PUT(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { album_id, orders } = await request.json()

    if (!album_id || !Array.isArray(orders)) {
      return NextResponse.json({ success: false, error: 'album_id and orders[] are required' }, { status: 400 })
    }

    // orders: [{ item_id: string, sort_order: number }]
    for (const entry of orders) {
      if (!entry.item_id || typeof entry.sort_order !== 'number') continue
      const { error } = await supabaseAdmin
        .from('album_items')
        .update({ sort_order: entry.sort_order })
        .eq('album_id', album_id)
        .eq('item_id', entry.item_id)

      if (error) {
        console.error('Error updating sort order:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error updating album order:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
