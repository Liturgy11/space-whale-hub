import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { id, title, description, artist_name, tags } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }

    const { data: item, error: fetchError } = await supabaseAdmin
      .from('archive_items')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 })
    }

    if (item.user_id !== auth.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 403 })
    }

    console.log('Updating archive item:', { id, title, description, artist_name, tags })

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
      .eq('user_id', auth.userId)
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
