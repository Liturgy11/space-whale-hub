'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/components/ui/Toast'
import { X, Sparkles, Save } from 'lucide-react'

const OFFERINGS = [
  'Listening / peer support',
  'Creative facilitation',
  'Art / music',
  'Meditation',
  'Movement / dance',
  'Tech help',
  'Admin support',
  'Nature connection',
  'Cooking',
  'Writing / storytelling',
  'Photography',
]

const CURIOSITIES = [
  'Meditation',
  'Dance',
  'Gardening',
  'Creative practice',
  'Parenting conversations',
  'Nervous system regulation',
  'Activism / community organising',
  'Storytelling',
  'Nature connection',
  'Music',
  'Writing',
  'Movement',
  'Photography',
  'Art making',
]

const CONNECTION_FORMATS = [
  '1:1 conversation',
  'Small group',
  'Workshop',
  'Online',
  'In-person',
  'Open to collaboration',
]

interface SporeFormProps {
  existingSpore?: any
  onSaved?: () => void
  onCancel?: () => void
}

function TagSelector({
  label,
  hint,
  options,
  selected,
  onChange,
}: {
  label: string
  hint: string
  options: string[]
  selected: string[]
  onChange: (tags: string[]) => void
}) {
  const [custom, setCustom] = useState('')

  const toggle = (tag: string) => {
    onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag])
  }

  const addCustom = () => {
    const trimmed = custom.trim()
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed])
    }
    setCustom('')
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-space-whale-navy font-space-whale-body">{label}</label>
        <p className="text-xs text-space-whale-purple/70 font-space-whale-body mt-0.5">{hint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              selected.includes(opt)
                ? 'bg-space-whale-purple text-white shadow-sm'
                : 'bg-space-whale-lavender/30 text-space-whale-navy hover:bg-space-whale-lavender/60'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {/* Custom tag input */}
      <div className="flex gap-2 mt-1">
        <input
          type="text"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          placeholder="Add your own..."
          className="flex-1 px-3 py-1.5 text-xs border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="px-3 py-1.5 text-xs bg-space-whale-lavender/40 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/70 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>
      {/* Show custom tags that aren't in the preset list */}
      {selected.filter(t => !options.includes(t)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.filter(t => !options.includes(t)).map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-accent-pink/30 text-space-whale-navy">
              {tag}
              <button type="button" onClick={() => onChange(selected.filter(t2 => t2 !== tag))} className="hover:text-red-500 transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SporeForm({ existingSpore, onSaved, onCancel }: SporeFormProps) {
  const { user } = useAuth()
  const [bio, setBio] = useState(existingSpore?.bio || '')
  const [location, setLocation] = useState(existingSpore?.location || '')
  const [offerings, setOfferings] = useState<string[]>(existingSpore?.offerings || [])
  const [curiosities, setCuriosities] = useState<string[]>(existingSpore?.curiosities || [])
  const [connectionFormats, setConnectionFormats] = useState<string[]>(existingSpore?.connection_formats || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/upsert-spore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          display_name: user.user_metadata?.display_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          bio,
          location,
          offerings,
          curiosities,
          connection_formats: connectionFormats,
        })
      })

      if (!res.ok) {
        const result = await res.json().catch(() => ({}))
        throw new Error(result.error || `Server error ${res.status}`)
      }

      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Failed to save')

      toast('Your spore has been placed in the forest ✨', 'success')
      onSaved?.()
    } catch (err: any) {
      setError(err.message)
      toast('Failed to save spore', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center pb-2">
        <div className="text-4xl mb-2">🍄</div>
        <h2 className="text-xl font-space-whale-heading text-space-whale-navy">
          {existingSpore ? 'Update your spore' : 'Place yourself in the forest'}
        </h2>
        <p className="text-sm text-space-whale-purple/80 font-space-whale-body mt-1 max-w-md mx-auto">
          There is no pressure to appear before you are ready. When you feel it — share a little of who you are and what you carry.
        </p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-space-whale-navy font-space-whale-body mb-1">
          A little about you <span className="font-normal text-space-whale-purple/60">(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="A sentence or two about who you are..."
          rows={2}
          maxLength={200}
          className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body text-sm resize-none"
        />
        <p className="text-xs text-space-whale-purple/50 text-right mt-1">{bio.length}/200</p>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-space-whale-navy font-space-whale-body mb-1">
          Where are you based? <span className="font-normal text-space-whale-purple/60">(optional)</span>
        </label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Sydney, Melbourne, Regional NSW..."
          className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body text-sm"
        />
      </div>

      {/* Offerings */}
      <TagSelector
        label="What do you enjoy offering?"
        hint="Skills, practices, or ways of being you like to share"
        options={OFFERINGS}
        selected={offerings}
        onChange={setOfferings}
      />

      {/* Curiosities */}
      <TagSelector
        label="What are you curious to explore?"
        hint="Things you're drawn to, learning, or wanting to experience more of"
        options={CURIOSITIES}
        selected={curiosities}
        onChange={setCuriosities}
      />

      {/* Connection formats */}
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-space-whale-navy font-space-whale-body">How do you like to connect?</label>
          <p className="text-xs text-space-whale-purple/70 font-space-whale-body mt-0.5">Select all that feel right</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CONNECTION_FORMATS.map(fmt => (
            <button
              key={fmt}
              type="button"
              onClick={() => setConnectionFormats(
                connectionFormats.includes(fmt)
                  ? connectionFormats.filter(f => f !== fmt)
                  : [...connectionFormats, fmt]
              )}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                connectionFormats.includes(fmt)
                  ? 'bg-accent-pink text-white shadow-sm'
                  : 'bg-space-whale-lavender/30 text-space-whale-navy hover:bg-space-whale-lavender/60'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-space-whale-lavender/40 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/10 transition-colors font-space-whale-accent text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 transition-all font-space-whale-accent text-sm shadow-lg"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {existingSpore ? 'Update spore' : 'Place in the forest'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
