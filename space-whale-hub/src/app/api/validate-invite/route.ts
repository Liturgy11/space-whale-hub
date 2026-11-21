import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json()

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.rpc('validate_invite_code', {
      invite_code: inviteCode,
    })

    if (error) {
      console.error('Error validating invite code:', error)
      return NextResponse.json(
        { error: 'Failed to validate invite code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      valid: data,
      message: data ? 'Invite code is valid' : 'Invalid or expired invite code',
    })
  } catch (error) {
    console.error('Error in invite validation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
