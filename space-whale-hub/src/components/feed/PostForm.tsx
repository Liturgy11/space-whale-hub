'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createPost } from '@/lib/database'
import { Image, Video, Smile, Send, X, AlertTriangle } from 'lucide-react'

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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setUploading(true)
    setError('')

    try {
      await createPost({
        content: content.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        content_warning: hasContentWarning ? contentWarning : null
      })

      setContent('')
      setTags('')
      setContentWarning('')
      setHasContentWarning(false)
      
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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Share with the Community</h2>
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
            placeholder="What's on your mind? Share your thoughts, art, or creative process with the community..."
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
            placeholder="Add tags (separated by commas): creativity, healing, art, etc."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
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
              This post contains content that may need a warning
            </span>
          </label>
          
          {hasContentWarning && (
            <input
              type="text"
              value={contentWarning}
              onChange={(e) => setContentWarning(e.target.value)}
              placeholder="Describe the content warning (e.g., trauma, body image, etc.)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          )}
        </div>

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
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Image className="h-4 w-4 mr-1" />
              Image
            </button>
            <button
              type="button"
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <Video className="h-4 w-4 mr-1" />
              Video
            </button>
            <button
              type="button"
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
    </div>
  )
}
