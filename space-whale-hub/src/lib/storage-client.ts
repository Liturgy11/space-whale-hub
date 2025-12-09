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

  // Check file size limits before uploading (client-side validation)
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
    throw new Error(`File too large: ${fileSizeMB}MB. Maximum size for ${options.category} is ${maxSizeMB}MB. Please choose a smaller file or compress the image.`)
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
  if (options.upsert !== undefined) {
    formData.append('upsert', options.upsert.toString())
  }

  try {
    // Get the current session to include auth token
    const { supabase } = await import('@/lib/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    
    const headers: HeadersInit = {}
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch('/api/upload-storage', {
      method: 'POST',
      headers,
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
          const serverError = errorData.error || ''
          
          // Provide user-friendly error messages for common issues
          if (serverError.includes('exceeded the maximum allowed size') || 
              serverError.includes('object exceeded') ||
              response.status === 413) {
            const sizeLimits = {
              avatars: '5MB',
              posts: '10MB',
              journal: '10MB',
              archive: '20MB'
            }
            const maxSize = sizeLimits[options.category] || '10MB'
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
            errorMessage = `File too large: ${fileSizeMB}MB. Maximum size for ${options.category} is ${maxSize}. Please choose a smaller file or compress the image.`
          } else {
            errorMessage = serverError || `Upload failed: ${response.status} ${response.statusText}`
          }
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
    return result

  } catch (error) {
    console.error('❌ Client upload error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Re-throw with a more user-friendly message if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Please check your connection and try again')
    }
    
    // Handle permission errors
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
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrmdgbzmdtvqcuzfkwar.supabase.co'
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for media URLs')
  }
  
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`
}
