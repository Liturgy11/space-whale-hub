'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createPost } from '@/lib/database'
import { uploadMedia } from '@/lib/storage-client'
import { Image, Video, Send, X, AlertTriangle, Loader2, AlertCircle } from 'lucide-react'
import { toast } from '@/components/ui/Toast'

interface PostFormProps {
  onPostCreated?: () => void
  onCancel?: () => void
}

export default function PostForm({ onPostCreated, onCancel }: PostFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [contentWarning, setContentWarning] = useState('')
  const [hasContentWarning, setHasContentWarning] = useState(false)
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState('')
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!user) {
      return
    }

    // Validate file type (Android browsers sometimes return empty MIME types)
    const isValidMimeType = file.type.startsWith('image/') || file.type.startsWith('video/')
    
    // Fallback: check file extension for Android compatibility
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const videoExtensions = ['.mp4', '.webm']
    const isValidExtension = imageExtensions.includes(fileExtension) || videoExtensions.includes(fileExtension)
    
    if (!isValidMimeType && !isValidExtension) {
      const errorMsg = 'Please upload an image or video file'
      setError(errorMsg)
      toast(errorMsg, 'error')
      return
    }

    // Check file size (10MB limit for posts)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(1)
      const errorMsg = `File too large: ${fileSizeMB}MB. Maximum size for posts is 10MB. Please choose a smaller file or compress the image.`
      setError(errorMsg)
      toast(errorMsg, 'error')
      return
    }

    setUploadingMedia(true)
    setError('')
    setIsDragging(false)

    try {
      // Use new storage system instead of base64
      const result = await uploadMedia(file, {
        category: 'posts',
        filename: `${Date.now()}-${file.name}`
      }, user.id)
      
      setMediaUrl(result.url)
      // Determine media type (handle Android empty MIME types)
      const isImage = file.type.startsWith('image/') || imageExtensions.includes(fileExtension)
      setMediaType(isImage ? 'image' : 'video')
      setShowMediaUpload(false)
      toast('Media uploaded successfully', 'success')
    } catch (err: any) {
      console.error('File upload error:', err)
      const errorMessage = err?.message || 'Failed to upload media'
      setError(errorMessage)
      toast(errorMessage, 'error')
      // Don't close the modal on error so user can try again
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!uploadingMedia) {
      setIsDragging(true)
    }
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

    if (uploadingMedia) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setUploading(true)
    setError('')

    try {
      // First, ensure the user has a profile (this fixes RLS issues)
      try {
        await fetch('/api/create-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user!.id,
            displayName: user!.user_metadata?.display_name || 'Lit'
          }),
        })
      } catch (profileError) {
        // Profile creation failed, but continue with post creation
      }

      // Then create the post
      await createPost({
        content: content.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        content_warning: hasContentWarning ? contentWarning : undefined,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined
      }, user!.id)

      setContent('')
      setTags('')
      setContentWarning('')
      setHasContentWarning(false)
      setMediaUrl('')
      setMediaType('')
      setShowMediaUpload(false)
      
      toast('Post shared successfully!', 'success')
      
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (err: any) {
      setError(err.message)
      toast(err.message || 'Failed to create post', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-lofi-card rounded-xl p-4 sm:p-6 rainbow-border-soft glow-soft mobile-card">
      {onCancel && (
        <div className="flex justify-end mb-4">
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-space-whale-purple transition-colors p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mobile-form">
        {/* Content Input */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's forming in you?"
            className="w-full p-3 sm:p-4 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent resize-none font-space-whale-body text-space-whale-navy mobile-textarea"
            rows={4}
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {content.length}/2000 characters
            </span>
          </div>
        </div>

        {/* Tags Input */}
        <div>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (optional)"
            className="w-full p-3 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body text-space-whale-navy mobile-input"
          />
        </div>

        {/* Content Warning Chip */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setHasContentWarning(!hasContentWarning)}
            className={`
              inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
              ${hasContentWarning
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            <AlertCircle className={`h-4 w-4 ${hasContentWarning ? 'text-yellow-600 dark:text-yellow-400' : ''}`} />
            <span>{hasContentWarning ? 'Content Warning Added' : 'Add Content Warning'}</span>
            {hasContentWarning && (
              <X 
                className="h-3 w-3 ml-1" 
                onClick={(e) => {
                  e.stopPropagation()
                  setHasContentWarning(false)
                  setContentWarning('')
                }}
              />
            )}
          </button>
          
          {hasContentWarning && (
            <input
              type="text"
              value={contentWarning}
              onChange={(e) => setContentWarning(e.target.value)}
              placeholder="Brief content warning"
              className="w-full p-3 border border-yellow-300 dark:border-yellow-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent mobile-input bg-yellow-50/50 dark:bg-yellow-900/10"
            />
          )}
        </div>

        {/* Media Display */}
        {mediaUrl && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              {mediaType === 'image' ? (
                <img 
                  src={mediaUrl} 
                  alt="Uploaded media" 
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="h-8 w-8 text-indigo-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {mediaType === 'image' ? 'Image' : 'Video'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {mediaUrl.split('/').pop()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl('')
                      setMediaType('')
                    }}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-2 flex-shrink-0"
                    aria-label="Remove media"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowMediaUpload(true)}
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Image className="h-4 w-4 mr-1" />
              Add Media
            </button>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || uploading}
              className="btn-lofi flex items-center justify-center px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-space-whale-purple focus:ring-offset-2"
              aria-label={uploading ? 'Posting...' : 'Share post'}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Share Post
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload Media</h3>
                <button
                  onClick={() => {
                    setShowMediaUpload(false)
                    setError('') // Clear error when closing modal
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                } ${uploadingMedia ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Image className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isDragging ? 'Drop file here' : 'Upload media'}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Drag and drop or click to browse
                </p>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0] && !uploadingMedia) {
                      handleFileUpload(e.target.files[0])
                    }
                  }}
                  accept="image/*,video/*"
                  className="hidden"
                  id="media-upload"
                  disabled={uploadingMedia}
                />
                <label
                  htmlFor="media-upload"
                  className={`inline-block px-6 py-3 rounded-lg transition-colors ${
                    uploadingMedia 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed pointer-events-none' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'
                  }`}
                >
                  {uploadingMedia ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                      Uploading...
                    </>
                  ) : (
                    'Choose File'
                  )}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Supports images and videos (max 10MB)
                </p>
                
                {/* Error Message in Modal */}
                {error && (
                  <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
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
