'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createJournalEntry } from '@/lib/database'
import { Loader2, Save, X } from 'lucide-react'

interface JournalEntryFormProps {
  onSuccess?: (entry: any) => void
  onCancel?: () => void
}

export default function JournalEntryForm({ onSuccess, onCancel }: JournalEntryFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const moods = [
    { value: 'joyful', emoji: '😊', label: 'Joyful' },
    { value: 'calm', emoji: '😌', label: 'Calm' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'angry', emoji: '😠', label: 'Angry' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'peaceful', emoji: '🧘', label: 'Peaceful' },
    { value: 'overwhelmed', emoji: '😵', label: 'Overwhelmed' },
    { value: 'hopeful', emoji: '✨', label: 'Hopeful' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setLoading(true)

    try {
      const entry = await createJournalEntry(user.id, {
        title: title.trim() || undefined,
        content: content.trim(),
        mood: mood || undefined,
        is_private: true
      })

      // Reset form
      setTitle('')
      setContent('')
      setMood('')

      if (onSuccess) onSuccess(entry)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Journal Entry</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title (Optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            placeholder="Give your entry a title..."
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            How are you feeling today?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {moods.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(mood === m.value ? '' : m.value)}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  mood === m.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <span className="text-2xl mb-1">{m.emoji}</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Thoughts
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
            placeholder="Write freely... this space is just for you. Share your thoughts, feelings, experiences, or anything that's on your mind."
            maxLength={10000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔒 Private by default - only you can see this
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {content.length}/10,000 characters
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Entry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
