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

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 })
    }

    console.log('Deleting constellation item:', id)

    // Delete the constellation item using service role (bypasses RLS)
    const { error } = await supabaseAdmin
      .from('archive_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting constellation item:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('Constellation item deleted successfully')

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('API error deleting constellation item:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
