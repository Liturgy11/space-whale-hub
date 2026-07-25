'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

interface MediaCarouselProps {
  urls: string[]
  mediaType?: 'image' | 'video' | 'gallery' | string
  variant?: 'feed' | 'preview'
  onSlideClick?: (index: number) => void
  onRemove?: (index: number) => void
  className?: string
}

export default function MediaCarousel({
  urls,
  mediaType = 'image',
  variant = 'feed',
  onSlideClick,
  onRemove,
  className = '',
}: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [urls.join('|')])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || urls.length <= 1) return

    const onScroll = () => {
      const width = el.clientWidth
      if (width <= 0) return
      const index = Math.round(el.scrollLeft / width)
      setActiveIndex(Math.max(0, Math.min(index, urls.length - 1)))
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [urls.length])

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    const next = Math.max(0, Math.min(index, urls.length - 1))
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    setActiveIndex(next)
  }

  if (urls.length === 0) return null

  const isVideo = mediaType === 'video'
  const isFeed = variant === 'feed'
  const heightClass = isFeed ? 'h-72 sm:h-96' : 'h-44 sm:h-52'
  const clickable = Boolean(onSlideClick)

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={`relative w-full shrink-0 snap-start ${heightClass} ${
              clickable ? 'cursor-pointer group' : ''
            }`}
            onClick={() => onSlideClick?.(index)}
          >
            {isVideo ? (
              <video
                src={url}
                controls
                className="w-full h-full object-cover rounded-xl shadow-md"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <img
                  src={url}
                  alt={`Post media ${index + 1} of ${urls.length}`}
                  className={`w-full h-full object-cover rounded-xl shadow-md transition-transform ${
                    clickable ? 'group-hover:scale-[1.01]' : ''
                  }`}
                  loading={index === 0 ? 'lazy' : 'eager'}
                  decoding="async"
                />
                {clickable && isFeed && (
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ZoomIn className="h-4 w-4 text-white" />
                  </div>
                )}
              </>
            )}

            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(index)
                }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors touch-manipulation"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {urls.length > 1 && (
        <>
          {isFeed && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  scrollToIndex(activeIndex - 1)
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors hidden sm:flex touch-manipulation"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  scrollToIndex(activeIndex + 1)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors hidden sm:flex touch-manipulation"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/45">
            {urls.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  scrollToIndex(index)
                }}
                className={`rounded-full transition-all touch-manipulation ${
                  index === activeIndex
                    ? 'w-2 h-2 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-2 left-2 bg-black/45 text-white text-xs px-2 py-0.5 rounded-full font-space-whale-body">
            {activeIndex + 1} / {urls.length}
          </div>
        </>
      )}
    </div>
  )
}
