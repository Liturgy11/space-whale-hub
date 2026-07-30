'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMultipleMedia } from '@/lib/storage-client'
import { Upload, X, Loader2, Plus, Trash2, Save } from 'lucide-react'

interface MoodBoardUploadProps {
  onUploadComplete?: (urls: string[], type: string, title?: string) => void
  onCancel?: () => void
}

interface UploadedFile {
  file: File
  preview: string
  id: string
}

export default function MoodBoardUpload({ onUploadComplete, onCancel }: MoodBoardUploadProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const filesRef = useRef<UploadedFile[]>([])

  useEffect(() => {
    filesRef.current = files
  }, [files])

  useEffect(() => {
    setMounted(true)
    return () => {
      filesRef.current.forEach((file) => URL.revokeObjectURL(file.preview))
    }
  }, [])

  useEffect(() => {
    if (!onCancel) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [onCancel])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    setError('')

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const imageFiles = newFiles.filter((file) => {
      const isValidMimeType = file.type.startsWith('image/')
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      return isValidMimeType || imageExtensions.includes(fileExtension)
    })

    if (imageFiles.length !== newFiles.length) {
      setError('Only image files are supported for mood boards.')
    }

    const maxSize = 10 * 1024 * 1024
    const oversized = imageFiles.find((file) => file.size > maxSize)
    if (oversized) {
      setError(
        `One file is ${(oversized.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB per image.`
      )
      return
    }

    const newUploadedFiles: UploadedFile[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
    }))

    setFiles((prev) => [...prev, ...newUploadedFiles])
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id)
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  const compressImage = (file: File, maxWidth = 1200, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()

      img.onload = () => {
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const uploadFiles = async () => {
    if (!files.length || !user) return

    setUploading(true)
    setError('')

    try {
      const compressedFiles: File[] = await Promise.all(
        files.map(async (f) => {
          try {
            const dataUrl = await compressImage(f.file, 1200, 0.82)
            const res = await fetch(dataUrl)
            const blob = await res.blob()
            return new File([blob], f.file.name, { type: 'image/jpeg' })
          } catch {
            return f.file
          }
        })
      )

      const results = await uploadMultipleMedia(
        compressedFiles,
        { category: 'journal', folder: 'moodboards' },
        user.id
      )

      onUploadComplete?.(
        results.map((result) => result.url),
        'moodboard',
        title.trim() || undefined
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const uploadZone = (
    <div
      className={`border-2 border-dashed rounded-lg p-4 sm:p-5 text-center transition-colors ${
        dragActive
          ? 'border-space-whale-purple bg-space-whale-lavender/20'
          : 'border-space-whale-lavender/30 hover:border-space-whale-purple/50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="h-8 w-8 text-space-whale-purple mx-auto mb-2" />
      <p className="text-sm font-space-whale-subheading text-space-whale-navy mb-1">
        Add your mood board images
      </p>
      <p className="text-sm text-space-whale-navy/80 mb-3 font-space-whale-body">
        Tap to browse, or drag images here on desktop
      </p>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-colors font-space-whale-accent text-sm touch-manipulation"
      >
        Choose Images
      </button>
      <p className="text-xs text-space-whale-purple mt-3 font-space-whale-body">
        Multiple images · max 10MB each
      </p>
    </div>
  )

  const panel = (
    <div className="flex flex-col min-h-0 h-full max-h-[85dvh] sm:max-h-[min(92vh,900px)] w-full bg-lofi-card shadow-2xl rainbow-border-soft md:rounded-2xl md:max-w-lg overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
        <h2 className="text-xl sm:text-2xl font-space-whale-heading text-space-whale-navy">
          Create Mood Board
        </h2>
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

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm font-space-whale-body">{error}</p>
          </div>
        )}

        {files.length === 0 ? (
          uploadZone
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {files.map((fileObj) => (
                <div key={fileObj.id} className="relative aspect-square rounded-lg overflow-hidden bg-space-whale-lavender/10">
                  <img
                    src={fileObj.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(fileObj.id)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors touch-manipulation"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] border border-space-whale-lavender/30 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/10 transition-colors font-space-whale-accent text-sm touch-manipulation"
            >
              <Plus className="h-4 w-4" />
              Add more images
            </button>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-1.5 font-space-whale-body">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Autumn vibes, Morning ritual"
            className="mobile-input w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors"
            maxLength={100}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          className="hidden"
          accept="image/*"
          multiple
        />
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
          type="button"
          onClick={uploadFiles}
          disabled={uploading || files.length === 0}
          className="flex items-center px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg font-space-whale-accent hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg touch-manipulation"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating…
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Mood Board
            </>
          )}
        </button>
      </div>
    </div>
  )

  if (onCancel && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-4 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 sm:pt-4">
        <button
          type="button"
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onCancel}
          aria-label="Close mood board form"
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
