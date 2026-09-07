'use client'

import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, extractYouTubeId, isYouTubeShort } from '@/lib/youtube'

interface YouTubeEmbedProps {
  url: string
  title?: string
  className?: string
  /** Start playing when mounted (lightbox). */
  autoplay?: boolean
  /** Show thumbnail + play affordance instead of iframe until clicked (grid-friendly). */
  lazy?: boolean
  /**
   * gallery = tall portrait-friendly frame (phone readings)
   * default = classic 16:9
   */
  variant?: 'default' | 'gallery'
}

export default function YouTubeEmbed({
  url,
  title = 'YouTube video',
  className = '',
  autoplay = false,
  lazy = false,
  variant = 'default',
}: YouTubeEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(url, { autoplay: autoplay && !lazy })
  const thumb = getYouTubeThumbnailUrl(url)
  const id = extractYouTubeId(url)
  const portrait = variant === 'gallery' || isYouTubeShort(url)

  if (!embedUrl || !id) {
    return (
      <div className={`aspect-video bg-space-whale-navy/10 flex items-center justify-center rounded-xl ${className}`}>
        <p className="text-sm text-space-whale-navy/60 font-space-whale-body">Invalid YouTube link</p>
      </div>
    )
  }

  if (lazy) {
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

  const frameClass = portrait
    ? 'relative mx-auto h-[min(78dvh,calc(100dvh-9rem))] max-h-[min(82vh,52rem)] w-auto max-w-full aspect-[9/16] overflow-hidden rounded-lg bg-black'
    : 'relative w-full aspect-video max-h-[min(82vh,52rem)] overflow-hidden rounded-lg bg-black'

  return (
    <div className={`${frameClass} ${className}`}>
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
