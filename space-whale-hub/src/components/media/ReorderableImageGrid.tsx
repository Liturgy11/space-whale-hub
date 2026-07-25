'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, GripVertical, X } from 'lucide-react'
import { reorderArray } from '@/lib/reorder'

interface ReorderableImageGridProps {
  urls: string[]
  onChange: (urls: string[]) => void
  onRemove?: (index: number) => void
  columns?: 2 | 3
  hint?: string
}

export default function ReorderableImageGrid({
  urls,
  onChange,
  onRemove,
  columns = 3,
  hint = 'Use arrows to reorder · drag on desktop',
}: ReorderableImageGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const move = (from: number, direction: 'left' | 'right') => {
    const to = direction === 'left' ? from - 1 : from + 1
    onChange(reorderArray(urls, from, to))
  }

  const handleDrop = (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) return
    onChange(reorderArray(urls, dragIndex, toIndex))
    setDragIndex(null)
    setOverIndex(null)
  }

  if (urls.length === 0) return null

  return (
    <div>
      {urls.length > 1 && hint && (
        <p className="text-xs text-space-whale-purple/80 mb-2 font-space-whale-body">{hint}</p>
      )}
      <div className={`grid gap-2 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {urls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            draggable={urls.length > 1}
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => {
              setDragIndex(null)
              setOverIndex(null)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setOverIndex(index)
            }}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(index)
            }}
            className={`relative aspect-square rounded-lg overflow-hidden bg-space-whale-lavender/10 border-2 transition-colors touch-manipulation ${
              overIndex === index && dragIndex !== null
                ? 'border-space-whale-purple'
                : 'border-transparent'
            } ${dragIndex === index ? 'opacity-50' : ''}`}
          >
            <img
              src={url}
              alt={`Image ${index + 1} of ${urls.length}`}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />

            <span className="absolute top-1 left-1 bg-black/55 text-white text-[10px] min-w-[1.25rem] text-center px-1 py-0.5 rounded-full font-space-whale-body">
              {index + 1}
            </span>

            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-600 transition-colors touch-manipulation"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {urls.length > 1 && (
              <div className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-0.5 p-1 bg-gradient-to-t from-black/65 to-transparent">
                <button
                  type="button"
                  onClick={() => move(index, 'left')}
                  disabled={index === 0}
                  className="p-1.5 rounded-md text-white disabled:opacity-30 hover:bg-white/20 transition-colors touch-manipulation"
                  aria-label={`Move image ${index + 1} earlier`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <GripVertical className="h-4 w-4 text-white/70 shrink-0 hidden sm:block" aria-hidden />
                <button
                  type="button"
                  onClick={() => move(index, 'right')}
                  disabled={index === urls.length - 1}
                  className="p-1.5 rounded-md text-white disabled:opacity-30 hover:bg-white/20 transition-colors touch-manipulation"
                  aria-label={`Move image ${index + 1} later`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
