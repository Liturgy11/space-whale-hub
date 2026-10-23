import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { assertMatchingUserId, verifyAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const userId = formData.get('userId') as string
    const filename = formData.get('filename') as string
    const folder = formData.get('folder') as string
    const upsert = formData.get('upsert') === 'true'

    if (!file || !category || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    const { ALLOWED_MIME_TYPES, EXTENSION_TO_MIME } = await import('@/lib/media-types')
    const allowedTypes = ALLOWED_MIME_TYPES
    const extensionToMime = EXTENSION_TO_MIME

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const inferredMimeType = extensionToMime[fileExtension]
    const categoryAllowedTypes = allowedTypes[category as keyof typeof allowedTypes]
    const isValidMimeType = categoryAllowedTypes?.includes(file.type)
    const isValidExtension = inferredMimeType && categoryAllowedTypes?.includes(inferredMimeType)

    if (!isValidMimeType && !isValidExtension) {
      return NextResponse.json(
        {
          error: `File type not supported. Please upload an image or video file. (Detected: ${file.type || 'unknown type'})`,
        },
        { status: 400 }
      )
    }

    const sanitizeFilename = (name: string): string => {
      const ext = name.substring(name.lastIndexOf('.'))
      const baseName = name.substring(0, name.lastIndexOf('.')) || name
      const sanitized = baseName
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
      return sanitized + ext
    }

    const originalFilename = filename || `${Date.now()}-${file.name}`
    const finalFilename = sanitizeFilename(originalFilename)
    const folderPath = folder
      ? `${auth.userId}/${category}/${folder}`
      : `${auth.userId}/${category}`
    const fullPath = `${folderPath}/${finalFilename}`

    const supabaseAdmin = getSupabaseAdmin()

    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets()
    if (bucketError) {
      console.error('Error listing buckets:', bucketError)
    } else {
      const bucketExists = buckets?.some((b) => b.id === category)
      if (!bucketExists) {
        return NextResponse.json(
          { error: `Storage bucket '${category}' not found` },
          { status: 500 }
        )
      }
    }

    const { error } = await supabaseAdmin.storage.from(category).upload(fullPath, file, {
      upsert,
      cacheControl: category === 'avatars' ? '0' : '3600',
    })

    if (error) {
      console.error('Storage upload error:', error.message)
      const statusCode = (error as { statusCode?: number; status?: number }).statusCode ||
        (error as { status?: number }).status ||
        500
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: statusCode })
    }

    const { data: urlData } = supabaseAdmin.storage.from(category).getPublicUrl(fullPath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: fullPath,
      bucket: category,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    console.error('Upload API error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
