import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't evaluate at build time
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const userId = formData.get('userId') as string
    const folder = formData.get('folder') as string || ''

    if (!file || !category || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = {
      avatars: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
      posts: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm'],
      journal: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
      archive: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'application/pdf']
    }

    // Map file extensions to MIME types (for Android browsers that may not provide correct MIME types)
    const extensionToMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.heic': 'image/heic',
      '.heif': 'image/heif',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.pdf': 'application/pdf'
    }

    console.log(`📁 File validation: type="${file.type}", category="${category}", name="${file.name}"`)

    // Get file extension
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const inferredMimeType = extensionToMime[fileExtension]

    // Check if MIME type is valid, or if we can infer it from extension (Android fallback)
    const categoryAllowedTypes = allowedTypes[category as keyof typeof allowedTypes]
    const isValidMimeType = categoryAllowedTypes?.includes(file.type)
    const isValidExtension = inferredMimeType && categoryAllowedTypes?.includes(inferredMimeType)

    // Android browsers sometimes return empty string or incorrect MIME types
    // Allow the file if either the MIME type is valid OR the extension suggests a valid type
    if (!isValidMimeType && !isValidExtension) {
      console.error(`❌ File type ${file.type || 'empty'} (extension: ${fileExtension}) not allowed for ${category}`)
      return NextResponse.json({ 
        error: `File type not supported. Please upload an image or video file. (Detected: ${file.type || 'unknown type'})` 
      }, { status: 400 })
    }

    // Log if we're using extension-based validation (Android workaround)
    if (!isValidMimeType && isValidExtension) {
      console.log(`⚠️ Using extension-based validation for Android: ${fileExtension} -> ${inferredMimeType}`)
    }

    // Create file path
    const filename = `${Date.now()}-${file.name}`
    const folderPath = folder ? `${userId}/${category}/${folder}` : `${userId}/${category}`
    const fullPath = `${folderPath}/${filename}`

    // Upload using admin client (bypasses RLS)
    const client = supabaseAdmin

    const { data, error } = await client.storage
      .from(category)
      .upload(fullPath, file, {
        upsert: false,
        cacheControl: '3600'
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from(category)
      .getPublicUrl(fullPath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: fullPath,
      bucket: category
    })

  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
