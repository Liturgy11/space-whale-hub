import { resolveAccessToken } from '@/lib/auth-session'
import {
  MediaCategory,
  SIGNED_UPLOAD_THRESHOLD,
  SIZE_LIMITS,
  archiveContentType,
  formatBytes,
  inferMimeType,
  isAllowedMedia,
  isVideoFile,
  sizeLimitLabel,
} from '@/lib/media-types'

export type { MediaCategory }
export { archiveContentType, isVideoFile, isAllowedMedia, SIZE_LIMITS }

export interface UploadResult {
  url: string
  path: string
  bucket: string
}

export interface UploadOptions {
  category: MediaCategory
  filename?: string
  folder?: string
  upsert?: boolean
}

function sanitizeFilename(name: string): string {
  const extIndex = name.lastIndexOf('.')
  const ext = extIndex >= 0 ? name.substring(extIndex) : ''
  const baseName = extIndex >= 0 ? name.substring(0, extIndex) : name
  const sanitized = baseName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
  return sanitized + ext
}

function shouldUseSignedUpload(file: File, category: MediaCategory): boolean {
  // Videos (and anything over the Vercel body limit) must go direct to Supabase
  if (isVideoFile(file)) return true
  if (category === 'archive' && file.size > SIGNED_UPLOAD_THRESHOLD) return true
  if (file.size > SIGNED_UPLOAD_THRESHOLD) return true
  return false
}

async function uploadViaSignedUrl(
  file: File,
  options: UploadOptions,
  userId: string
): Promise<UploadResult> {
  const accessToken = await resolveAccessToken()
  if (!accessToken) {
    throw new Error('Please log in again to upload')
  }

  const filename = sanitizeFilename(options.filename || `${Date.now()}-${file.name}`)
  const contentType = inferMimeType(file)

  const response = await fetch('/api/create-signed-upload-secure', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      category: options.category,
      userId,
      filename,
      folder: options.folder,
      upsert: options.upsert || false,
      contentType,
      fileSize: file.size,
      originalName: file.name,
    }),
  })

  const result = await response.json()
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error || 'Failed to prepare upload')
  }

  const { path, token, bucket, publicUrl, contentType: signedContentType } = result.data as {
    path: string
    token: string
    bucket: string
    publicUrl: string
    contentType?: string
  }

  const { supabase } = await import('@/lib/supabase')
  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, {
      contentType: signedContentType || contentType || file.type || undefined,
      upsert: options.upsert || false,
    })

  if (error) {
    console.error('Signed upload failed:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  return {
    url: publicUrl,
    path,
    bucket,
  }
}

async function uploadViaApi(
  file: File,
  options: UploadOptions,
  userId: string
): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', options.category)
  formData.append('userId', userId)
  if (options.filename) {
    formData.append('filename', options.filename)
  }
  if (options.folder) {
    formData.append('folder', options.folder)
  }
  if (options.upsert !== undefined) {
    formData.append('upsert', options.upsert.toString())
  }

  const accessToken = await resolveAccessToken()
  const headers: HeadersInit = {}
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch('/api/upload-storage', {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    let errorMessage = 'Upload failed'
    let shouldFallbackToSigned = response.status === 413
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json()
        const serverError = errorData.error || ''
        const lower = serverError.toLowerCase()
        if (
          response.status === 413 ||
          lower.includes('request entity too large') ||
          lower.includes('payload too large') ||
          lower.includes('upload_payload_too_large')
        ) {
          shouldFallbackToSigned = true
        }
        if (
          serverError.includes('exceeded the maximum allowed size') ||
          serverError.includes('object exceeded') ||
          response.status === 413
        ) {
          errorMessage = `File too large: ${formatBytes(file.size)}. Maximum for ${options.category} is ${sizeLimitLabel(options.category)}.`
        } else {
          errorMessage = serverError || `Upload failed: ${response.status} ${response.statusText}`
        }
      } catch {
        errorMessage = `Upload failed: ${response.status} ${response.statusText}`
      }
    } else {
      try {
        const text = await response.text()
        const lower = text.toLowerCase()
        if (
          response.status === 413 ||
          lower.includes('request entity too large') ||
          lower.includes('payload too large')
        ) {
          shouldFallbackToSigned = true
        }
        errorMessage = text || `Upload failed: ${response.status} ${response.statusText}`
      } catch {
        errorMessage = `Upload failed: ${response.status} ${response.statusText}`
      }
    }

    if (shouldFallbackToSigned) {
      console.warn('API upload hit size limit — falling back to signed direct upload')
      return uploadViaSignedUrl(file, options, userId)
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

/**
 * Upload media. Small images use the API route; videos and larger files
 * upload directly to Supabase via a signed URL (bypasses Vercel body limits).
 */
export async function uploadMedia(
  file: File,
  options: UploadOptions,
  userId: string
): Promise<UploadResult> {
  if (!userId) {
    throw new Error('User ID is required for uploads')
  }

  const maxSize = SIZE_LIMITS[options.category]
  if (file.size > maxSize) {
    throw new Error(
      `File too large: ${formatBytes(file.size)}. Maximum for ${options.category} is ${sizeLimitLabel(options.category)}.${
        isVideoFile(file)
          ? ' Try compressing the clip, or use a shorter export.'
          : ' Please choose a smaller file or compress the image.'
      }`
    )
  }

  if (!isAllowedMedia(file, options.category)) {
    throw new Error(
      `File type not supported (${inferMimeType(file) || 'unknown'}). For album videos use MP4 or MOV.`
    )
  }

  console.log(
    `📤 Client upload: ${options.category}/${file.name} (${formatBytes(file.size)}, ${
      shouldUseSignedUpload(file, options.category) ? 'signed' : 'api'
    })`
  )

  try {
    if (shouldUseSignedUpload(file, options.category)) {
      return await uploadViaSignedUrl(file, options, userId)
    }
    return await uploadViaApi(file, options, userId)
  } catch (error) {
    console.error('❌ Client upload error:', error)

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Please check your connection and try again')
    }

    if (error instanceof Error && error.message.includes('permission')) {
      throw new Error('Permission denied: Please make sure you are logged in and try again')
    }

    throw error
  }
}

/**
 * Upload multiple files (for mood boards, etc.)
 */
export async function uploadMultipleMedia(
  files: File[],
  options: UploadOptions,
  userId: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file, index) => {
    const fileOptions = {
      ...options,
      filename: `${Date.now()}-${index}-${file.name}`,
    }
    return uploadMedia(file, fileOptions, userId)
  })

  return Promise.all(uploadPromises)
}

/**
 * Get public URL for media (client-side only)
 */
export function getMediaUrl(path: string, bucket: MediaCategory): string {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrmdgbzmdtvqcuzfkwar.supabase.co'

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for media URLs')
  }

  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`
}
