import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't evaluate at build time
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { itemId, content, userId } = await request.json()

    if (!itemId || !content || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Item ID, content, and user ID are required' 
      }, { status: 400 })
    }

    console.log('Creating archive comment:', { itemId, content, userId })

    // First, get the user's display name from profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()

    const displayName = profile?.display_name || 'Anonymous'

    const { data, error } = await supabaseAdmin
      .from('archive_comments')
      .insert({
        item_id: itemId,
        user_id: userId,
        content: content.trim()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating archive comment:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Add display name to the response
    const commentWithName = {
      ...data,
      display_name: displayName
    }

    console.log('Archive comment created successfully:', commentWithName)
    return NextResponse.json({ success: true, data: commentWithName })

  } catch (error: any) {
    console.error('API error creating archive comment:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
