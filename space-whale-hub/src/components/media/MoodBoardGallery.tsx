'use client'

import { getMoodBoardImageUrls } from '@/lib/mood-board'

interface MoodBoardGalleryProps {
  /** Raw entry tags (URLs mixed with text tags) or explicit URL list */
  tags?: string[] | null
  urls?: string[]
  onImageClick?: (index: number, allUrls: string[]) => void
  className?: string
}

function GalleryCell({
  url,
  alt,
  index,
  allUrls,
  onImageClick,
  overlay,
  className = '',
}: {
  url: string
  alt: string
  index: number
  allUrls: string[]
  onImageClick?: (index: number, allUrls: string[]) => void
  overlay?: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onImageClick?.(index, allUrls)}
      className={`relative overflow-hidden rounded-lg bg-space-whale-lavender/10 group focus:outline-none focus-visible:ring-2 focus-visible:ring-space-whale-purple ${className}`}
    >
      <img
        src={url}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
      {overlay && (
        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
          <span className="text-white text-lg sm:text-xl font-space-whale-accent">{overlay}</span>
        </div>
      )}
    </button>
  )
}

export default function MoodBoardGallery({
  tags,
  urls: urlsProp,
  onImageClick,
  className = '',
}: MoodBoardGalleryProps) {
  const urls = urlsProp ?? getMoodBoardImageUrls(tags)
  if (urls.length === 0) return null

  const count = urls.length

  if (count === 1) {
    return (
      <div className={className}>
        <GalleryCell
          url={urls[0]}
          alt="Mood board image"
          index={0}
          allUrls={urls}
          onImageClick={onImageClick}
          className="block w-full aspect-[4/3] sm:aspect-[16/10] rounded-xl"
        />
      </div>
    )
  }

  if (count === 2) {
    return (
      <div className={`grid grid-cols-2 gap-1.5 ${className}`}>
        {urls.slice(0, 2).map((url, index) => (
          <GalleryCell
            key={url}
            url={url}
            alt={`Mood board image ${index + 1}`}
            index={index}
            allUrls={urls}
            onImageClick={onImageClick}
            className="aspect-square sm:aspect-[4/5]"
          />
        ))}
      </div>
    )
  }

  if (count === 3) {
    return (
      <div className={`grid grid-cols-2 grid-rows-2 gap-1.5 w-full min-h-[13rem] sm:min-h-[16rem] ${className}`}>
        <GalleryCell
          url={urls[0]}
          alt="Mood board image 1"
          index={0}
          allUrls={urls}
          onImageClick={onImageClick}
          className="row-span-2 h-full"
        />
        <GalleryCell
          url={urls[1]}
          alt="Mood board image 2"
          index={1}
          allUrls={urls}
          onImageClick={onImageClick}
          className="h-full min-h-0"
        />
        <GalleryCell
          url={urls[2]}
          alt="Mood board image 3"
          index={2}
          allUrls={urls}
          onImageClick={onImageClick}
          className="h-full min-h-0"
        />
      </div>
    )
  }

  // 4+ images: 2×2 collage; fourth tile shows "+N more" when needed
  const visible = urls.slice(0, 4)
  const extra = count - 4

  return (
    <div className={`grid grid-cols-2 gap-1.5 w-full ${className}`}>
      {visible.map((url, index) => (
        <GalleryCell
          key={`${url}-${index}`}
          url={url}
          alt={`Mood board image ${index + 1}`}
          index={index}
          allUrls={urls}
          onImageClick={onImageClick}
          overlay={index === 3 && extra > 0 ? `+${extra}` : undefined}
          className="aspect-square w-full min-h-0"
        />
      ))}
    </div>
  )
}
