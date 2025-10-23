'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updateComment, deleteComment } from '@/lib/database'
import { MessageCircle, Loader2, Edit, Trash2, Save, X } from 'lucide-react'

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    display_name: string
    pronouns?: string
    avatar_url?: string
  }
}

interface CommentsListProps {
  postId: string
  refreshTrigger?: number
}

export default function CommentsList({ postId, refreshTrigger }: CommentsListProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadComments()
  }, [postId, refreshTrigger])

  const loadComments = async () => {
    try {
      setLoading(true)
      
      // Use the secure API route instead of direct database function
      const response = await fetch('/api/get-comments-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load comments')
      }

      setComments(result.comments)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return

    try {
      setSaving(true)
      await updateComment(editingId, editContent.trim())
      setEditingId(null)
      setEditContent('')
      loadComments() // Refresh comments
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return
    }

    try {
      await deleteComment(commentId)
      loadComments() // Refresh comments
    } catch (err: any) {
      setError(err.message)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-space-whale-purple" />
        <span className="ml-2 text-space-whale-navy font-space-whale-body">Loading comments...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageCircle className="h-8 w-8 text-space-whale-lavender mx-auto mb-2" />
        <p className="text-space-whale-purple font-space-whale-body">No comments yet</p>
        <p className="text-sm text-space-whale-purple/70 font-space-whale-body">Be the first to share your thoughts</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isCurrentUser = user && comment.user_id === user.id
        const isEditing = editingId === comment.id
        
        return (
          <div key={comment.id} className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-space-whale-purple to-accent-pink flex items-center justify-center">
                {comment.profiles.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt={comment.profiles.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {comment.profiles.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="bg-space-whale-lavender/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-space-whale-navy text-sm font-space-whale-subheading">
                      {comment.profiles.display_name}
                    </span>
                    {comment.profiles.pronouns && (
                      <span className="text-xs text-space-whale-purple font-space-whale-body">
                        {comment.profiles.pronouns}
                      </span>
                    )}
                    <span className="text-xs text-space-whale-purple font-space-whale-body">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  
                  {/* Edit/Delete buttons - only show for current user */}
                  {isCurrentUser && !isEditing && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(comment)}
                        className="p-1 text-space-whale-purple hover:text-space-whale-navy transition-colors"
                        title="Edit comment"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 text-space-whale-purple hover:text-red-500 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors resize-none font-space-whale-body"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-space-whale-purple">
                        {editContent.length}/1000 characters
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 text-xs text-space-whale-purple hover:text-space-whale-navy transition-colors font-space-whale-accent"
                        >
                          <X className="h-3 w-3 mr-1 inline" />
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={saving || !editContent.trim()}
                          className="flex items-center px-3 py-1 text-xs bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-space-whale-accent"
                        >
                          {saving ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Save className="h-3 w-3 mr-1" />
                          )}
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-space-whale-navy text-sm font-space-whale-body whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
