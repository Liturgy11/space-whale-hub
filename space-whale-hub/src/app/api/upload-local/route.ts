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

    if (!allowedTypes[category as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json({ error: `File type ${file.type} not allowed for ${category}` }, { status: 400 })
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





