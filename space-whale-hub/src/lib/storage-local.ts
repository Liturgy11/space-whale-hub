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
 * Upload media using local file storage (bypasses Supabase RLS issues)
 * This stores files in the public/uploads directory
 */
export async function uploadMedia(
  file: File,
  options: UploadOptions,
  userId: string
): Promise<UploadResult> {
  if (!userId) {
    throw new Error('User ID is required for uploads')
  }

  // Check file size limits (conservative for free hosting)
  const sizeLimits = {
    avatars: 5 * 1024 * 1024,    // 5MB
    posts: 10 * 1024 * 1024,     // 10MB
    journal: 10 * 1024 * 1024,   // 10MB
    archive: 20 * 1024 * 1024    // 20MB
  }

  const maxSize = sizeLimits[options.category]
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0)
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
    throw new Error(`File too large: ${fileSizeMB}MB. Maximum size for ${options.category} is ${maxSizeMB}MB.`)
  }

  try {
    // Create form data
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', options.category)
    formData.append('userId', userId)
    if (options.folder) {
      formData.append('folder', options.folder)
    }

    // Upload via local storage API route
    const response = await fetch('/api/upload-local', {
      method: 'POST',
      body: formData
    })

    // Check if response is OK before trying to parse JSON
    if (!response.ok) {
      // Try to parse error as JSON, but handle plain text errors gracefully
      let errorMessage = 'Upload failed'
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || `Upload failed: ${response.status} ${response.statusText}`
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`
        }
      } else {
        // For non-JSON responses (like plain text "Forbidden"), use status text
        try {
          const text = await response.text()
          errorMessage = text || `Upload failed: ${response.status} ${response.statusText}`
        } catch (textError) {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`
        }
      }
      
      throw new Error(errorMessage)
    }

    // Response is OK, parse as JSON
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed')
    }

    return {
      url: result.url,
      path: result.path,
      bucket: result.bucket
    }

  } catch (error) {
    console.error('Upload error:', error)
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





