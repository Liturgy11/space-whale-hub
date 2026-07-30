import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { searchParams } = new URL(request.url)
    const albumId = searchParams.get('albumId')

    if (!albumId) {
      return NextResponse.json({ success: false, error: 'albumId is required' }, { status: 400 })
    }

    console.log('Fetching items for album:', albumId)

    const { data: album, error: albumError } = await supabaseAdmin
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .single()

    if (albumError) {
      console.error('Error fetching album:', albumError)
      return NextResponse.json({ success: false, error: 'Album not found' }, { status: 404 })
    }

    const { data: albumItems, error: itemsError } = await supabaseAdmin
      .from('album_items')
      .select(`
        *,
        archive_items (
          id,
          title,
          description,
          content_type,
          media_url,
          thumbnail_url,
          artist_name,
          tags,
          user_id,
          created_at
        )
      `)
      .eq('album_id', albumId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (itemsError) {
      console.error('Error fetching album items:', itemsError)
      return NextResponse.json({
        success: false,
        error: `Failed to fetch album items: ${itemsError.message}`,
        details: itemsError
      }, { status: 500 })
    }

    const items = albumItems?.map(albumItem => ({
      ...albumItem.archive_items,
      album_item_id: albumItem.id,
      album_sort_order: albumItem.sort_order,
      added_to_album_at: albumItem.created_at
    })) || []

    console.log(`Fetched ${items.length} items for album ${albumId}`)

    return NextResponse.json({
      success: true,
      data: {
        album,
        items
      },
      message: 'Album items fetched successfully'
    })

  } catch (error) {
    console.error('Get album items API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error
    }, { status: 500 })
  }
}
