'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ExternalLink, Calendar, User, Tag, Heart, Share2, Trash2, MessageCircle, Edit3, Save, XCircle, Loader2, Send, MoreHorizontal } from 'lucide-react'
import LinkPreview from './LinkPreview'
import { useAuth } from '@/contexts/AuthContext'
import { getSignedUrl } from '@/lib/signed-urls'

interface ArchiveItem {
  id: string
  title: string
  description?: string
  content_type: 'video' | 'artwork' | 'zine' | 'audio'
  media_url?: string
  artist_name?: string
  tags?: string[]
  user_id?: string
  created_at: string
}

interface ArchiveItemModalProps {
  item: ArchiveItem | null
  isOpen: boolean
  onClose: () => void
  onDelete?: (id: string) => void
  onUpdate?: (updatedItem: ArchiveItem) => void
  items?: ArchiveItem[]
  startIndex?: number
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

export default function ArchiveItemModal({ item, isOpen, onClose, onDelete, onUpdate, items, startIndex = 0 }: ArchiveItemModalProps) {
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [signedMediaUrl, setSignedMediaUrl] = useState<string>('')
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    artist_name: '',
    tags: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  
  // Close menu when clicking outside (but allow clicks inside menu)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showMenu) return
      const target = event.target as Node
      if (menuRef.current && menuRef.current.contains(target)) {
        return // click inside the menu → do nothing
      }
      setShowMenu(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const currentItem: ArchiveItem | null = items && items.length > 0 ? items[currentIndex] : item
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Generate signed URL when item changes
  useEffect(() => {
    if (currentItem?.media_url && currentItem.media_url.includes('supabase')) {
      getSignedUrl(currentItem.media_url).then(setSignedMediaUrl)
    } else if (currentItem?.media_url) {
      setSignedMediaUrl(currentItem.media_url)
    }
  }, [currentItem?.media_url])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (!items || items.length === 0) return
      if (e.key === 'ArrowRight') setCurrentIndex((i) => (i + 1) % items.length)
      if (e.key === 'ArrowLeft') setCurrentIndex((i) => (i - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, items])

  // Mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!items || items.length === 0) return
    touchEndX.current = e.changedTouches[0].clientX
    if (touchStartX.current === null || touchEndX.current === null) return
    const delta = touchEndX.current - touchStartX.current
    const threshold = 40 // minimal px to count as swipe
    if (delta > threshold) {
      setCurrentIndex((i) => (i - 1 + items.length) % items.length)
    } else if (delta < -threshold) {
      setCurrentIndex((i) => (i + 1) % items.length)
    }
    touchStartX.current = null
    touchEndX.current = null
  }
  
  if (!currentItem || !isOpen) return null

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
          body: JSON.stringify({ id: currentItem.id })
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to delete item')
        }

        onDelete(currentItem.id)
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
    if (!user) {
      alert('Please log in to like items')
      return
    }
    
    setIsLiking(true)
    try {
      const response = await fetch('/api/toggle-archive-like-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          itemId: currentItem.id,
          userId: user.id
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
      const response = await fetch(`/api/get-archive-comments-secure?itemId=${currentItem.id}`)
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
    
    if (!user) {
      alert('Please log in to comment')
      return
    }

    setIsSubmittingComment(true)
    try {
      const response = await fetch('/api/create-archive-comment-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: currentItem.id,
          content: newComment.trim(),
          userId: user.id
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
      title: currentItem.title || '',
      description: currentItem.description || '',
      artist_name: currentItem.artist_name || '',
      tags: currentItem.tags ? currentItem.tags.join(', ') : ''
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
          id: currentItem.id,
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
        ...currentItem,
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

  const isExternalLink = currentItem.media_url?.startsWith('http') && !currentItem.media_url.includes('supabase')
  const isOwner = user && currentItem.user_id && user.id === currentItem.user_id
  
  // Debug logging
  console.log('ArchiveItemModal Debug:', {
    user: user?.id,
    itemUserId: currentItem.user_id,
    isOwner,
    hasOnUpdate: !!onUpdate,
    hasOnDelete: !!onDelete
  })

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-20"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto rainbow-border-soft relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - positioned absolutely outside scrollable area */}
        <button
          type="button"
          aria-label="Close"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-4 right-4 z-50 text-space-whale-purple hover:text-space-whale-navy hover:bg-white/80 transition-colors p-2 rounded-lg"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6 pb-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getContentTypeIcon(currentItem.content_type)}</span>
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
                      {currentItem.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-space-whale-navy/70 font-space-whale-body">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(item.created_at)}
                      </span>
                      {currentItem.artist_name && (
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {currentItem.artist_name}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Owner Actions Menu */}
            {isOwner && onUpdate && (
              <div className="relative mr-2" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-space-whale-navy/70 hover:text-space-whale-purple transition-colors rounded-lg hover:bg-space-whale-lavender/10"
                  title="More actions"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-space-whale-lavender/20 py-2 z-10">
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        handleEdit()
                      }}
                      className="w-full px-4 py-2 text-left text-space-whale-navy hover:bg-space-whale-lavender/10 flex items-center space-x-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    {onDelete && (
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          handleDelete()
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            
          </div>

          {/* Media Content - Much Larger */}
          <div className="mb-8">
            {currentItem.media_url ? (
              isExternalLink ? (
                <LinkPreview 
                  url={currentItem.media_url}
                  title={currentItem.title}
                  description={currentItem.description}
                  className="rounded-xl"
                />
              ) : (
                <div className="rounded-xl overflow-hidden shadow-lg">
                  {currentItem.content_type === 'video' ? (
                    <video 
                      src={signedMediaUrl || currentItem.media_url} 
                      className="w-full max-h-[70vh] sm:max-h-[75vh] object-contain"
                      controls
                    />
                  ) : (
                    <img 
                      src={signedMediaUrl || currentItem.media_url} 
                      alt={currentItem.title}
                      className="w-full max-h-[70vh] sm:max-h-[75vh] object-contain"
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
          ) : currentItem.description ? (
            <div className="mb-4">
              <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-2">
                About this creation
              </h3>
              <p className="text-space-whale-navy/80 font-space-whale-body leading-relaxed">
                {currentItem.description}
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
          ) : currentItem.tags && currentItem.tags.length > 0 ? (
            <div className="mb-4">
              <h3 className="text-lg font-space-whale-heading text-space-whale-navy mb-2">
                <Tag className="h-5 w-5 inline mr-1 text-space-whale-purple" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentItem.tags.map((tag, index) => (
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
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={`p-3 transition-colors disabled:opacity-50 rounded-lg hover:bg-space-whale-lavender/10 ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-space-whale-navy/70 hover:text-red-500'
                }`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={() => {
                  setShowComments(!showComments)
                  if (!showComments) loadComments()
                }}
                className="p-3 text-space-whale-navy/70 hover:text-space-whale-purple transition-colors rounded-lg hover:bg-space-whale-lavender/10"
                title={`Comments (${comments.length})`}
              >
                <MessageCircle className="h-5 w-5" />
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
                className="p-3 text-space-whale-navy/70 hover:text-space-whale-purple transition-colors rounded-lg hover:bg-space-whale-lavender/10"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            
            {/* Edit Actions - Only show when editing */}
            {isEditing && onUpdate && (
              <div className="flex items-center space-x-3 mt-4">
                <button 
                  onClick={handleEditSave}
                  disabled={isSaving || !editForm.title.trim()}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-space-whale-accent"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={handleEditCancel}
                  className="flex items-center px-4 py-2 text-space-whale-navy/70 hover:text-red-600 transition-colors rounded-lg hover:bg-space-whale-lavender/10 font-space-whale-body"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
            
            {isExternalLink && (
              <a
                href={currentItem.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-all duration-300"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original
              </a>
            )}
          </div>

          {/* Carousel controls when multiple items */}
          {items && items.length > 1 && (
            <div className="absolute inset-0 pointer-events-none">
              <button
                aria-label="Previous"
                onClick={() => setCurrentIndex((i) => (i - 1 + items.length) % items.length)}
                className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-space-whale-navy rounded-full p-3 sm:p-2 shadow"
              >
                ‹
              </button>
              <button
                aria-label="Next"
                onClick={() => setCurrentIndex((i) => (i + 1) % items.length)}
                className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-space-whale-navy rounded-full p-3 sm:p-2 shadow"
              >
                ›
              </button>
              <div className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-space-whale-navy/70 font-space-whale-body">
                {currentIndex + 1} / {items.length}
              </div>
            </div>
          )}

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
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-space-whale-purple to-accent-pink flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {comment.display_name ? comment.display_name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="bg-space-whale-lavender/10 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-space-whale-navy text-sm font-space-whale-subheading">
                                {comment.display_name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-space-whale-purple font-space-whale-body">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-space-whale-navy text-sm font-space-whale-body whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-space-whale-navy/60 text-center py-6 font-space-whale-body bg-white/5 rounded-xl border border-space-whale-lavender/10">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>

              {/* Comment Form */}
              <form onSubmit={handleSubmitComment} className="space-y-4" suppressHydrationWarning>
                <div>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors resize-none font-space-whale-body"
                    maxLength={1000}
                    disabled={isSubmittingComment}
                    suppressHydrationWarning
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-space-whale-purple font-space-whale-body">
                      {newComment.length}/1000 characters
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-space-whale-accent"
                  >
                    {isSubmittingComment ? (
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
