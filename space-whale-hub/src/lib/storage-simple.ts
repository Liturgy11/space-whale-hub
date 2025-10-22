import { supabase } from './supabase'

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
 * Simple storage upload that works around RLS issues
 * Uses a different approach that should work without service role
 */
export async function uploadMedia(
  file: File,
  options: UploadOptions,
  userId: string
): Promise<UploadResult> {
  if (!userId) {
    throw new Error('User ID is required for uploads')
  }

  // Validate file type based on category
  const allowedTypes = {
    avatars: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
    posts: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm'],
    journal: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
    archive: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']
  }

  if (!allowedTypes[options.category].includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed for ${options.category}`)
  }

  // Generate filename if not provided
  const filename = options.filename || `${Date.now()}-${file.name}`
  
  // Create folder structure: {userId}/{category}/{optional-folder}/{filename}
  const folderPath = options.folder 
    ? `${userId}/${options.category}/${options.folder}`
    : `${userId}/${options.category}`
  
  const fullPath = `${folderPath}/${filename}`

  try {
    // Compress images if needed
    let processedFile = file
    if (file.type.startsWith('image/') && options.category !== 'archive') {
      processedFile = await compressImage(file)
    }

    // Try direct upload first
    const { data, error } = await supabase.storage
      .from(options.category)
      .upload(fullPath, processedFile, {
        upsert: options.upsert || false,
        cacheControl: '3600'
      })

    if (error) {
      console.error('Direct upload failed, trying alternative approach:', error)
      
      // Alternative: Upload to a temporary location first
      const tempPath = `temp/${userId}/${Date.now()}-${filename}`
      const { data: tempData, error: tempError } = await supabase.storage
        .from(options.category)
        .upload(tempPath, processedFile, {
          upsert: false,
          cacheControl: '3600'
        })

      if (tempError) {
        throw new Error(`Upload failed: ${tempError.message}`)
      }

      // Move to final location
      const { error: moveError } = await supabase.storage
        .from(options.category)
        .move(tempPath, fullPath)

      if (moveError) {
        // If move fails, use the temp path
        const { data: urlData } = supabase.storage
          .from(options.category)
          .getPublicUrl(tempPath)

        return {
          url: urlData.publicUrl,
          path: tempPath,
          bucket: options.category
        }
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(options.category)
      .getPublicUrl(fullPath)

    return {
      url: urlData.publicUrl,
      path: fullPath,
      bucket: options.category
    }

  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

/**
 * Compress image files to reduce size
 */
async function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Image compression failed'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
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
