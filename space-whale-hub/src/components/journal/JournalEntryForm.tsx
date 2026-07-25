'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { encryptJournalContent } from '@/lib/journal-encryption'
import { Loader2, Save, X, Camera, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react'

interface JournalEntryFormProps {
  onSuccess?: (entry: any) => void
  onCancel?: () => void
}

function friendlyMediaName(url: string, fallback = 'Photo attached') {
  const raw = decodeURIComponent(url.split('/').pop() || '')
  const withoutTimestamp = raw.replace(/^\d+-/, '')
  const cleaned = withoutTimestamp.replace(/[-_]/g, ' ').trim()
  if (!cleaned || cleaned.length > 40) return fallback
  return cleaned
}

export default function JournalEntryForm({ onSuccess, onCancel }: JournalEntryFormProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [mediaLabel, setMediaLabel] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEncryption, setShowEncryption] = useState(false)
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
      setError('Please choose an image, video, or audio file.')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB.`)
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
      setMediaLabel(file.name.replace(/^\d+-/, '') || 'Photo attached')
      const isVideo = file.type.startsWith('video/') || videoExtensions.includes(fileExtension)
      setMediaType(isImage ? 'image' : isVideo ? 'video' : 'document')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const clearMedia = () => {
    setMediaUrl('')
    setMediaType('')
    setMediaLabel('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setLoading(true)

    try {
      if (enableEncryption) {
        if (!encryptionPassphrase || encryptionPassphrase.length < 8) {
          setError('Encryption passphrase must be at least 8 characters.')
          setLoading(false)
          return
        }
        if (encryptionPassphrase !== confirmPassphrase) {
          setError('Passphrases do not match.')
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
          mood: mood || undefined,
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
      setMood('')
      clearMedia()
      setEnableEncryption(false)
      setEncryptionPassphrase('')
      setConfirmPassphrase('')
      setShowEncryption(false)

      onSuccess?.(result.entry)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formBody = (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Primary: write first */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
            What&apos;s on your mind?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            autoFocus
            className="mobile-textarea w-full px-4 py-3 border border-space-whale-lavender/30 rounded-xl bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors"
            placeholder="Write freely…"
            maxLength={10000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-space-whale-purple font-space-whale-body">Private to you</p>
            <span className="text-xs text-space-whale-purple/70">{content.length.toLocaleString()} / 10,000</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
            Title <span className="text-space-whale-purple/60 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mobile-input w-full px-4 py-3 border border-space-whale-lavender/30 rounded-xl bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
            placeholder="A few words to find this later…"
            maxLength={200}
          />
        </div>

        {/* Photo attachment */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
            Photo <span className="text-space-whale-purple/60 font-normal">(optional)</span>
          </label>

          {!mediaUrl ? (
            <>
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl border border-dashed border-space-whale-lavender/40 bg-white/80 text-space-whale-navy hover:border-space-whale-purple/50 hover:bg-space-whale-lavender/10 transition-colors touch-manipulation"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-space-whale-purple" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 text-space-whale-purple" />
                    Add a photo, video, or audio clip
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="rounded-xl border border-space-whale-lavender/30 bg-white overflow-hidden">
              {mediaType === 'image' ? (
                <div className="relative">
                  <img
                    src={mediaUrl}
                    alt={mediaLabel || 'Attached photo'}
                    className="w-full max-h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearMedia}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-space-whale-navy truncate">
                      {mediaLabel || friendlyMediaName(mediaUrl, 'Media attached')}
                    </p>
                    <p className="text-sm text-space-whale-purple/70 capitalize">{mediaType} attached</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearMedia}
                    className="ml-3 p-2 text-space-whale-purple/60 hover:text-red-500 transition-colors"
                    aria-label="Remove media"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Encryption — collapsed by default */}
        <div className="border border-space-whale-lavender/25 rounded-xl overflow-hidden bg-space-whale-lavender/5">
          <button
            type="button"
            onClick={() => setShowEncryption((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-space-whale-navy hover:bg-space-whale-lavender/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              {enableEncryption ? (
                <Lock className="h-4 w-4 text-space-whale-purple" />
              ) : (
                <Unlock className="h-4 w-4 text-space-whale-purple/60" />
              )}
              Extra encryption <span className="font-normal text-space-whale-purple/60">(optional)</span>
            </span>
            {showEncryption ? (
              <ChevronUp className="h-4 w-4 text-space-whale-purple/60" />
            ) : (
              <ChevronDown className="h-4 w-4 text-space-whale-purple/60" />
            )}
          </button>

          {showEncryption && (
            <div className="px-4 pb-4 space-y-3 border-t border-space-whale-lavender/20">
              <label className="flex items-start gap-2 text-sm text-space-whale-navy cursor-pointer">
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
                  className="mt-0.5 h-4 w-4 text-space-whale-purple focus:ring-space-whale-purple border-space-whale-lavender/30 rounded"
                />
                <span className="font-space-whale-body text-sm leading-relaxed">
                  Encrypt this entry with a passphrase only you know. We can&apos;t recover it if you forget.
                </span>
              </label>

              {enableEncryption && (
                <div className="space-y-3 pt-1">
                  <input
                    type="password"
                    value={encryptionPassphrase}
                    onChange={(e) => setEncryptionPassphrase(e.target.value)}
                    className="mobile-input w-full px-3 py-2.5 text-sm border border-space-whale-lavender/30 rounded-lg bg-white"
                    placeholder="Passphrase (min 8 characters)"
                    minLength={8}
                  />
                  <input
                    type="password"
                    value={confirmPassphrase}
                    onChange={(e) => setConfirmPassphrase(e.target.value)}
                    className="mobile-input w-full px-3 py-2.5 text-sm border border-space-whale-lavender/30 rounded-lg bg-white"
                    placeholder="Confirm passphrase"
                    minLength={8}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky actions */}
      <div className="shrink-0 border-t border-space-whale-lavender/20 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-5 py-3 min-h-[44px] border border-space-whale-lavender/30 text-space-whale-navy rounded-xl hover:bg-space-whale-lavender/10 transition-colors font-space-whale-accent touch-manipulation"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || uploading || !content.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-space-whale-navy text-white rounded-xl font-space-whale-accent hover:bg-space-whale-dark-purple disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save entry
            </>
          )}
        </button>
      </div>
    </form>
  )

  const panel = (
    <div className="flex flex-col max-h-[min(92vh,900px)] w-full bg-white shadow-2xl md:rounded-2xl md:max-w-lg overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-space-whale-lavender/20 bg-white">
        <div>
          <h2 className="text-lg sm:text-xl font-space-whale-heading text-space-whale-navy">New journal entry</h2>
          <p className="text-xs text-space-whale-purple/70 font-space-whale-body mt-0.5">Only you can see this</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-full text-space-whale-purple/70 hover:text-space-whale-navy hover:bg-space-whale-lavender/15 transition-colors touch-manipulation"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {formBody}
    </div>
  )

  if (onCancel && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
        <button
          type="button"
          className="absolute inset-0 bg-space-whale-navy/40 backdrop-blur-[2px]"
          onClick={onCancel}
          aria-label="Close journal form"
        />
        <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden">
          {panel}
        </div>
      </div>,
      document.body
    )
  }

  return (
    <div className="bg-lofi-card rounded-xl shadow-lg rainbow-border-soft overflow-hidden">
      {panel}
    </div>
  )
}
