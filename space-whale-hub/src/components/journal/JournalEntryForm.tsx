'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createJournalEntry } from '@/lib/database'
import { uploadMedia } from '@/lib/storage-api'
import { Loader2, Save, X, Upload, Image, X as XIcon } from 'lucide-react'

interface JournalEntryFormProps {
  onSuccess?: (entry: any) => void
  onCancel?: () => void
}

export default function JournalEntryForm({ onSuccess, onCancel }: JournalEntryFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMediaUpload, setShowMediaUpload] = useState(false)

  // Removed emoji mood selection - keeping it simple

  const handleFileUpload = async (file: File) => {
    if (!user) return

    try {
      console.log('Starting file upload for journal entry:', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type,
        userId: user.id 
      })

      // Use new storage system instead of base64
      const result = await uploadMedia(file, {
        category: 'journal',
        filename: `${Date.now()}-${file.name}`
      }, user.id)

      console.log('File upload successful:', { 
        url: result.url, 
        path: result.path, 
        bucket: result.bucket 
      })
      
      setMediaUrl(result.url)
      setMediaType(file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document')
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
      const entry = await createJournalEntry(user.id, {
        title: title.trim() || undefined,
        content: content.trim(),
        mood: mood || undefined,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined,
        is_private: true
      })

      // Reset form
      setTitle('')
      setContent('')
      setMood('')
      setMediaUrl('')
      setMediaType('')
      setShowMediaUpload(false)

      if (onSuccess) onSuccess(entry)
    } catch (err: any) {
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
            placeholder="Write freely... this space is just for you. Share your thoughts, feelings, experiences, or anything that's on your mind."
            maxLength={10000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-space-whale-purple font-space-whale-body">
              🔒 Private by default - only you can see this
            </p>
            <span className="text-xs text-space-whale-purple">
              {content.length}/10,000 characters
            </span>
          </div>
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
