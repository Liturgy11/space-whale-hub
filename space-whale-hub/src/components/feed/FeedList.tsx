'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { toast } from '@/components/ui/Toast'

const PostCard = dynamic(() => import('./PostCard'), {
  loading: () => (
    <div className="bg-lofi-card rounded-xl p-6 animate-pulse h-40 rainbow-border-soft" />
  ),
})

const EditPostForm = dynamic(() => import('./EditPostForm'))

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

interface FeedListProps {
  userId?: string | null
  authLoading?: boolean
  refreshTrigger?: number
}

const CACHE_KEY = 'swp_feed_cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function readCache(): Post[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { posts, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return posts
  } catch {
    return null
  }
}

function writeCache(posts: Post[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ posts, ts: Date.now() }))
  } catch {
    // sessionStorage unavailable — silently skip
  }
}

export default function FeedList({
  userId,
  authLoading = false,
  refreshTrigger = 0,
}: FeedListProps) {
  const [posts, setPosts] = useState<Post[]>(() => readCache() ?? [])
  const [loading, setLoading] = useState(() => !readCache())
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const fetchGeneration = useRef(0)

  const fetchPosts = useCallback(
    async (activeUserId: string | null, { silent = false, force = false } = {}) => {
      const generation = ++fetchGeneration.current

      try {
        if (silent) setRefreshing(true)
        else if (!posts.length || force) setLoading(true)
        setError('')

        const url = activeUserId
          ? `/api/get-posts-secure?userId=${encodeURIComponent(activeUserId)}`
          : '/api/get-posts-secure'

        const res = await fetch(url, { cache: force ? 'no-store' : 'default' })
        if (!res.ok) throw new Error('Failed to fetch posts')
        const json = await res.json()
        if (!json.success) throw new Error(json.error || 'Failed to fetch posts')

        if (generation !== fetchGeneration.current) return

        setPosts(json.data)
        writeCache(json.data)
      } catch (err: unknown) {
        if (generation !== fetchGeneration.current) return
        if (!silent && !posts.length) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (generation === fetchGeneration.current) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [posts.length]
  )

  // One authoritative fetch once auth is ready
  useEffect(() => {
    if (authLoading) return
    fetchPosts(userId ?? null, { silent: posts.length > 0 })
  }, [authLoading, userId, fetchPosts]) // eslint-disable-line react-hooks/exhaustive-deps

  // Force refresh after new post
  useEffect(() => {
    if (!refreshTrigger || authLoading) return
    sessionStorage.removeItem(CACHE_KEY)
    fetchPosts(userId ?? null, { force: true })
  }, [refreshTrigger, authLoading, userId, fetchPosts])

  const handleLike = async (postId: string) => {
    if (!userId) return

    try {
      const response = await fetch('/api/toggle-like-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, postId }),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to toggle like')

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: result.liked,
                likes_count: result.liked
                  ? post.likes_count + 1
                  : post.likes_count - 1,
              }
            : post
        )
      )
    } catch (err: unknown) {
      console.error('Error toggling like:', err)
      setError('Failed to update like. Please try again.')
    }
  }

  const handleEdit = (postId: string) => {
    const post = posts.find((p) => p.id === postId)
    if (post) setEditingPost(post)
  }

  const handleEditSuccess = () => {
    setEditingPost(null)
    sessionStorage.removeItem(CACHE_KEY)
    fetchPosts(userId ?? null, { force: true })
  }

  const handleDelete = async (postId: string) => {
    if (!userId) return

    if (deletingPostId !== postId) {
      setDeletingPostId(postId)
      return
    }

    try {
      const response = await fetch('/api/delete-post-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId }),
      })

      const result = await response.json()
      if (!result.success) throw new Error(result.error || 'Failed to delete post')

      setPosts((current) => {
        const next = current.filter((post) => post.id !== postId)
        writeCache(next)
        return next
      })
      setDeletingPostId(null)
      toast('Post deleted successfully', 'success')
    } catch (err: unknown) {
      console.error('Error deleting post:', err)
      const message =
        err instanceof Error ? err.message : 'Failed to delete post. Please try again.'
      setError(message)
      setDeletingPostId(null)
      toast(message, 'error')
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-lofi-card rounded-xl p-6 animate-pulse rainbow-border-soft"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-space-whale-lavender/25 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-space-whale-lavender/25 rounded" />
                <div className="h-3 w-16 bg-space-whale-lavender/15 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-space-whale-lavender/15 rounded" />
              <div className="h-4 w-3/4 bg-space-whale-lavender/15 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load posts</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchPosts(userId ?? null, { force: true })}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {refreshing && (
        <p className="text-xs text-space-whale-purple/50 font-space-whale-body text-center">
          Updating orbit…
        </p>
      )}
      {posts.map((post) => (
        <div key={post.id}>
          {editingPost?.id === post.id ? (
            <EditPostForm
              post={post}
              onPostUpdated={handleEditSuccess}
              onCancel={() => setEditingPost(null)}
            />
          ) : (
            <PostCard
              post={post}
              onLike={handleLike}
              onComment={() => {}}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBookmark={() =>
                toast('Post saved for later! (Bookmark functionality coming soon)', 'info')
              }
              isDeleting={deletingPostId === post.id}
              onCancelDelete={() => setDeletingPostId(null)}
            />
          )}
        </div>
      ))}
    </div>
  )
}
