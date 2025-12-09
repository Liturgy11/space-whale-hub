import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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
    const fullPath = join('public', 'uploads', folderPath)
    const filePath = join(fullPath, filename)

    // Ensure directory exists
    if (!existsSync(fullPath)) {
      await mkdir(fullPath, { recursive: true })
    }

    // Convert file to buffer and write
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return public URL
    const publicUrl = `/uploads/${folderPath}/${filename}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: `${folderPath}/${filename}`,
      bucket: category
    })

  } catch (error: any) {
    console.error('Local upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}





