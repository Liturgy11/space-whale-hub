import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Check if service role key is available
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Uploads will use regular client.')
}

// Create admin client with service role key (if available)
const supabaseAdmin = serviceRoleKey ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

export async function POST(request: NextRequest) {
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

    if (!allowedTypes[category as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json({ error: `File type ${file.type} not allowed for ${category}` }, { status: 400 })
    }

    // Create file path
    const filename = `${Date.now()}-${file.name}`
    const folderPath = folder ? `${userId}/${category}/${folder}` : `${userId}/${category}`
    const fullPath = `${folderPath}/${filename}`

    // Upload using admin client (bypasses RLS) or fallback to regular client
    const client = supabaseAdmin || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

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
