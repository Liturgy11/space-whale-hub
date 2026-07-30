'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { MAX_POST_IMAGES } from '@/lib/post-media'
import MediaCarousel from '@/components/media/MediaCarousel'
import { Upload, Send, X, AlertCircle, Loader2, Plus } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface PostFormProps {
  onPostCreated?: () => void
  onCancel?: () => void
}

interface MediaItem {
  url: string
  type: 'image' | 'video'
}

export default function PostForm({ onPostCreated, onCancel }: PostFormProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [contentWarning, setContentWarning] = useState('')
  const [hasContentWarning, setHasContentWarning] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!onCancel) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [onCancel])

  const mediaUrls = mediaItems.map((m) => m.url)
  const hasVideo = mediaItems.some((m) => m.type === 'video')
  const canAddMore = !hasVideo && mediaItems.length < MAX_POST_IMAGES

  const compressImage = (file: File, maxWidth = 1200, quality = 0.82): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          resolve(
            blob
              ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
              : file
          )
        }, 'image/jpeg', quality)
      }
      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  const validateFile = (
    file: File,
    currentItems: MediaItem[]
  ): { ok: boolean; isImage: boolean; error?: string } => {
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const videoExtensions = ['.mp4', '.webm']
    const isValidMimeType = file.type.startsWith('image/') || file.type.startsWith('video/')
    const isValidExtension =
      imageExtensions.includes(fileExtension) || videoExtensions.includes(fileExtension)
    const isImage = file.type.startsWith('image/') || imageExtensions.includes(fileExtension)
    const isVideo = file.type.startsWith('video/') || videoExtensions.includes(fileExtension)
    const currentHasVideo = currentItems.some((m) => m.type === 'video')

    if (!isValidMimeType && !isValidExtension) {
      return { ok: false, isImage: false, error: 'Please upload an image or video file' }
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        ok: false,
        isImage,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`,
      }
    }

    if (isVideo && currentItems.length > 0) {
      return { ok: false, isImage: false, error: 'Remove images before adding a video.' }
    }
    if (isImage && currentHasVideo) {
      return { ok: false, isImage: true, error: 'Remove the video before adding images.' }
    }
    if (isImage && currentItems.length >= MAX_POST_IMAGES) {
      return { ok: false, isImage: true, error: `Maximum ${MAX_POST_IMAGES} images per post.` }
    }

    return { ok: true, isImage }
  }

  const handleFileUpload = async (file: File, currentItems?: MediaItem[]) => {
    if (!user) return

    const items = currentItems ?? mediaItems
    const validation = validateFile(file, items)
    if (!validation.ok) {
      setError(validation.error!)
      toast(validation.error!, 'error')
      return
    }

    setUploadingMedia(true)
    setError('')
    setIsDragging(false)

    try {
      const fileToUpload = validation.isImage ? await compressImage(file) : file
      const result = await uploadMedia(
        fileToUpload,
        { category: 'posts', filename: `${Date.now()}-${fileToUpload.name}` },
        user.id
      )

      const type = validation.isImage ? 'image' : 'video'
      setMediaItems((prev) => [...prev, { url: result.url, type }])
      toast(items.length > 0 ? 'Added to gallery' : 'Media uploaded', 'success')
      return [...items, { url: result.url, type: type as 'image' | 'video' }]
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload media'
      setError(errorMessage)
      toast(errorMessage, 'error')
      return items
    } finally {
      setUploadingMedia(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFiles = async (files: FileList | File[]) => {
    let items = [...mediaItems]
    for (const file of Array.from(files)) {
      if (items.some((m) => m.type === 'video')) break
      if (items.length >= MAX_POST_IMAGES) break
      const next = await handleFileUpload(file, items)
      if (next) items = next
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!uploadingMedia && canAddMore) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (uploadingMedia || !e.dataTransfer.files?.length) return
    handleFiles(e.dataTransfer.files)
  }

  const removeMediaAt = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index))
  }

  const clearMedia = () => setMediaItems([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user) return

    setUploading(true)
    setError('')

    const urls = mediaItems.map((m) => m.url)
    const primaryType = mediaItems[0]?.type

    try {
      try {
        await fetch('/api/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            displayName: user.user_metadata?.display_name || 'Lit',
          }),
        })
      } catch {
        // Profile creation is best-effort
      }

      const response = await fetch('/api/create-post-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          content_warning: hasContentWarning ? contentWarning : undefined,
          media_urls: urls.length > 0 ? urls : undefined,
          media_url: urls[0] || undefined,
          media_type:
            urls.length > 1 ? 'gallery' : primaryType || undefined,
          userId: user.id,
        }),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to create post')

      setContent('')
      setTags('')
      setContentWarning('')
      setHasContentWarning(false)
      clearMedia()

      toast('Post shared successfully!', 'success')
      onPostCreated?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create post'
      setError(message)
      toast(message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const formBody = (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm font-space-whale-body">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-1.5 font-space-whale-body">
            What&apos;s forming in you?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely..."
            autoFocus
            className="mobile-textarea w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg form-surface text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent resize-none font-space-whale-body"
            rows={5}
            maxLength={2000}
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-xs text-space-whale-purple font-space-whale-body">
              {content.length}/2,000 characters
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-1.5 font-space-whale-body">
            Tags <span className="text-space-whale-purple/60 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. poetry, nature, process"
            className="mobile-input w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg form-surface text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body"
          />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              if (hasContentWarning) {
                setHasContentWarning(false)
                setContentWarning('')
              } else {
                setHasContentWarning(true)
              }
            }}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-space-whale-accent transition-colors touch-manipulation ${
              hasContentWarning
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-space-whale-lavender/10 text-space-whale-navy border border-space-whale-lavender/30 hover:bg-space-whale-lavender/20'
            }`}
          >
            <AlertCircle className={`h-4 w-4 ${hasContentWarning ? 'text-yellow-600' : 'text-space-whale-purple'}`} />
            {hasContentWarning ? 'Content warning added' : 'Add content warning'}
          </button>

          {hasContentWarning && (
            <input
              type="text"
              value={contentWarning}
              onChange={(e) => setContentWarning(e.target.value)}
              placeholder="Brief content warning for readers"
              className="mobile-input w-full px-4 py-3 border border-yellow-300 rounded-lg bg-yellow-50/50 text-space-whale-navy focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-space-whale-body"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
            Media <span className="text-space-whale-purple/60 font-normal">(optional)</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple={!hasVideo}
            className="hidden"
            disabled={uploadingMedia || !canAddMore}
            onChange={(e) => {
              if (e.target.files?.length) handleFiles(e.target.files)
            }}
          />

          {mediaItems.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                isDragging
                  ? 'border-space-whale-purple bg-space-whale-lavender/20'
                  : 'border-space-whale-lavender/30 hover:border-space-whale-purple/50'
              } ${uploadingMedia ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <Upload className="h-7 w-7 text-space-whale-purple mx-auto mb-1.5" />
              <p className="text-sm text-space-whale-navy mb-1 font-space-whale-body">
                Add photos or a video
              </p>
              <p className="text-xs text-space-whale-purple/80 mb-2 font-space-whale-body">
                Up to {MAX_POST_IMAGES} images · swipe through them in one post
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingMedia}
                className="px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-colors font-space-whale-accent text-sm touch-manipulation"
              >
                {uploadingMedia ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2 inline" />
                    Choose Media
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <MediaCarousel
                urls={mediaUrls}
                mediaType={hasVideo ? 'video' : mediaUrls.length > 1 ? 'gallery' : 'image'}
                variant="preview"
                onRemove={removeMediaAt}
              />

              <div className="flex items-center justify-between gap-2">
                {canAddMore && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia}
                    className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-sm border border-space-whale-lavender/30 rounded-lg text-space-whale-navy hover:bg-space-whale-lavender/10 font-space-whale-accent touch-manipulation"
                  >
                    {uploadingMedia ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add more ({mediaItems.length}/{MAX_POST_IMAGES})
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="text-sm text-red-600 hover:text-red-700 font-space-whale-body touch-manipulation"
                >
                  Remove all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-space-whale-lavender/20 bg-lofi-card/95 backdrop-blur-sm px-4 sm:px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 min-h-[44px] border border-space-whale-lavender/30 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/10 transition-colors font-space-whale-accent touch-manipulation"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || uploading || uploadingMedia}
          className="flex items-center px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg font-space-whale-accent hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg touch-manipulation"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Sharing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Share Post
            </>
          )}
        </button>
      </div>
    </form>
  )

  const panel = (
    <div className="flex flex-col min-h-0 h-full max-h-[85dvh] sm:max-h-[min(92vh,900px)] w-full bg-lofi-card shadow-2xl rainbow-border-soft md:rounded-2xl md:max-w-lg overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-space-whale-heading text-space-whale-navy">
            Share to Community Orbit
          </h2>
          <p className="text-xs text-space-whale-purple/70 font-space-whale-body mt-0.5">
            Your community can see this
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-space-whale-purple hover:text-space-whale-navy transition-colors touch-manipulation"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      {formBody}
    </div>
  )

  if (onCancel && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 sm:pt-4">
        <button
          type="button"
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onCancel}
          aria-label="Close share form"
        />
        <div className="relative w-full sm:max-w-lg flex flex-col min-h-0 max-h-[85dvh] sm:max-h-[min(88dvh,900px)] rounded-t-2xl sm:rounded-2xl overflow-hidden">
          {panel}
        </div>
      </div>,
      document.body
    )
  }

  return panel
}
