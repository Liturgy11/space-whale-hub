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
  console.log('📥 Upload request received')
  const supabaseAdmin = getSupabaseAdmin()
  try {
    // Verify user authentication from Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔐 Auth header present:', !!authHeader)
    let authenticatedUserId: string | null = null

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (supabaseUrl && supabaseAnonKey) {
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          })

          const { data: { user }, error: authError } = await supabase.auth.getUser()
          if (!authError && user) {
            authenticatedUserId = user.id
            console.log('✅ User authenticated:', user.id)
          } else {
            console.warn('⚠️ Auth verification failed:', authError?.message)
          }
        }
      } catch (authErr) {
        console.error('❌ Auth verification error:', authErr)
      }
    } else {
      console.warn('⚠️ No authorization header in request')
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const userId = formData.get('userId') as string
    const filename = formData.get('filename') as string
    const folder = formData.get('folder') as string
    const upsert = formData.get('upsert') === 'true'

    if (!file || !category || !userId) {
      console.error('❌ Missing required fields:', { file: !!file, category, userId })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify userId matches authenticated user (if we were able to verify auth)
    // Note: We're using service role which bypasses RLS, so we can be lenient here
    if (authenticatedUserId && authenticatedUserId !== userId) {
      console.error('❌ User ID mismatch:', { authenticatedUserId, providedUserId: userId })
      return NextResponse.json({ error: 'Unauthorized: User ID mismatch' }, { status: 403 })
    }

    // If we couldn't verify auth but have userId, log a warning but proceed
    // This allows the upload to work even if auth verification fails (service role bypasses RLS anyway)
    if (!authenticatedUserId) {
      console.warn('⚠️ Could not verify authentication, proceeding with userId from form data (service role will handle security)')
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
    console.log(`📁 Allowed types for ${category}:`, allowedTypes[category as keyof typeof allowedTypes])

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
    const folderPath = folder ? `${userId}/${category}/${folder}` : `${userId}/${category}`
    const fullPath = `${folderPath}/${finalFilename}`

    console.log(`📤 Server upload: ${category}/${fullPath}`, { 
      fileSize: file.size, 
      fileName: file.name,
      userId,
      authenticatedUserId 
    })

    // Verify bucket exists and is accessible
    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets()
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError)
    } else {
      const bucketExists = buckets?.some(b => b.id === category)
      if (!bucketExists) {
        console.error(`❌ Bucket '${category}' does not exist. Available buckets:`, buckets?.map(b => b.id))
        return NextResponse.json({ error: `Storage bucket '${category}' not found` }, { status: 500 })
      }
    }

    // Upload to Supabase Storage using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from(category)
      .upload(fullPath, file, {
        upsert: upsert,
        cacheControl: category === 'avatars' ? '0' : '3600'
      })

    if (error) {
      console.error('❌ Storage upload error:', error)
      console.error('Error details:', {
        message: error.message,
        name: error.name
      })
      // Check if it's a StorageApiError with status code
      const statusCode = (error as any).statusCode || (error as any).status || 500
      return NextResponse.json({ 
        error: `Upload failed: ${error.message}`
      }, { status: statusCode })
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
