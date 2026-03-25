import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, display_name, pronouns, country, avatar_url } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Update the profiles table (used by feed, comments, etc.)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        display_name: display_name || null,
        pronouns: pronouns || null,
        country: country || null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
    }

    // Also update auth user_metadata so the client-side user object stays in sync
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        display_name: display_name || null,
        pronouns: pronouns || null,
        country: country || null,
        avatar_url: avatar_url || null,
      }
    })

    if (authError) {
      // Non-fatal — profiles table is the source of truth for display
      console.error('Auth metadata update error (non-fatal):', authError)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
