'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getJournalEntries, deleteJournalEntry } from '@/lib/database'
import { Calendar, Heart, Edit, Trash2, Lock, Eye } from 'lucide-react'

interface JournalListProps {
  refreshTrigger?: number
}

export default function JournalList({ refreshTrigger }: JournalListProps) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user, refreshTrigger])

  const loadEntries = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await getJournalEntries(user.id)
      setEntries(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(entryId)
      await deleteJournalEntry(entryId)
      setEntries(entries.filter(entry => entry.id !== entryId))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      'joyful': '😊',
      'calm': '😌',
      'anxious': '😰',
      'sad': '😢',
      'angry': '😠',
      'grateful': '🙏',
      'excited': '🤩',
      'peaceful': '🧘',
      'overwhelmed': '😵',
      'hopeful': '✨',
    }
    return moodMap[mood] || '😊'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading your entries...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadEntries}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No entries yet</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Start your journey by creating your first journal entry
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Your journal is a safe space for reflection and growth</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {entry.title || 'Untitled Entry'}
                </h3>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Private</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(entry.created_at)}
                </div>
                {entry.mood && (
                  <div className="flex items-center">
                    <span className="mr-1">{getMoodEmoji(entry.mood)}</span>
                    <span className="capitalize">{entry.mood}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              >
                {deletingId === entry.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-4">
              {entry.content}
            </p>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors">
              <Eye className="h-4 w-4 mr-1" />
              Read full entry
            </button>
            
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entry.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {entry.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                    +{entry.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
