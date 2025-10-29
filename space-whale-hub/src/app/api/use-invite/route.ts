import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, userId } = await request.json()

    if (!inviteCode || !userId) {
      return NextResponse.json(
        { error: 'Invite code and user ID are required' },
        { status: 400 }
      )
    }

    // Use the invite code using our database function
    const { data, error } = await supabase.rpc('use_invite_code', {
      invite_code: inviteCode,
      user_id: userId
    })

    if (error) {
      console.error('Error using invite code:', error)
      return NextResponse.json(
        { error: 'Failed to use invite code' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Invalid, expired, or already used invite code' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invite code used successfully'
    })

  } catch (error) {
    console.error('Error in invite usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
