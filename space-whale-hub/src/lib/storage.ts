import { supabase } from './supabase'
import { createClient } from '@supabase/supabase-js'

// Create a service role client for storage operations
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
  upsert?: boolean // If true, will replace existing file with same name
}

/**
 * Unified media upload function for all media types
 * Handles file validation, compression, and proper folder structure
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

    // Upload to Supabase Storage using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(options.category)
      .upload(fullPath, processedFile, {
        upsert: options.upsert || false,
        cacheControl: '3600'
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
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
 * Delete media from storage
 */
export async function deleteMedia(
  path: string,
  bucket: MediaCategory,
  userId: string
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required for deletions')
  }

  // Verify user owns this file
  if (!path.startsWith(`${userId}/`)) {
    throw new Error('Unauthorized: Cannot delete files not owned by user')
  }

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Storage delete error:', error)
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Get public URL for media
 */
export function getMediaUrl(path: string, bucket: MediaCategory): string {
  const { data } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
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
