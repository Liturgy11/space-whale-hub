import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

function parseStoragePublicUrl(url: string): { bucket: string; path: string } | null {
  const marker = '/storage/v1/object/public/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const rest = url.slice(idx + marker.length)
  const slash = rest.indexOf('/')
  if (slash <= 0) return null
  const bucket = rest.slice(0, slash)
  const path = decodeURIComponent(rest.slice(slash + 1).split('?')[0] || '')
  if (!bucket || !path) return null
  return { bucket, path }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const supabaseAdmin = getSupabaseAdmin()
    const { media_urls } = await request.json()

    if (!media_urls || !Array.isArray(media_urls)) {
      return NextResponse.json(
        { success: false, error: 'media_urls array is required' },
        { status: 400 }
      )
    }

    const signedUrls = await Promise.all(
      media_urls.map(async (url: string) => {
        try {
          const parsed = parseStoragePublicUrl(url)
          if (!parsed) {
            return { original_url: url, signed_url: url, error: 'Invalid URL format' }
          }

          const { bucket, path } = parsed

          // Journal objects are private — only the owner may mint a signed URL
          if (bucket === 'journal' && !path.startsWith(`${auth.userId}/`)) {
            return {
              original_url: url,
              signed_url: url,
              error: 'Not allowed to access this journal media',
            }
          }

          const { data, error } = await supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path, 3600)

          if (error) {
            console.error('Error creating signed URL for:', url, error)
            return { original_url: url, signed_url: url, error: error.message }
          }

          return {
            original_url: url,
            signed_url: data.signedUrl,
            expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          console.error('Error processing URL:', url, error)
          return { original_url: url, signed_url: url, error: message }
        }
      })
    )

    return NextResponse.json({ success: true, data: signedUrls })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('API error generating signed URLs:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
