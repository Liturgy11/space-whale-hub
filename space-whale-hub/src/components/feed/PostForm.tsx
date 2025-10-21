'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createPost } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { Image, Video, Smile, Send, X, AlertTriangle, Loader2 } from 'lucide-react'

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

  const handleFileUpload = async (file: File) => {
    if (!user) return

    setUploadingMedia(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/community/${fileName}`

      console.log('Uploading file:', { fileName, filePath, fileSize: file.size, fileType: file.type })

      // Convert file to base64 for now (bypasses storage RLS issues)
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const base64Data = await base64Promise
      console.log('Converted to base64, length:', base64Data.length)
      console.log('Base64 preview:', base64Data.substring(0, 100) + '...')

      // For now, just use the base64 data directly
      const data = { publicUrl: base64Data }

      console.log('Public URL:', data.publicUrl)

      setMediaUrl(data.publicUrl)
      setMediaType(file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document')
      setShowMediaUpload(false)
    } catch (err: any) {
      console.error('File upload error:', err)
      setError(err.message)
    } finally {
      setUploadingMedia(false)
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
            userId: user.id,
            displayName: user.user_metadata?.display_name || 'Lit'
          }),
        })
      } catch (profileError) {
        console.log('Profile creation failed, continuing anyway:', profileError)
      }

      // Then create the post
      await createPost({
        content: content.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        content_warning: hasContentWarning ? contentWarning : null,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined
      }, user.id)

      setContent('')
      setTags('')
      setContentWarning('')
      setHasContentWarning(false)
      setMediaUrl('')
      setMediaType('')
      setShowMediaUpload(false)
      
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Share with Fellow Space Whales</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Input */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's forming and reforming in you? Share your half-baked wonder, your garden's harvest, or what's taking root..."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
            placeholder="Add tags (separated by commas): garden, cocoon, metamorphosis, whenua, cycles, pride poetry, art therapy..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            suppressHydrationWarning
          />
          <div className="mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested tags:</p>
            <div className="flex flex-wrap gap-2">
              {['pride poetry', 'art therapy', 'neurodivergent', 'healing', 'garden', 'cocoon', 'metamorphosis', 'whenua', 'cycles', 'embodied', 'somatic', 'trauma-informed'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const currentTags = tags ? tags.split(',').map(t => t.trim()) : []
                    if (!currentTags.includes(tag)) {
                      setTags([...currentTags, tag].join(', '))
                    }
                  }}
                  className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tags help others find your post
          </p>
        </div>

        {/* Content Warning */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasContentWarning}
              onChange={(e) => setHasContentWarning(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              This post contains content that may need gentle tending
            </span>
          </label>
          
          {hasContentWarning && (
            <input
              type="text"
              value={contentWarning}
              onChange={(e) => setContentWarning(e.target.value)}
              placeholder="What needs gentle tending? (e.g., grief, transformation, tender places...)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          )}
        </div>

        {/* Media Display */}
        {mediaUrl && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {mediaType === 'image' ? (
                  <Image className="h-6 w-6 text-indigo-600" />
                ) : mediaType === 'video' ? (
                  <Video className="h-6 w-6 text-indigo-600" />
                ) : (
                  <Smile className="h-6 w-6 text-indigo-600" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {mediaType === 'image' ? 'Image' : mediaType === 'video' ? 'Video' : 'Mood'} attached
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
                <X className="h-5 w-5" />
              </button>
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
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowMediaUpload(true)}
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Image className="h-4 w-4 mr-1" />
              Image
            </button>
            <button
              type="button"
              onClick={() => setShowMediaUpload(true)}
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Video className="h-4 w-4 mr-1" />
              Video
            </button>
            <button
              type="button"
              onClick={() => {
                // For now, just set a placeholder mood
                setMediaUrl('mood-placeholder')
                setMediaType('mood')
              }}
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Smile className="h-4 w-4 mr-1" />
              Mood
            </button>
          </div>

          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || uploading}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  onClick={() => setShowMediaUpload(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                  accept="image/*,video/*"
                  className="hidden"
                  id="media-upload"
                />
                <label
                  htmlFor="media-upload"
                  className={`inline-block px-6 py-3 rounded-lg transition-colors cursor-pointer ${
                    uploadingMedia 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
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
                  Supports images and videos
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
