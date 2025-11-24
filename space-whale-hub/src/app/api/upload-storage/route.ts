import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering - don't evaluate at build time
export const dynamic = 'force-dynamic'

// Server-side storage operations using service role
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
    const filename = formData.get('filename') as string
    const upsert = formData.get('upsert') === 'true'

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

    console.log(`📁 File validation: type="${file.type}", category="${category}", name="${file.name}"`)
    console.log(`📁 Allowed types for ${category}:`, allowedTypes[category as keyof typeof allowedTypes])

    if (!allowedTypes[category as keyof typeof allowedTypes]?.includes(file.type)) {
      console.error(`❌ File type ${file.type} not allowed for ${category}`)
      return NextResponse.json({ error: `File type ${file.type} not allowed for ${category}` }, { status: 400 })
    }

    // Sanitize filename - remove/replace spaces and special characters
    const sanitizeFilename = (name: string): string => {
      // Get file extension
      const ext = name.substring(name.lastIndexOf('.'))
      // Get base name without extension
      const baseName = name.substring(0, name.lastIndexOf('.')) || name
      // Replace spaces and special characters with underscores, keep only alphanumeric, hyphens, and underscores
      const sanitized = baseName
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      return sanitized + ext
    }

    // Generate filename
    const originalFilename = filename || `${Date.now()}-${file.name}`
    const finalFilename = sanitizeFilename(originalFilename)
    const fullPath = `${userId}/${category}/${finalFilename}`

    console.log(`📤 Server upload: ${category}/${fullPath}`)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(category)
      .upload(fullPath, file, {
        upsert: upsert,
        cacheControl: category === 'avatars' ? '0' : '3600'
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(category)
      .getPublicUrl(fullPath)

    console.log(`✅ Upload successful: ${urlData.publicUrl}`)

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
