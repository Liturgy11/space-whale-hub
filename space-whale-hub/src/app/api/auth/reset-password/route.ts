import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { token_hash, password } = await request.json()

    if (!token_hash || !password) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
    }

    // Server-side client with NO flowType — avoids the PKCE intercept that
    // prevents verifyOtp returning a usable session on the client.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })

    // Verify the OTP token hash — server-side has no PKCE verifier state,
    // so GoTrue returns session tokens directly.
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'recovery',
    })

    if (verifyError || !data.user) {
      return NextResponse.json(
        { error: 'This reset link has expired or is invalid. Please request a new one.' },
        { status: 400 }
      )
    }

    const userId = data.user.id

    // Use the admin/service-role client to update the password by user ID.
    // This is safe here because: (a) we already verified the recovery token
    // above confirming ownership, and (b) this route is server-only.
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
    })

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update password. Please try again.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('reset-password route error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
