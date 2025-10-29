import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const { media_urls } = await request.json()

    if (!media_urls || !Array.isArray(media_urls)) {
      return NextResponse.json({ 
        success: false, 
        error: 'media_urls array is required' 
      }, { status: 400 })
    }

    // Generate signed URLs for each media URL
    const signedUrls = await Promise.all(
      media_urls.map(async (url: string) => {
        try {
          // Extract bucket and path from the public URL
          // Format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
          const urlParts = url.split('/storage/v1/object/public/')
          if (urlParts.length !== 2) {
            console.warn('Invalid media URL format:', url)
            return { original_url: url, signed_url: url, error: 'Invalid URL format' }
          }

          const [bucket, path] = urlParts[1].split('/', 2)
          
          // Generate signed URL (valid for 1 hour)
          const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path, 3600) // 1 hour expiration

          if (error) {
            console.error('Error creating signed URL for:', url, error)
            return { original_url: url, signed_url: url, error: error.message }
          }

          return {
            original_url: url,
            signed_url: data.signedUrl,
            expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
          }
        } catch (error: any) {
          console.error('Error processing URL:', url, error)
          return { 
            original_url: url, 
            signed_url: url, 
            error: error.message 
          }
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      data: signedUrls 
    })

  } catch (error: any) {
    console.error('API error generating signed URLs:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

