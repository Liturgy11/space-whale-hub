export type MediaCategory = 'avatars' | 'posts' | 'journal' | 'archive'

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

/**
 * Upload media using API route (secure server-side approach)
 */
export async function uploadMedia(
  file: File,
  options: UploadOptions,
  userId: string
): Promise<UploadResult> {
  if (!userId) {
    throw new Error('User ID is required for uploads')
  }

  console.log(`📤 Client upload: ${options.category}/${file.name}`)

  // Create form data
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', options.category)
  formData.append('userId', userId)
  if (options.filename) {
    formData.append('filename', options.filename)
  }

  try {
    const response = await fetch('/api/upload-storage', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed')
    }

    console.log(`✅ Client upload successful: ${result.url}`)
    return result

  } catch (error) {
    console.error('Client upload error:', error)
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
      filename: `${Date.now()}-${index}-${file.name}`
    }
    return uploadMedia(file, fileOptions, userId)
  })

  return Promise.all(uploadPromises)
}

/**
 * Get public URL for media (client-side only)
 */
export function getMediaUrl(path: string, bucket: MediaCategory): string {
  // This is a simple URL construction - in production you might want to use
  // a more sophisticated approach
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`
}
