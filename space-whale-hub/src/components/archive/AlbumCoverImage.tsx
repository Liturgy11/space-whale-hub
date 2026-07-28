'use client'

import { useState } from 'react'
import AlbumCoverPlaceholder from './AlbumCoverPlaceholder'

interface AlbumCoverImageProps {
  src?: string
  alt: string
  className?: string
  placeholderClassName?: string
  placeholderRoundedClassName?: string
}

export default function AlbumCoverImage({
  src,
  alt,
  className = 'w-full h-60 object-cover rounded-t-xl',
  placeholderClassName = 'h-60',
  placeholderRoundedClassName = 'rounded-t-xl',
}: AlbumCoverImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <AlbumCoverPlaceholder
        className={placeholderClassName}
        roundedClassName={placeholderRoundedClassName}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      width={400}
      height={240}
      onError={() => setFailed(true)}
    />
  )
}
