'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createComment } from '@/lib/database'
import { Send, Loader2 } from 'lucide-react'

interface CommentFormProps {
  postId: string
  onCommentAdded?: () => void
  onCancel?: () => void
}

export default function CommentForm({ postId, onCommentAdded, onCancel }: CommentFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) return

    setError('')
    setLoading(true)

    try {
      await createComment(user.id, postId, content.trim())
      setContent('')
      if (onCommentAdded) onCommentAdded()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-4 bg-space-whale-lavender/10 rounded-lg border border-space-whale-lavender/30">
        <p className="text-space-whale-navy text-center font-space-whale-body">
          Please sign in to comment
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors resize-none font-space-whale-body"
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-space-whale-purple font-space-whale-body">
            {content.length}/1000 characters
          </p>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-space-whale-purple hover:text-space-whale-navy transition-colors font-space-whale-accent"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-space-whale-accent"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Comment
            </>
          )}
        </button>
      </div>
    </form>
  )
}
