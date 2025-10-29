import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get all invite codes (admin only) - simplified query
    const { data, error } = await supabase
      .from('invite_codes')
      .select(`
        *,
        usage:invite_code_usage(
          used_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invite codes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch invite codes' },
        { status: 500 }
      )
    }

    return NextResponse.json({ inviteCodes: data })

  } catch (error) {
    console.error('Error in invite codes GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, maxUses, expiresAt } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      )
    }

    // Create new invite code
    const { data, error } = await supabase
      .from('invite_codes')
      .insert({
        code: code.trim().toUpperCase(),
        created_by: (await supabase.auth.getUser()).data.user?.id,
        max_uses: maxUses || 1,
        expires_at: expiresAt || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating invite code:', error)
      return NextResponse.json(
        { error: 'Failed to create invite code' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      inviteCode: data,
      message: 'Invite code created successfully' 
    })

  } catch (error) {
    console.error('Error in invite codes POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
