'use client'

import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, extractYouTubeId } from '@/lib/youtube'

interface YouTubeEmbedProps {
  url: string
  title?: string
  className?: string
  /** Start playing when mounted (lightbox). */
  autoplay?: boolean
  /** Show thumbnail + play affordance instead of iframe until clicked (grid-friendly). */
  lazy?: boolean
}

export default function YouTubeEmbed({
  url,
  title = 'YouTube video',
  className = '',
  autoplay = false,
  lazy = false,
}: YouTubeEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(url, { autoplay: autoplay && !lazy })
  const thumb = getYouTubeThumbnailUrl(url)
  const id = extractYouTubeId(url)

  if (!embedUrl || !id) {
    return (
      <div className={`aspect-video bg-space-whale-navy/10 flex items-center justify-center rounded-xl ${className}`}>
        <p className="text-sm text-space-whale-navy/60 font-space-whale-body">Invalid YouTube link</p>
      </div>
    )
  }

  if (lazy) {
    // Parent handles click-to-open lightbox; this is just a visual tile
    return (
      <div className={`relative w-full h-full min-h-full overflow-hidden bg-black ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb || undefined}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>
    )
  }

  return (
    <div className={`relative w-full aspect-video overflow-hidden rounded-xl bg-black ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  )
}
