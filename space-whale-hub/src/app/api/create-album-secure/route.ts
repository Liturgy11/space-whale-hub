import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const { title, description, cover_image_url, event_date, event_location, created_by, is_featured, sort_order } =
      await request.json()

    const mismatch = assertMatchingUserId(auth.userId, created_by)
    if (mismatch) return mismatch

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 })
    }

    console.log('Creating album:', { title, description, event_date, event_location })

    const { data, error } = await supabaseAdmin
      .from('albums')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        cover_image_url: cover_image_url || null,
        event_date: event_date || null,
        event_location: event_location?.trim() || null,
        created_by: auth.userId,
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
