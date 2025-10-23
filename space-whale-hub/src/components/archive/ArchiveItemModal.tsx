'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Calendar, User, Tag, Heart, Share2, Trash2, MessageCircle, Edit3, Save, XCircle } from 'lucide-react'
import LinkPreview from './LinkPreview'

interface ArchiveItem {
  id: string
  title: string
  description?: string
  content_type: 'video' | 'artwork' | 'zine' | 'audio'
  media_url?: string
  artist_name?: string
  tags?: string[]
  created_at: string
}

interface ArchiveItemModalProps {
  item: ArchiveItem | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (id: string) => void
  onUpdate?: (updatedItem: ArchiveItem) => void
}

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    display_name: string
    avatar_url?: string
  }
}

export default function ArchiveItemModal({ item, isOpen, onClose, onDelete, onUpdate }: ArchiveItemModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    artist_name: '',
    tags: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  
  if (!item || !isOpen) return null

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      setIsDeleting(true)
      try {
        const response = await fetch('/api/delete-constellation-item-secure', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: item.id })
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to delete item')
        }

        onDelete(item.id)
        onClose()
      } catch (error) {
        console.error('Error deleting item:', error)
        alert('Failed to delete item. Please try again.')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleLike = async () => {
    setIsLiking(true)
    try {
      // For now, we'll use a placeholder user ID
      // In a real app, you'd get this from authentication
      const userId = 'placeholder-user-id'
      
      const response = await fetch('/api/toggle-archive-like-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          itemId: item.id,
          userId: userId
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle like')
      }

      setIsLiked(result.liked)
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('Failed to toggle like. Please try again.')
    } finally {
      setIsLiking(false)
    }
  }

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/get-archive-comments-secure?itemId=${item.id}`)
      const result = await response.json()
      
      if (result.success) {
        setComments(result.data || [])
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      // For now, we'll use a placeholder user ID
      // In a real app, you'd get this from authentication
      const userId = 'placeholder-user-id'
      
      const response = await fetch('/api/create-archive-comment-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          content: newComment.trim(),
          userId: userId
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create comment')
      }

      setNewComment('')
      loadComments() // Refresh comments
    } catch (error) {
      console.error('Error creating comment:', error)
      alert('Failed to create comment. Please try again.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleEdit = () => {
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      artist_name: item.artist_name || '',
      tags: item.tags ? item.tags.join(', ') : ''
    })
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditForm({
      title: '',
      description: '',
      artist_name: '',
      tags: ''
    })
  }

  const handleEditSave = async () => {
    if (!onUpdate) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/update-archive-item-secure', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          artist_name: editForm.artist_name.trim(),
          tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update item')
      }

      // Update the local item with the new data
      const updatedItem = {
        ...item,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        artist_name: editForm.artist_name.trim(),
        tags: editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      onUpdate(updatedItem)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Failed to update item. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥'
      case 'artwork': return '🎨'
      case 'zine': return '📖'
      case 'audio': return '🎵'
      default: return '📄'
    }
  }

  const isExternalLink = item.media_url?.startsWith('http') && !item.media_url.includes('supabase')

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto rainbow-border-soft">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getContentTypeIcon(item.content_type)}</span>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Item title..."
                      className="w-full text-2xl font-space-whale-heading text-space-whale-navy bg-transparent border-b border-space-whale-lavender/30 focus:border-space-whale-purple focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.artist_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, artist_name: e.target.value }))}
                      placeholder="Artist name..."
                      className="w-full text-sm text-space-whale-navy/70 font-space-whale-body bg-transparent border-b border-space-whale-lavender/30 focus:border-space-whale-purple focus:outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-space-whale-heading text-space-whale-navy">
                      {item.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-space-whale-navy/70 font-space-whale-body">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.created_at)}
                      </span>
                      {item.artist_name && (
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {item.artist_name}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-space-whale-purple hover:text-space-whale-navy transition-colors p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Media Content - Much Larger */}
          <div className="mb-8">
            {item.media_url ? (
              isExternalLink ? (
                <LinkPreview 
                  url={item.media_url}
                  title={item.title}
                  description={item.description}
                  className="rounded-xl"
                />
              ) : (
                <div className="rounded-xl overflow-hidden shadow-lg">
                  {item.content_type === 'video' ? (
                    <video 
                      src={item.media_url} 
                      className="w-full max-h-[60vh] object-contain"
                      controls
                    />
                  ) : (
                    <img 
                      src={item.media_url} 
                      alt={item.title}
                      className="w-full max-h-[60vh] object-contain"
                    />
                  )}
                </div>
              )
            ) : (
              <div className="aspect-video bg-gradient-to-br from-space-whale-lavender/30 to-space-whale-purple/30 flex items-center justify-center rounded-xl shadow-lg">
                <span className="text-6xl">🐋</span>
              </div>
            )}
          </div>

          {/* Description */}
          {isEditing ? (
            <div className="mb-4">
              <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-2">
                About this creation
              </h3>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this creation..."
                className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent resize-none font-space-whale-body text-space-whale-navy"
                rows={3}
              />
            </div>
          ) : item.description ? (
            <div className="mb-4">
              <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-2">
                About this creation
              </h3>
              <p className="text-space-whale-navy/80 font-space-whale-body leading-relaxed">
                {item.description}
              </p>
            </div>
          ) : null}

          {/* Tags */}
          {isEditing ? (
            <div className="mb-4">
              <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-2">
                <Tag className="h-5 w-5 inline mr-1 text-space-whale-purple" />
                Tags
              </h3>
              <input
                type="text"
                value={editForm.tags}
                onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Enter tags separated by commas..."
                className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent font-space-whale-body text-space-whale-navy"
              />
              <p className="text-xs text-space-whale-navy/60 mt-1 font-space-whale-body">
                Separate tags with commas (e.g., "art, nature, creative")
              </p>
            </div>
          ) : item.tags && item.tags.length > 0 ? (
            <div className="mb-4">
              <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-2">
                <Tag className="h-5 w-5 inline mr-1 text-space-whale-purple" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-space-whale-lavender/20 text-space-whale-purple text-sm rounded-full font-space-whale-body"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-space-whale-lavender/30">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center px-4 py-2 transition-colors disabled:opacity-50 font-space-whale-body ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-space-whale-navy/70 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiking ? 'Liking...' : (isLiked ? 'Liked' : 'Like')}
              </button>
              <button 
                onClick={() => {
                  setShowComments(!showComments)
                  if (!showComments) loadComments()
                }}
                className="flex items-center px-4 py-2 text-space-whale-navy/70 hover:text-space-whale-purple transition-colors font-space-whale-body"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Comments ({comments.length})
              </button>
              <button 
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: item.title,
                        text: item.description || `Check out this ${item.content_type} in the Space Whale Archive`,
                        url: window.location.href
                      })
                    } catch (error) {
                      console.log('Share cancelled or failed')
                    }
                  } else {
                    // Fallback: copy to clipboard
                    try {
                      await navigator.clipboard.writeText(`${item.title} - ${window.location.href}`)
                      alert('Link copied to clipboard!')
                    } catch (error) {
                      console.error('Failed to copy to clipboard')
                    }
                  }
                }}
                className="flex items-center px-4 py-2 text-space-whale-navy/70 hover:text-space-whale-purple transition-colors font-space-whale-body"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              {onUpdate && (
                <>
                  {isEditing ? (
                    <button 
                      onClick={handleEditSave}
                      disabled={isSaving || !editForm.title.trim()}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-space-whale-accent"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  ) : (
                    <button 
                      onClick={handleEdit}
                      className="flex items-center px-4 py-2 text-space-whale-navy/70 hover:text-space-whale-purple transition-colors font-space-whale-body"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  )}
                  {isEditing && (
                    <button 
                      onClick={handleEditCancel}
                      className="flex items-center px-4 py-2 text-space-whale-navy/70 hover:text-red-600 transition-colors font-space-whale-body"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  )}
                </>
              )}
              {onDelete && (
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center px-4 py-2 text-space-whale-navy/70 hover:text-red-600 transition-colors disabled:opacity-50 font-space-whale-body"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
            
            {isExternalLink && (
              <a
                href={item.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </a>
            )}
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-6 pt-6 border-t border-space-whale-lavender/30">
              <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-4">
                Comments ({comments.length})
              </h3>
              
              {/* Comments List */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-space-whale-purple to-accent-pink rounded-full flex items-center justify-center text-white text-sm font-space-whale-accent">
                          {comment.profiles.display_name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-space-whale-accent text-space-whale-navy">
                            {comment.profiles.display_name}
                          </p>
                          <span className="text-xs text-space-whale-navy/60 font-space-whale-body">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-space-whale-navy/80 font-space-whale-body mt-1">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-space-whale-navy/60 text-center py-4 font-space-whale-body">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>

              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent resize-none font-space-whale-body text-space-whale-navy"
                  rows={3}
                  disabled={isSubmittingComment}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-space-whale-accent"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
