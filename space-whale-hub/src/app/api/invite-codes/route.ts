import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAdminUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminUser(request)
    if (!auth.ok) return auth.response

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('invite_codes')
      .select(
        `
        *,
        usage:invite_code_usage(
          used_at
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invite codes:', error)
      return NextResponse.json({ error: 'Failed to fetch invite codes' }, { status: 500 })
    }

    return NextResponse.json({ inviteCodes: data })
  } catch (error) {
    console.error('Error in invite codes GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminUser(request)
    if (!auth.ok) return auth.response

    const { code, maxUses, expiresAt } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('invite_codes')
      .insert({
        code: String(code).trim().toUpperCase(),
        created_by: auth.userId,
        max_uses: maxUses || 1,
        expires_at: expiresAt || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating invite code:', error)
      return NextResponse.json({ error: 'Failed to create invite code' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      inviteCode: data,
      message: 'Invite code created successfully',
    })
  } catch (error) {
    console.error('Error in invite codes POST:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
