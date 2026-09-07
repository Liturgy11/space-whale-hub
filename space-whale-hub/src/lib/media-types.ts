export type MediaCategory = 'avatars' | 'posts' | 'journal' | 'archive'

/** Soft client limits — keep images small; allow larger archive videos via signed upload. */
export const SIZE_LIMITS: Record<MediaCategory, number> = {
  avatars: 5 * 1024 * 1024,
  posts: 100 * 1024 * 1024, // videos on Community Orbit use signed upload
  journal: 10 * 1024 * 1024,
  archive: 100 * 1024 * 1024, // photos + short videos
}

/** Prefer API for small files; use signed direct upload above this (avoids Vercel ~4.5MB cap). */
export const SIGNED_UPLOAD_THRESHOLD = 3.5 * 1024 * 1024

export const ALLOWED_MIME_TYPES: Record<MediaCategory, string[]> = {
  avatars: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
  posts: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
    'video/mp4', 'video/webm', 'video/quicktime',
  ],
  journal: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
  archive: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a',
    'application/pdf',
  ],
}

export const EXTENSION_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.pdf': 'application/pdf',
}

export function getFileExtension(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i).toLowerCase() : ''
}

export function inferMimeType(file: File): string {
  if (file.type && file.type !== 'application/octet-stream') return file.type
  return EXTENSION_TO_MIME[getFileExtension(file.name)] || file.type || ''
}

export function isAllowedMedia(file: File, category: MediaCategory): boolean {
  const allowed = ALLOWED_MIME_TYPES[category]
  const mime = inferMimeType(file)
  if (mime && allowed.includes(mime)) return true
  const inferred = EXTENSION_TO_MIME[getFileExtension(file.name)]
  return !!inferred && allowed.includes(inferred)
}

export function isVideoFile(file: File): boolean {
  const mime = inferMimeType(file)
  if (mime.startsWith('video/')) return true
  return ['.mp4', '.m4v', '.webm', '.mov'].includes(getFileExtension(file.name))
}

export function isAudioFile(file: File): boolean {
  const mime = inferMimeType(file)
  if (mime.startsWith('audio/')) return true
  return ['.mp3', '.wav', '.m4a'].includes(getFileExtension(file.name))
}

export function archiveContentType(
  file: File
): 'video' | 'artwork' | 'audio' | 'zine' {
  if (isVideoFile(file)) return 'video'
  if (isAudioFile(file)) return 'audio'
  if (getFileExtension(file.name) === '.pdf') return 'zine'
  return 'artwork'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function sizeLimitLabel(category: MediaCategory): string {
  return formatBytes(SIZE_LIMITS[category]).replace(/\.0MB$/, 'MB')
}
