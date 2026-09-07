/** YouTube helpers for unlisted/public embeds (stays on-platform). */

export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  try {
    const trimmed = url.trim()
    const u = new URL(trimmed)

    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return id || null
    }

    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        return u.pathname.split('/')[2] || null
      }
      if (u.pathname.startsWith('/shorts/')) {
        return u.pathname.split('/')[2] || null
      }
      if (u.pathname.startsWith('/live/')) {
        return u.pathname.split('/')[2] || null
      }
      const v = u.searchParams.get('v')
      if (v) return v
    }
  } catch {
    // bare ID?
    if (/^[\w-]{11}$/.test(url.trim())) return url.trim()
  }
  return null
}

export function isYouTubeUrl(url: string): boolean {
  return !!extractYouTubeId(url)
}

export function getYouTubeEmbedUrl(urlOrId: string, opts?: { autoplay?: boolean }): string | null {
  const id = extractYouTubeId(urlOrId) || (/^[\w-]{11}$/.test(urlOrId) ? urlOrId : null)
  if (!id) return null
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })
  if (opts?.autoplay) params.set('autoplay', '1')
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

/** Standard YouTube thumbnail (works for unlisted). */
export function getYouTubeThumbnailUrl(urlOrId: string, quality: 'hq' | 'mq' | 'sd' | 'max' = 'hq'): string | null {
  const id = extractYouTubeId(urlOrId) || (/^[\w-]{11}$/.test(urlOrId) ? urlOrId : null)
  if (!id) return null
  const map = {
    max: 'maxresdefault',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
  } as const
  return `https://i.ytimg.com/vi/${id}/${map[quality]}.jpg`
}

export function isExternalVideoUrl(url: string): boolean {
  if (!url || url.includes('supabase')) return false
  if (isYouTubeUrl(url)) return true
  try {
    const u = new URL(url)
    return u.hostname.includes('vimeo.com') || u.hostname.includes('cloudflare.stream')
  } catch {
    return false
  }
}
