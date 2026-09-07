import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthUser, assertMatchingUserId } from '@/lib/auth-server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  ALLOWED_MIME_TYPES,
  EXTENSION_TO_MIME,
  MediaCategory,
  SIZE_LIMITS,
  formatBytes,
  getFileExtension,
} from '@/lib/media-types'

export const dynamic = 'force-dynamic'

function sanitizeFilename(name: string): string {
  const extIndex = name.lastIndexOf('.')
  const ext = extIndex >= 0 ? name.substring(extIndex) : ''
  const baseName = extIndex >= 0 ? name.substring(0, extIndex) : name
  const sanitized = baseName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
  return (sanitized || 'file') + ext
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuthUser(request)
    if (!auth.ok) return auth.response

    const body = await request.json()
    const category = body.category as MediaCategory
    const userId = (body.userId as string) || auth.userId
    const filename = body.filename as string | undefined
    const folder = body.folder as string | undefined
    const contentType = (body.contentType as string) || ''
    const fileSize = typeof body.fileSize === 'number' ? body.fileSize : 0
    const originalName = (body.originalName as string) || filename || 'upload.bin'
    const upsert = body.upsert === true

    const mismatch = assertMatchingUserId(auth.userId, userId)
    if (mismatch) return mismatch

    if (!category || !SIZE_LIMITS[category]) {
      return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 })
    }

    const maxSize = SIZE_LIMITS[category]
    if (fileSize > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large (${formatBytes(fileSize)}). Maximum for ${category} is ${formatBytes(maxSize)}.`,
        },
        { status: 400 }
      )
    }

    const ext = getFileExtension(originalName || filename || '')
    const inferred = EXTENSION_TO_MIME[ext]
    const mime = contentType && contentType !== 'application/octet-stream'
      ? contentType
      : inferred || contentType

    const allowed = ALLOWED_MIME_TYPES[category]
    if (!mime || !allowed.includes(mime)) {
      if (!(inferred && allowed.includes(inferred))) {
        return NextResponse.json(
          {
            success: false,
            error: `File type not supported for ${category} (detected: ${mime || ext || 'unknown'}).`,
          },
          { status: 400 }
        )
      }
    }

    const finalFilename = sanitizeFilename(filename || `${Date.now()}-${originalName}`)
    const folderPath = folder
      ? `${auth.userId}/${category}/${folder}`
      : `${auth.userId}/${category}`
    const path = `${folderPath}/${finalFilename}`

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.storage
      .from(category)
      .createSignedUploadUrl(path, { upsert })

    if (error || !data) {
      console.error('createSignedUploadUrl failed:', error)
      return NextResponse.json(
        { success: false, error: error?.message || 'Failed to create upload URL' },
        { status: 500 }
      )
    }

    const { data: urlData } = supabaseAdmin.storage.from(category).getPublicUrl(path)

    return NextResponse.json({
      success: true,
      data: {
        path: data.path || path,
        token: data.token,
        signedUrl: data.signedUrl,
        bucket: category,
        publicUrl: urlData.publicUrl,
        contentType: mime || inferred || 'application/octet-stream',
      },
    })
  } catch (error) {
    console.error('create-signed-upload-secure error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
