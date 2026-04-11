import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { userId, display_name, avatar_url, bio, location, offerings, curiosities, connection_formats } = await request.json()

    if (!userId) return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase env vars')

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error } = await supabaseAdmin
      .from('spores')
      .upsert({
        user_id: userId,
        display_name: display_name || null,
        avatar_url: avatar_url || null,
        bio: bio || null,
        location: location || null,
        offerings: offerings || [],
        curiosities: curiosities || [],
        connection_formats: connection_formats || [],
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('Spore upsert error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
