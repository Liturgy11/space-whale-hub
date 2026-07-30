import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

async function verifyAlbumOwnership(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  albumId: string,
  userId: string
) {
  const { data: album, error } = await supabaseAdmin
    .from('albums')
    .select('id, created_by')
    .eq('id', albumId)
    .single()

  if (error || !album) {
    return NextResponse.json({ success: false, error: 'Album not found' }, { status: 404 })
  }

  if (album.created_by !== userId) {
    return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
  }

  return null
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { album_id, item_id, added_by, sort_order } = await request.json()

    const mismatch = assertMatchingUserId(auth.userId, added_by)
    if (mismatch) return mismatch

    if (!album_id || !item_id) {
      return NextResponse.json({ success: false, error: 'album_id and item_id are required' }, { status: 400 })
    }

    const ownershipError = await verifyAlbumOwnership(supabaseAdmin, album_id, auth.userId)
    if (ownershipError) return ownershipError

    console.log('Adding item to album:', { album_id, item_id, added_by: auth.userId })

    const { data, error } = await supabaseAdmin
      .from('album_items')
      .insert({
        album_id: album_id,
        item_id: item_id,
        added_by: auth.userId,
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
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { album_id, item_id } = await request.json()

    if (!album_id || !item_id) {
      return NextResponse.json({ success: false, error: 'album_id and item_id are required' }, { status: 400 })
    }

    const ownershipError = await verifyAlbumOwnership(supabaseAdmin, album_id, auth.userId)
    if (ownershipError) return ownershipError

    console.log('Removing item from album:', { album_id, item_id })

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

export async function PUT(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { album_id, orders } = await request.json()

    if (!album_id || !Array.isArray(orders)) {
      return NextResponse.json({ success: false, error: 'album_id and orders[] are required' }, { status: 400 })
    }

    const ownershipError = await verifyAlbumOwnership(supabaseAdmin, album_id, auth.userId)
    if (ownershipError) return ownershipError

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
