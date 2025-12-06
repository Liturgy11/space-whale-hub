'use client'

import { useState, useEffect } from 'react'
import { getPosts, deletePost } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/Toast'
import PostCard from './PostCard'
import EditPostForm from './EditPostForm'

interface Post {
  id: string
  content: string
  tags: string[]
  content_warning?: string
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

interface FeedListProps {
  refreshTrigger?: number
}

export default function FeedList({ refreshTrigger }: FeedListProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger) {
      loadPosts()
    }
  }, [refreshTrigger])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError('') // Clear any previous errors
      // Try secure API first (service role), fallback to client getPosts
      try {
        const res = await fetch('/api/get-posts-secure')
        if (res.ok) {
          const json = await res.json()
          if (json.success) {
            setPosts(json.data)
            return
          }
        }
      } catch (_) {}

      const postsData = await getPosts()
      setPosts(postsData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) return
    
    try {
      // Use the secure API route instead of direct database function
      const response = await fetch('/api/toggle-like-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          postId: postId
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle like')
      }
      
      // Update the post in the local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: result.liked,
              likes_count: result.liked ? post.likes_count + 1 : post.likes_count - 1
            }
          : post
      ))
    } catch (err: unknown) {
      console.error('Error toggling like:', err)
      setError('Failed to update like. Please try again.')
    }
  }

  const handleComment = (postId: string) => {
    // Comment functionality is handled in PostCard component
  }

  const handleEdit = (postId: string) => {
    const post = posts.find(p => p.id === postId)
    if (post) {
      setEditingPost(post)
    }
  }

  const handleEditCancel = () => {
    setEditingPost(null)
  }

  const handleEditSuccess = () => {
    setEditingPost(null)
    loadPosts() // Refresh the posts to show updated content
  }

  const handleDelete = async (postId: string) => {
    if (!user) return
    
    // Show confirmation state
    if (deletingPostId !== postId) {
      setDeletingPostId(postId)
      return
    }
    
    try {
      await deletePost(postId, user.id)
      // Remove the post from local state
      setPosts(posts.filter(post => post.id !== postId))
      setDeletingPostId(null)
      toast('Post deleted successfully', 'success')
    } catch (err) {
      console.error('Error deleting post:', err)
      setError('Failed to delete post. Please try again.')
      setDeletingPostId(null)
      toast('Failed to delete post. Please try again.', 'error')
    }
  }

  const cancelDelete = () => {
    setDeletingPostId(null)
  }

  const handleBookmark = (postId: string) => {
    // TODO: Implement bookmark functionality
    toast('Post saved for later! (Bookmark functionality coming soon)', 'info')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Unable to load posts
        </h3>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadPosts}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Retry loading posts"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-lofi-card rounded-xl shadow-lg p-8 sm:p-12 text-center rainbow-border-soft">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-space-whale-lavender/30 to-accent-pink/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
          <span className="text-4xl sm:text-5xl">🐋</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-space-whale-heading text-space-whale-navy mb-3">
          No posts yet
        </h3>
        <p className="text-base sm:text-lg text-space-whale-navy/80 font-space-whale-body mb-4 max-w-md mx-auto">
          Be the first to share something with the community!
        </p>
        <p className="text-sm text-space-whale-purple/70 font-space-whale-body">
          Share your thoughts, art, or creative process to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id}>
          {editingPost && editingPost.id === post.id ? (
            <EditPostForm
              post={post}
              onPostUpdated={handleEditSuccess}
              onCancel={handleEditCancel}
            />
          ) : (
            <PostCard
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBookmark={handleBookmark}
              isDeleting={deletingPostId === post.id}
              onCancelDelete={cancelDelete}
            />
          )}
        </div>
      ))}
    </div>
  )
}
