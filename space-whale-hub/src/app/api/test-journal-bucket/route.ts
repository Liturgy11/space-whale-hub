import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check bucket configuration
    const { data: buckets, error: bucketError } = await supabaseAdmin
      .from('storage.buckets')
      .select('id, name, public, file_size_limit, allowed_mime_types')
      .eq('id', 'journal')

    if (bucketError) {
      return NextResponse.json({
        success: false,
        error: `Bucket query failed: ${bucketError.message}`
      }, { status: 500 })
    }

    const journalBucket = buckets?.[0]
    
    if (!journalBucket) {
      return NextResponse.json({
        success: false,
        error: 'Journal bucket not found'
      }, { status: 404 })
    }

    // Check if bucket is public
    const isPublic = journalBucket.public
    
    // Test if we can list files in the bucket
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from('journal')
      .list('', { limit: 5 })

    return NextResponse.json({
      success: true,
      bucket: journalBucket,
      isPublic,
      canListFiles: !filesError,
      filesError: filesError?.message,
      filesCount: files?.length || 0,
      sampleFiles: files?.slice(0, 3) || []
    })
  } catch (err: any) {
    console.error('API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 })
  }
}
