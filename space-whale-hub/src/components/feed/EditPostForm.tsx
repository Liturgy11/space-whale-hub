'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updatePost } from '@/lib/database'
import { Image, Video, Smile, Save, X, AlertTriangle, Loader2 } from 'lucide-react'

interface Post {
  id: string
  content: string
  tags: string[]
  content_warning?: string
  media_url?: string
  media_type?: string
  created_at: string
  author: {
    id: string
    display_name: string
    pronouns?: string
    avatar_url?: string
  }
  likes_count: number
  comments_count: number
  is_liked: boolean
}

interface EditPostFormProps {
  post: Post
  onPostUpdated?: () => void
  onCancel?: () => void
}

export default function EditPostForm({ post, onPostUpdated, onCancel }: EditPostFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState(post.content)
  const [tags, setTags] = useState(post.tags?.join(', ') || '')
  const [contentWarning, setContentWarning] = useState(post.content_warning || '')
  const [hasContentWarning, setHasContentWarning] = useState(!!post.content_warning)
  const [mediaUrl, setMediaUrl] = useState(post.media_url || '')
  const [mediaType, setMediaType] = useState(post.media_type || '')
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

      setMediaUrl(data.publicUrl)
      setMediaType(file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 'document')
      setShowMediaUpload(false)
    } catch (err) {
      console.error('File upload error:', err)
      setError('Failed to upload file. Please try again.')
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) return

    setUploading(true)
    setError('')

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      
      await updatePost(post.id, {
        content: content.trim(),
        tags: tagsArray,
        content_warning: hasContentWarning ? contentWarning.trim() : undefined,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined
      }, user.id)

      onPostUpdated?.()
    } catch (err) {
      console.error('Error updating post:', err)
      setError('Failed to update post. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = () => {
    setMediaUrl('')
    setMediaType('')
  }

  return (
    <div className="bg-lofi-card rounded-xl p-6 rainbow-border-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-space-whale-subheading text-space-whale-navy">
          Edit Post
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Warning Toggle */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setHasContentWarning(!hasContentWarning)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              hasContentWarning 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Content Warning</span>
          </button>
        </div>

        {/* Content Warning Input */}
        {hasContentWarning && (
          <div>
            <label className="block text-sm font-medium text-space-whale-navy mb-2">
              Content Warning
            </label>
            <input
              type="text"
              value={contentWarning}
              onChange={(e) => setContentWarning(e.target.value)}
              placeholder="e.g., mentions of trauma, self-harm, etc."
              className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
            />
          </div>
        )}

        {/* Post Content */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2">
            What's forming and reforming in you?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, art, or creative process..."
            className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent min-h-[120px] resize-none"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., art therapy, nature, healing, poetry"
            className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
          />
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-space-whale-navy mb-2">
            Media (optional)
          </label>
          
          {mediaUrl ? (
            <div className="space-y-3">
              {mediaType === 'image' ? (
                <img
                  src={mediaUrl}
                  alt="Uploaded media"
                  className="max-w-full h-32 object-cover rounded-lg"
                />
              ) : mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  controls
                  className="max-w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">Media file attached</p>
                </div>
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove media
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMediaUpload(!showMediaUpload)}
                  className="flex items-center space-x-2 px-3 py-2 bg-space-whale-lavender/20 text-space-whale-purple rounded-lg hover:bg-space-whale-lavender/30 transition-colors"
                >
                  <Image className="h-4 w-4" />
                  <span className="text-sm">Add Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMediaUpload(!showMediaUpload)}
                  className="flex items-center space-x-2 px-3 py-2 bg-space-whale-lavender/20 text-space-whale-purple rounded-lg hover:bg-space-whale-lavender/30 transition-colors"
                >
                  <Video className="h-4 w-4" />
                  <span className="text-sm">Add Video</span>
                </button>
              </div>

              {showMediaUpload && (
                <div className="border-2 border-dashed border-space-whale-lavender/30 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    className="w-full"
                    disabled={uploadingMedia}
                  />
                  {uploadingMedia && (
                    <div className="flex items-center justify-center mt-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-space-whale-purple hover:text-space-whale-navy transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !content.trim()}
            className="btn-lofi flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update Post</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
