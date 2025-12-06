import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json()

    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      )
    }

    // Validate the invite code using our database function
    const { data, error } = await supabase.rpc('validate_invite_code', {
      invite_code: inviteCode
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
      message: data ? 'Invite code is valid' : 'Invalid or expired invite code'
    })

  } catch (error) {
    console.error('Error in invite validation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


