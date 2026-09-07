'use client'

import { useState } from 'react'

interface FeedVideoProps {
  src: string
  className?: string
  /** Tighter height for compose-form previews */
  compact?: boolean
}

/**
 * Adapts to portrait vs landscape so phone clips aren't letterboxed
 * inside a forced wide feed frame.
 */
export default function FeedVideo({ src, className = '', compact = false }: FeedVideoProps) {
  const [portrait, setPortrait] = useState(false)

  const shell = portrait
    ? `mx-auto w-full max-w-[min(100%,22rem)] bg-black rounded-xl overflow-hidden shadow-md ${className}`
    : `w-full bg-black rounded-xl overflow-hidden shadow-md ${className}`

  const videoClass = portrait
    ? `w-full ${compact ? 'max-h-72' : 'max-h-[min(70vh,36rem)]'} object-contain`
    : `w-full ${compact ? 'max-h-56 sm:max-h-72' : 'max-h-80 sm:max-h-[28rem]'} object-contain`

  return (
    <div className={shell}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        className={videoClass}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget
          if (v.videoWidth > 0 && v.videoHeight > 0) {
            setPortrait(v.videoHeight > v.videoWidth)
          }
        }}
      />
    </div>
  )
}
