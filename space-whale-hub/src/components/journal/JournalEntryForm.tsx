'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { encryptJournalContent } from '@/lib/journal-encryption'
import { Loader2, Save, X, Upload, Image as ImageIcon, X as XIcon, Lock, Unlock } from 'lucide-react'

interface JournalEntryFormProps {
  onSuccess?: (entry: any) => void
  onCancel?: () => void
}

export default function JournalEntryForm({ onSuccess, onCancel }: JournalEntryFormProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enableEncryption, setEnableEncryption] = useState(false)
  const [encryptionPassphrase, setEncryptionPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')

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
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
          } else {
            resolve(file)
          }
        }, 'image/jpeg', quality)
      }
      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileUpload = async (file: File) => {
    if (!user) return

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const videoExtensions = ['.mp4', '.webm']
    const audioExtensions = ['.mp3', '.wav']
    const isValidMimeType =
      file.type.startsWith('image/') ||
      file.type.startsWith('video/') ||
      file.type.startsWith('audio/')
    const isValidExtension =
      imageExtensions.includes(fileExtension) ||
      videoExtensions.includes(fileExtension) ||
      audioExtensions.includes(fileExtension)
    const isImage = file.type.startsWith('image/') || imageExtensions.includes(fileExtension)

    if (!isValidMimeType && !isValidExtension) {
      setError('Please upload an image, video, or audio file')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
      setError(`File too large: ${fileSizeMB}MB. Maximum size for journal entries is 10MB.`)
      return
    }

    setUploading(true)
    setError('')

    try {
      const fileToUpload = isImage ? await compressImage(file) : file
      const result = await uploadMedia(
        fileToUpload,
        { category: 'journal', filename: `${Date.now()}-${fileToUpload.name}` },
        user.id
      )

      setMediaUrl(result.url)
      const isVideo = file.type.startsWith('video/') || videoExtensions.includes(fileExtension)
      setMediaType(isImage ? 'image' : isVideo ? 'video' : 'document')
    } catch (err: unknown) {
      setError(err instanceof Error ? `Upload failed: ${err.message}` : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const clearMedia = () => {
    setMediaUrl('')
    setMediaType('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setLoading(true)

    try {
      if (enableEncryption) {
        if (!encryptionPassphrase || encryptionPassphrase.length < 8) {
          setError('Encryption passphrase must be at least 8 characters long')
          setLoading(false)
          return
        }
        if (encryptionPassphrase !== confirmPassphrase) {
          setError('Passphrases do not match')
          setLoading(false)
          return
        }
      }

      let finalContent = content.trim()
      let encryptedData = null
      let isEncrypted = false

      if (enableEncryption && encryptionPassphrase) {
        try {
          encryptedData = await encryptJournalContent(finalContent, encryptionPassphrase)
          isEncrypted = true
          finalContent = ''
        } catch (encryptError: unknown) {
          setError(
            encryptError instanceof Error
              ? `Encryption failed: ${encryptError.message}`
              : 'Encryption failed. Please try again.'
          )
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/create-journal-entry-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || undefined,
          content: finalContent,
          content_encrypted: encryptedData?.encrypted || null,
          is_encrypted: isEncrypted,
          encryption_key_id: encryptedData?.keyId || null,
          encryption_salt: encryptedData?.salt || null,
          encryption_iv: encryptedData?.iv || null,
          tags: [],
          media_url: mediaUrl || undefined,
          media_type: mediaType || undefined,
          is_private: true,
          userId: user.id,
        }),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to create journal entry')

      setTitle('')
      setContent('')
      clearMedia()
      setEnableEncryption(false)
      setEncryptionPassphrase('')
      setConfirmPassphrase('')

      onSuccess?.(result.entry)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formBody = (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:p-5 sm:pt-0 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Write first */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-1.5 font-space-whale-body">
            What&apos;s on your mind?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            autoFocus
            className="mobile-textarea w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg form-surface text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors resize-none"
            placeholder="Write freely..."
            maxLength={10000}
          />
          <div className="flex justify-between items-center mt-1.5">
            <p className="text-xs text-space-whale-purple font-space-whale-body">🔒 Private</p>
            <span className="text-xs text-space-whale-purple">
              {content.length}/10,000 characters
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-1.5 font-space-whale-body">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mobile-input w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg form-surface text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors"
            placeholder="Give your entry a title..."
            maxLength={200}
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
            Add Photos (Optional)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />

          {!mediaUrl ? (
            <div className="border-2 border-dashed border-space-whale-lavender/30 rounded-lg p-4 text-center hover:border-space-whale-purple/50 transition-colors">
              <Upload className="h-7 w-7 text-space-whale-purple mx-auto mb-1.5" />
              <p className="text-sm text-space-whale-navy mb-2 font-space-whale-body">
                Add photos, videos, or audio to your entry
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-colors font-space-whale-accent text-sm min-h-[44px] touch-manipulation"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2 inline" />
                    Upload Media
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="border border-space-whale-lavender/30 rounded-lg overflow-hidden form-surface">
              <div className="flex items-center justify-between px-3 py-2 bg-space-whale-lavender/5">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5 text-space-whale-purple" />
                  <p className="font-medium text-space-whale-navy text-sm font-space-whale-body">
                    {mediaType === 'image' ? 'Image' : mediaType === 'video' ? 'Video' : 'Media'} attached
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearMedia}
                  className="text-space-whale-purple/60 hover:text-red-600 transition-colors p-1"
                  aria-label="Remove media"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              {mediaType === 'image' && (
                <img
                  src={mediaUrl}
                  alt="Attached"
                  className="w-full max-h-36 object-cover"
                />
              )}
            </div>
          )}
        </div>

        {/* Encryption */}
        <div className="border border-space-whale-lavender/30 rounded-lg p-3 sm:p-4 bg-space-whale-lavender/5">
          <label className="flex items-center text-sm font-medium text-space-whale-navy font-space-whale-body cursor-pointer">
            <input
              type="checkbox"
              checked={enableEncryption}
              onChange={(e) => {
                setEnableEncryption(e.target.checked)
                if (!e.target.checked) {
                  setEncryptionPassphrase('')
                  setConfirmPassphrase('')
                }
              }}
              className="mr-2 h-4 w-4 text-space-whale-purple focus:ring-space-whale-purple border-space-whale-lavender/30 rounded"
            />
            {enableEncryption ? (
              <Lock className="h-4 w-4 mr-2 text-space-whale-purple" />
            ) : (
              <Unlock className="h-4 w-4 mr-2 text-gray-400" />
            )}
            <span>Encrypt this entry</span>
          </label>

          {enableEncryption && (
            <div className="space-y-3 mt-3">
              <div className="bg-space-whale-purple/5 border border-space-whale-purple/20 rounded-lg p-3">
                <p className="text-xs text-space-whale-navy font-space-whale-body mb-1">
                  <strong className="text-space-whale-purple">What is encryption?</strong>
                </p>
                <p className="text-xs text-space-whale-navy/80 font-space-whale-body leading-relaxed">
                  Encryption scrambles your words before they&apos;re saved. Only you can unlock them with your passphrase.
                </p>
              </div>
              <input
                type="password"
                value={encryptionPassphrase}
                onChange={(e) => setEncryptionPassphrase(e.target.value)}
                className="mobile-input w-full px-3 py-2 text-sm border border-space-whale-lavender/30 rounded-lg form-surface text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                placeholder="Master encryption passphrase (min 8 characters)"
                minLength={8}
              />
              <input
                type="password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                className="mobile-input w-full px-3 py-2 text-sm border border-space-whale-lavender/30 rounded-lg form-surface text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                placeholder="Confirm passphrase"
                minLength={8}
              />
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
          disabled={loading || uploading || !content.trim()}
          className="flex items-center px-5 py-2.5 min-h-[44px] bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg font-space-whale-accent hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl touch-manipulation"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Entry
            </>
          )}
        </button>
      </div>
    </form>
  )

  const panel = (
    <div className="flex flex-col min-h-0 h-full max-h-[85dvh] sm:max-h-[min(92vh,900px)] w-full bg-lofi-card shadow-2xl rainbow-border-soft md:rounded-2xl md:max-w-lg overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-0">
        <h2 className="text-xl sm:text-2xl font-space-whale-heading text-space-whale-navy">
          New Journal Entry
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
          aria-label="Close journal form"
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
