import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuthUser } from '@/lib/auth-server'

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

export async function PUT(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { id, title, description, cover_image_url, event_date, event_location, is_featured, sort_order } =
      await request.json()

    if (!id || !title) {
      return NextResponse.json({ success: false, error: 'Album ID and title are required' }, { status: 400 })
    }

    const ownershipError = await verifyAlbumOwnership(supabaseAdmin, id, auth.userId)
    if (ownershipError) return ownershipError

    console.log('Updating album:', { id, title, description, event_date, event_location })

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
      .eq('created_by', auth.userId)
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
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'Album ID is required' }, { status: 400 })
    }

    const ownershipError = await verifyAlbumOwnership(supabaseAdmin, id, auth.userId)
    if (ownershipError) return ownershipError

    console.log('Deleting album:', id)

    const { error } = await supabaseAdmin
      .from('albums')
      .delete()
      .eq('id', id)
      .eq('created_by', auth.userId)

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
