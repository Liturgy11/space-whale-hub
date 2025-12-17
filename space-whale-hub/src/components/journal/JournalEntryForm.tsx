'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { encryptJournalContent } from '@/lib/journal-encryption'
import { Loader2, Save, X, Upload, Image, X as XIcon, Lock, Unlock } from 'lucide-react'

interface JournalEntryFormProps {
  onSuccess?: (entry: any) => void
  onCancel?: () => void
}

export default function JournalEntryForm({ onSuccess, onCancel }: JournalEntryFormProps) {
  const { user, session } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [enableEncryption, setEnableEncryption] = useState(false)
  const [encryptionPassphrase, setEncryptionPassphrase] = useState('')
  const [confirmPassphrase, setConfirmPassphrase] = useState('')

  // Removed emoji mood selection - keeping it simple

  const handleFileUpload = async (file: File) => {
    if (!user) return

    // Validate file type (Android browsers sometimes return empty MIME types)
    const isValidMimeType = file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')
    
    // Fallback: check file extension for Android compatibility
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const videoExtensions = ['.mp4', '.webm']
    const audioExtensions = ['.mp3', '.wav']
    const isValidExtension = imageExtensions.includes(fileExtension) || videoExtensions.includes(fileExtension) || audioExtensions.includes(fileExtension)
    
    if (!isValidMimeType && !isValidExtension) {
      setError('Please upload an image, video, or audio file')
      return
    }

    // Check file size (10MB limit for journal)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
      setError(`File too large: ${fileSizeMB}MB. Maximum size for journal entries is 10MB. Please choose a smaller file or compress the image.`)
      return
    }

    try {
      // Use new storage system instead of base64
      const result = await uploadMedia(file, {
        category: 'journal',
        filename: `${Date.now()}-${file.name}`
      }, user.id)
      
      setMediaUrl(result.url)
      // Determine media type (handle Android empty MIME types)
      const isImage = file.type.startsWith('image/') || imageExtensions.includes(fileExtension)
      const isVideo = file.type.startsWith('video/') || videoExtensions.includes(fileExtension)
      setMediaType(isImage ? 'image' : isVideo ? 'video' : 'document')
      setShowMediaUpload(false)
      setError('') // Clear any previous errors
    } catch (err: any) {
      console.error('File upload failed:', err)
      setError(`Upload failed: ${err.message}`)
      // Don't close the modal on error so user can try again
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setLoading(true)

    try {
      // Validate encryption passphrase if encryption is enabled
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

      // Encrypt content if encryption is enabled
      if (enableEncryption && encryptionPassphrase) {
        try {
          encryptedData = await encryptJournalContent(finalContent, encryptionPassphrase)
          isEncrypted = true
          // Don't send plain text content when encrypted
          finalContent = '' // Clear plain text content
        } catch (encryptError: any) {
          setError(`Encryption failed: ${encryptError.message}`)
          setLoading(false)
          return
        }
      }

      // Use the secure API route that doesn't require authentication tokens
      const response = await fetch('/api/create-journal-entry-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim() || undefined,
          content: finalContent, // Empty if encrypted
          content_encrypted: encryptedData?.encrypted || null,
          is_encrypted: isEncrypted,
          encryption_key_id: encryptedData?.keyId || null,
          encryption_salt: encryptedData?.salt || null,
          encryption_iv: encryptedData?.iv || null,
          mood: mood || undefined,
          tags: [], // You can add tag functionality later
          media_url: mediaUrl || undefined,
          media_type: mediaType || undefined,
          is_private: true,
          userId: user.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create journal entry')
      }

      // Reset form
      setTitle('')
      setContent('')
      setMood('')
      setMediaUrl('')
      setMediaType('')
      setShowMediaUpload(false)
      setEnableEncryption(false)
      setEncryptionPassphrase('')
      setConfirmPassphrase('')

      if (onSuccess) onSuccess(result.entry)
    } catch (err: any) {
      console.error('Journal entry creation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-space-whale-heading text-space-whale-navy">New Journal Entry</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-space-whale-purple hover:text-space-whale-navy transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors"
            placeholder="Give your entry a title..."
            maxLength={200}
          />
        </div>


        {/* Media Upload Section */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-3 font-space-whale-body">
            Add Photos (Optional)
          </label>
          
          {!mediaUrl ? (
            <div className="border-2 border-dashed border-space-whale-lavender/30 rounded-lg p-6 text-center hover:border-space-whale-purple/50 transition-colors">
              <Upload className="h-8 w-8 text-space-whale-purple mx-auto mb-2" />
              <p className="text-space-whale-navy mb-3 font-space-whale-body">
                Add photos, videos, or audio to your entry
              </p>
              <button
                type="button"
                onClick={() => setShowMediaUpload(true)}
                className="px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-colors font-space-whale-accent"
              >
                <Upload className="h-4 w-4 mr-2 inline" />
                Upload Media
              </button>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image className="h-6 w-6 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {mediaType === 'image' ? 'Image' : mediaType === 'video' ? 'Video' : 'Media'} attached
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mediaUrl.split('/').pop()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMediaUrl('')
                    setMediaType('')
                  }}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
            What's on your mind?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors resize-none"
            placeholder="Write freely..."
            maxLength={10000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-space-whale-purple font-space-whale-body">
              🔒 Private
            </p>
            <span className="text-xs text-space-whale-purple">
              {content.length}/10,000 characters
            </span>
          </div>
        </div>

        {/* Encryption Section */}
        <div className="border border-space-whale-lavender/30 rounded-lg p-4 bg-space-whale-lavender/5">
          <div className="flex items-center justify-between mb-3">
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
          </div>
          
          {enableEncryption && (
            <div className="space-y-3 mt-3">
              <div className="bg-space-whale-purple/5 border border-space-whale-purple/20 rounded-lg p-3">
                <p className="text-xs text-space-whale-navy font-space-whale-body mb-2">
                  <strong className="text-space-whale-purple">What is encryption?</strong>
                </p>
                <p className="text-xs text-space-whale-navy/80 font-space-whale-body leading-relaxed">
                  Encryption scrambles your words into unreadable code before they're saved. Even if someone accessed the database, they couldn't read your entry without your passphrase. Your content is protected with military-grade encryption that only you can unlock.
                </p>
              </div>
              <p className="text-xs text-space-whale-purple/70 font-space-whale-body">
                🔐 Your content will be encrypted before saving. This is your master encryption passphrase - you'll use the same passphrase for all encrypted entries. 
                <strong className="block mt-1 text-space-whale-purple">Important: We cannot recover your passphrase if you forget it!</strong>
              </p>
              <div>
                <label className="block text-xs font-medium text-space-whale-navy mb-1 font-space-whale-body">
                  Master Encryption Passphrase (min 8 characters)
                </label>
                <input
                  type="password"
                  value={encryptionPassphrase}
                  onChange={(e) => setEncryptionPassphrase(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors"
                  placeholder="Enter your master encryption passphrase"
                  minLength={8}
                />
                <p className="text-xs text-space-whale-purple/60 mt-1">
                  Use this same passphrase for all encrypted entries
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-space-whale-navy mb-1 font-space-whale-body">
                  Confirm Master Passphrase
                </label>
                <input
                  type="password"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors"
                  placeholder="Confirm your master passphrase"
                  minLength={8}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-space-whale-lavender/30 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/10 transition-colors font-space-whale-accent"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg font-space-whale-accent hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
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

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload Media</h3>
                <button
                  onClick={() => setShowMediaUpload(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Upload your creative content
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0])
                    }
                  }}
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Choose File
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Supports images, videos, and audio files
                </p>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
