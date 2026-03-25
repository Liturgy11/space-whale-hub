'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import { encryptJournalContent, decryptJournalContent, isEncrypted, getEncryptionStatus } from '@/lib/journal-encryption'
import { toast } from '@/components/ui/Toast'
import { Calendar, Heart, Edit, Trash2, Lock, Eye, Share2, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface JournalListProps {
  refreshTrigger?: number
}

export default function JournalList({ refreshTrigger }: JournalListProps) {
  const { user } = useAuth()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sharingId, setSharingId] = useState<string | null>(null)
  const [shareModalEntry, setShareModalEntry] = useState<any | null>(null)
  const [shareDescription, setShareDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editMood, setEditMood] = useState('')
  const [editMediaUrl, setEditMediaUrl] = useState('')
  const [editMediaType, setEditMediaType] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editIsEncrypted, setEditIsEncrypted] = useState(false)
  
  // Full entry modal state
  const [fullEntryId, setFullEntryId] = useState<string | null>(null)

  // Simple image modal state (single image click - matches Community Orbit)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showImageUrl, setShowImageUrl] = useState('')

  // Lightbox state (mood board multi-image)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState('')
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  
  // Master passphrase state - stored in memory for the session
  const [masterPassphrase, setMasterPassphrase] = useState<string>('')
  const [showMasterPassphrasePrompt, setShowMasterPassphrasePrompt] = useState(false)
  const [masterPassphraseInput, setMasterPassphraseInput] = useState('')
  const [decryptingId, setDecryptingId] = useState<string | null>(null)
  const [decryptedContent, setDecryptedContent] = useState<Record<string, string>>({})

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (user) {
      loadEntries()
    }
  }, [user, refreshTrigger])

  const loadEntries = async () => {
    if (!user) {
      return
    }

    try {
      setLoading(true)
      
      // Use the secure API route instead of direct database function
      const response = await fetch('/api/get-journal-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load journal entries')
      }

      const data = result.entries
      
      data?.forEach((entry: any, index: number) => {
        if (entry.media_url) {
        }
      })
      
      setEntries(data || [])
    } catch (err: any) {
      console.error('Error loading entries:', err)
      console.error('Error details:', err.message, err.code, err.details)
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
      const res = await fetch('/api/delete-journal-entry-secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, userId: user?.id }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to delete entry')
      setEntries(entries.filter(entry => entry.id !== entryId))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  // Set master passphrase (called once per session)
  const handleSetMasterPassphrase = async (entryToDecrypt?: any) => {
    if (!masterPassphraseInput || masterPassphraseInput.length < 8) {
      toast('Passphrase must be at least 8 characters long', 'error')
      return
    }
    const passphrase = masterPassphraseInput
    setMasterPassphrase(passphrase)
    setMasterPassphraseInput('')
    setShowMasterPassphrasePrompt(false)
    toast('Master passphrase set for this session', 'success')
    
    // If there's an entry waiting to be decrypted, decrypt it now
    if (entryToDecrypt) {
      try {
        const decrypted = await decryptJournalContent(
          entryToDecrypt.content_encrypted,
          passphrase,
          entryToDecrypt.encryption_salt,
          entryToDecrypt.encryption_iv
        )
        setDecryptedContent(prev => ({ ...prev, [entryToDecrypt.id]: decrypted }))
        setDecryptingId(null)
        toast('Entry decrypted successfully', 'success')
      } catch (err: any) {
        console.error('Decryption error:', err)
        // If decryption fails, clear the passphrase and prompt again
        setMasterPassphrase('')
        setShowMasterPassphrasePrompt(true)
        toast('Incorrect passphrase. Please try again.', 'error')
      }
    }
  }

  // Clear master passphrase from memory
  const handleClearMasterPassphrase = () => {
    setMasterPassphrase('')
    setDecryptedContent({}) // Clear all decrypted content
    toast('Master passphrase cleared from memory', 'info')
  }

  const handleDecrypt = async (entry: any) => {
    if (!entry.content_encrypted || !entry.encryption_salt || !entry.encryption_iv) {
      toast('This entry is not encrypted or missing encryption data', 'error')
      return
    }

    // If no master passphrase set, prompt for it
    if (!masterPassphrase) {
      setDecryptingId(entry.id)
      setShowMasterPassphrasePrompt(true)
      return
    }

    try {
      const decrypted = await decryptJournalContent(
        entry.content_encrypted,
        masterPassphrase,
        entry.encryption_salt,
        entry.encryption_iv
      )
      
      setDecryptedContent(prev => ({ ...prev, [entry.id]: decrypted }))
      setDecryptingId(null)
      toast('Entry decrypted successfully', 'success')
    } catch (err: any) {
      console.error('Decryption error:', err)
      // If decryption fails, it might be wrong passphrase - clear it and prompt again
      if (err.message?.includes('passphrase') || err.message?.includes('incorrect')) {
        setMasterPassphrase('')
        setShowMasterPassphrasePrompt(true)
        toast('Incorrect passphrase. Please enter your master passphrase again.', 'error')
      } else {
        toast(err.message || 'Failed to decrypt. Please check your passphrase.', 'error')
      }
    }
  }

  const handleEdit = (entry: any) => {
    // Block editing encrypted entries that haven't been decrypted yet
    if (entry.is_encrypted && !decryptedContent[entry.id]) {
      toast('Please decrypt this entry first before editing.', 'error')
      return
    }
    setEditingId(entry.id)
    setEditTitle(entry.title || '')
    setEditContent(decryptedContent[entry.id] || entry.content || '')
    setEditMood(entry.mood || '')
    setEditMediaUrl(entry.media_url || '')
    setEditMediaType(entry.media_type || '')
    setEditIsEncrypted(!!entry.is_encrypted)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setEditMood('')
    setEditMediaUrl('')
    setEditMediaType('')
    setEditIsEncrypted(false)
  }

  // Lightbox functions
  const openImageLightbox = (imageUrl: string, allImages: string[], index: number) => {
    setImageError(false)
    setLightboxImage(imageUrl)
    setLightboxImages(allImages)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxImage('')
    setLightboxImages([])
    setLightboxIndex(0)
    setImageError(false)
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxImages.length === 0) return
    
    let newIndex = lightboxIndex
    if (direction === 'prev') {
      newIndex = lightboxIndex > 0 ? lightboxIndex - 1 : lightboxImages.length - 1
    } else {
      newIndex = lightboxIndex < lightboxImages.length - 1 ? lightboxIndex + 1 : 0
    }
    
    setLightboxIndex(newIndex)
    setLightboxImage(lightboxImages[newIndex])
  }

  // Handle keyboard navigation and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox('prev')
      } else if (e.key === 'ArrowRight') {
        navigateLightbox('next')
      }
    }

    // iOS Safari requires position:fixed on body to truly prevent scroll
    const anyModalOpen = lightboxOpen || !!shareModalEntry || showImageModal
    if (anyModalOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) window.scrollTo(0, parseInt(scrollY) * -1)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [lightboxOpen, lightboxIndex, lightboxImages, shareModalEntry, showImageModal])

  const handleEditSave = async () => {
    if (!user || !editingId || !editContent.trim()) return

    try {
      setEditLoading(true)

      let encryptedData = null
      let finalContent = editContent.trim()

      // Re-encrypt if the entry was originally encrypted
      if (editIsEncrypted) {
        if (!masterPassphrase) {
          toast('Cannot save — no passphrase in session. Please decrypt the entry again first.', 'error')
          setEditLoading(false)
          return
        }
        encryptedData = await encryptJournalContent(finalContent, masterPassphrase)
        finalContent = '' // don't send plaintext when encrypting
      }
      
      // Use the secure API route for updating
      const response = await fetch('/api/update-journal-entry-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: editingId,
          title: editTitle.trim() || undefined,
          content: finalContent,
          content_encrypted: encryptedData?.encrypted || null,
          is_encrypted: editIsEncrypted,
          encryption_key_id: encryptedData?.keyId || null,
          encryption_salt: encryptedData?.salt || null,
          encryption_iv: encryptedData?.iv || null,
          mood: editMood || undefined,
          tags: [],
          media_url: editMediaUrl || undefined,
          media_type: editMediaType || undefined,
          is_private: true,
          userId: user.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update journal entry')
      }

      // Update the entry in the local state
      setEntries(entries.map(entry => 
        entry.id === editingId 
          ? { ...entry, ...result.entry }
          : entry
      ))

      handleEditCancel()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setEditLoading(false)
    }
  }

  const handleShareToCommunity = async (entry: any, description: string) => {
    if (!user) {
      setError('You must be logged in to share to the community')
      return
    }

    try {
      setSharingId(entry.id)
      setShareModalEntry(null)

      const response = await fetch('/api/create-post-secure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: description,
          tags: entry.tags || [],
          content_warning: undefined,
          media_url: entry.media_url || undefined,
          media_type: entry.media_type || undefined,
          userId: user.id
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create community post')
      }
      
      toast('✨ Your thoughts are now floating in the Community Orbit! ✨', 'success')
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSharingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    
    // Always show the actual date with year (UK/AUS format: day month year)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
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
      <div className="text-center py-12 sm:py-16 bg-lofi-card rounded-xl shadow-lg rainbow-border-soft">
        <div className="text-6xl sm:text-7xl mb-4 animate-float">🐋</div>
        <h3 className="text-xl sm:text-2xl font-space-whale-heading text-space-whale-navy mb-3">No entries yet</h3>
        <p className="text-base sm:text-lg text-space-whale-navy/80 font-space-whale-body mb-6 max-w-md mx-auto">
          Start your journey by creating your first journal entry. Your inner space is waiting.
        </p>
        <div className="text-sm text-space-whale-purple/70 font-space-whale-body">
          <p>Your journal is a safe space for reflection and growth</p>
        </div>
      </div>
    )
  }

  const modals = mounted ? createPortal(
    <>
      {/* Single Image Modal - matches Community Orbit style */}
      {showImageModal && showImageUrl && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
          onClick={() => setShowImageModal(false)}
        >
          <img
            src={showImageUrl}
            alt="Journal media - enlarged (click to close)"
            className="object-contain rounded-lg shadow-2xl cursor-pointer"
            style={{ maxHeight: '85dvh', maxWidth: '90vw' }}
            onClick={() => setShowImageModal(false)}
          />
        </div>
      )}

      {/* Mood Board Image Lightbox */}
      {lightboxOpen && lightboxImage && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-space-whale-lavender/90 to-space-whale-purple/90 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4"
          onClick={closeLightbox}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('prev') }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('next') }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <img
              src={lightboxImage}
              alt="Mood board image - click to close"
              className="object-contain rounded-lg shadow-2xl cursor-pointer"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '80dvh', maxWidth: 'min(90vw, 800px)' }}
            />
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {lightboxIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share to Community Orbit Modal */}
      {shareModalEntry && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 overscroll-none"
          onClick={() => setShareModalEntry(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 text-space-whale-purple" />
                Share to Community Orbit
              </h3>
              <button onClick={() => setShareModalEntry(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {shareModalEntry.media_type === 'moodboard' && shareModalEntry.tags?.length > 0 && (
              <div className="mb-4 flex items-center gap-2 text-sm text-space-whale-purple bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2">
                <span>✨</span>
                <span>{shareModalEntry.tags.filter((u: string) => u && (u.startsWith('data:image/') || u.startsWith('https://'))).length} mood board image(s) will be included</span>
              </div>
            )}
            {shareModalEntry.media_type === 'image' && shareModalEntry.media_url && (
              <div className="mb-4">
                <img src={shareModalEntry.media_url} alt="Post preview" className="w-full h-32 object-cover rounded-lg" />
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="font-normal text-gray-400 dark:text-gray-500">(visible to all space whales)</span>
            </label>
            <textarea
              value={shareDescription}
              onChange={(e) => setShareDescription(e.target.value)}
              placeholder="Add some context for the community..."
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-space-whale-purple resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShareModalEntry(null)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleShareToCommunity(shareModalEntry, shareDescription)}
                disabled={sharingId === shareModalEntry.id}
                className="flex-1 px-4 py-2 rounded-lg bg-space-whale-purple text-white text-sm font-medium hover:bg-space-whale-purple/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sharingId === shareModalEntry.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <><Share2 className="h-4 w-4" />Share</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decryption Modal */}
      {decryptingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Lock className="h-5 w-5 mr-2 text-space-whale-purple" />
                Decrypt Entry
              </h3>
              <button onClick={() => { setDecryptingId(null); setMasterPassphraseInput('') }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {masterPassphrase 
                ? 'This entry is encrypted. Click decrypt to view it using your master passphrase.'
                : 'This entry is encrypted. Enter your master passphrase to decrypt and view it. This passphrase will be used for all encrypted entries in this session.'}
            </p>
            <div className="space-y-4">
              {!masterPassphrase ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Master Encryption Passphrase</label>
                    <input
                      type="password"
                      value={masterPassphraseInput}
                      onChange={(e) => setMasterPassphraseInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && masterPassphraseInput && masterPassphraseInput.length >= 8) {
                          const entry = entries.find(e => e.id === decryptingId)
                          if (entry) handleSetMasterPassphrase(entry)
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                      placeholder="Enter your master encryption passphrase"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This passphrase will be used for all encrypted entries in this session.</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => { const entry = entries.find(e => e.id === decryptingId); if (entry) handleSetMasterPassphrase(entry) }}
                      disabled={!masterPassphraseInput || masterPassphraseInput.length < 8}
                      className="flex-1 px-4 py-2 bg-space-whale-purple text-white rounded-lg hover:bg-space-whale-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Set & Decrypt
                    </button>
                    <button onClick={() => { setDecryptingId(null); setMasterPassphraseInput('') }} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-800 dark:text-green-200">✓ Master passphrase is set for this session</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => { const entry = entries.find(e => e.id === decryptingId); if (entry) handleDecrypt(entry) }}
                      className="flex-1 px-4 py-2 bg-space-whale-purple text-white rounded-lg hover:bg-space-whale-purple/90 transition-colors"
                    >
                      Decrypt Entry
                    </button>
                    <button onClick={() => setDecryptingId(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      Cancel
                    </button>
                  </div>
                  <button onClick={handleClearMasterPassphrase} className="w-full mt-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    Clear master passphrase from memory
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Entry Modal */}
      {fullEntryId && (() => {
        const entry = entries.find(e => e.id === fullEntryId)
        if (!entry) return null
        const content = isEncrypted(entry)
          ? decryptedContent[entry.id] || null
          : entry.content
        return (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
            onClick={() => setFullEntryId(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[85dvh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex-1 min-w-0 pr-4">
                  {entry.title && (
                    <h3 className="text-xl font-bold text-space-whale-navy dark:text-white mb-1 leading-snug">
                      {entry.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                    <span>{new Date(entry.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {entry.mood && <span>· {entry.mood}</span>}
                    {isEncrypted(entry) && <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted</span>}
                  </div>
                </div>
                <button
                  onClick={() => setFullEntryId(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-6 flex-1">
                {isEncrypted(entry) && !content ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <Lock className="h-8 w-8 text-space-whale-purple/50" />
                    <p className="text-sm text-gray-500 text-center">This entry is encrypted.<br />Decrypt it first to read the full content.</p>
                    <button
                      onClick={() => { setFullEntryId(null); setDecryptingId(entry.id) }}
                      className="px-4 py-2 bg-space-whale-purple text-white text-sm rounded-lg hover:bg-space-whale-purple/90 transition-colors"
                    >
                      Decrypt entry
                    </button>
                  </div>
                ) : (
                  <p className="text-space-whale-navy dark:text-gray-100 whitespace-pre-wrap font-space-whale-body leading-relaxed">
                    {content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </>,
    document.body
  ) : null

  return (
    <>
    <div className="space-y-4 overflow-x-hidden">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-lofi-card rounded-xl shadow-lg p-3 sm:p-5 hover:shadow-xl transition-all duration-300 rainbow-border-soft overflow-hidden">
          <div className="flex flex-row justify-between items-start gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-space-whale-subheading text-space-whale-navy break-words">
                  {entry.title || 'Untitled Entry'}
                </h3>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-space-whale-purple" />
                  <span className="text-xs text-space-whale-purple font-space-whale-body">Private</span>
                  {isEncrypted(entry) && (
                    <span className="text-xs text-space-whale-purple font-space-whale-body ml-1">
                      • 🔒 Encrypted
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-space-whale-purple font-space-whale-body">
                <div className="flex items-center flex-shrink-0">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  {formatDate(entry.created_at)}
                </div>
                {entry.mood && (
                  <div className="flex items-center flex-shrink-0">
                    <span className="mr-1">{getMoodEmoji(entry.mood)}</span>
                    <span className="capitalize">{entry.mood}</span>
                  </div>
                )}
                {entry.media_type === 'moodboard' && (
                  <div className="flex items-center flex-shrink-0">
                    <span>✨ Mood board</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-0.5 flex-shrink-0">
              <button 
                onClick={() => {
                  const prefill = entry.content && !isEncrypted(entry) ? entry.content : ''
                  setShareDescription(prefill)
                  setShareModalEntry(entry)
                }}
                disabled={sharingId === entry.id}
                className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200 rounded-lg active:scale-95 disabled:opacity-50 flex items-center justify-center"
                title="Share to Community Orbit"
                aria-label="Share to Community Orbit"
              >
                {sharingId === entry.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
              </button>
              <button 
                onClick={() => handleEdit(entry)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-all duration-200 rounded-lg active:scale-95 flex items-center justify-center"
                title="Edit entry"
                aria-label="Edit entry"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg active:scale-95 disabled:opacity-50 flex items-center justify-center"
                title="Delete entry"
                aria-label="Delete entry"
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
            {/* Edit Form */}
            {editingId === entry.id ? (
              <div className="bg-lofi-card rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-space-whale-navy mb-2">Title (optional)</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                    placeholder="Add a title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-space-whale-navy mb-2">Content *</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                    rows={4}
                    placeholder="What's on your mind?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-space-whale-navy mb-2">Mood (optional)</label>
                  <input
                    type="text"
                    value={editMood}
                    onChange={(e) => setEditMood(e.target.value)}
                    className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                    placeholder="How are you feeling?"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleEditSave}
                    disabled={editLoading || !editContent.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Only show content if it's not a mood board */}
                {entry.media_type !== 'moodboard' && (
                  <div className="mb-3">
                    {isEncrypted(entry) ? (
                      decryptedContent[entry.id] ? (
                        <p className="text-space-whale-navy whitespace-pre-wrap font-space-whale-body line-clamp-4">
                          {decryptedContent[entry.id]}
                        </p>
                      ) : (
                        <div className="bg-space-whale-lavender/10 border border-space-whale-lavender/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Lock className="h-5 w-5 text-space-whale-purple" />
                              <span className="text-sm font-medium text-space-whale-navy">This entry is encrypted</span>
                            </div>
                            <button
                              onClick={() => setDecryptingId(entry.id)}
                              className="px-3 py-1.5 bg-space-whale-purple text-white text-sm rounded-lg hover:bg-space-whale-purple/90 transition-colors"
                            >
                              Decrypt
                            </button>
                          </div>
                          <p className="text-xs text-space-whale-purple/70">
                            {masterPassphrase 
                              ? 'Click decrypt to view this encrypted entry'
                              : 'Enter your master passphrase to view this encrypted entry'}
                          </p>
                        </div>
                      )
                    ) : (
                      <p className="text-space-whale-navy whitespace-pre-wrap font-space-whale-body line-clamp-4">
                        {entry.content}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Media Display */}
            {entry.media_url && (
              <div className="mt-3">
                {entry.media_type === 'image' ? (
                  <div 
                    className="relative group cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      if (entry.media_url) {
                        setShowImageUrl(entry.media_url)
                        setShowImageModal(true)
                      }
                    }}
                  >
                    <img
                      src={entry.media_url}
                      alt="Journal media"
                      className="w-full h-72 sm:h-96 object-cover rounded-xl shadow-md transition-transform group-hover:scale-[1.02]"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        console.error('Image failed to load:', entry.media_url, entry.media_type)
                        // Hide broken images (old blob URLs)
                        if (entry.media_url?.startsWith('blob:')) {
                          // Hiding broken blob URL image
                          e.currentTarget.style.display = 'none'
                        }
                      }}
                      onLoad={() => {
                        // Image loaded successfully
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ) : entry.media_type === 'moodboard' ? (
                  <div>
                    {(() => {
                      const imageUrls = entry.tags?.filter(
                        (url: string) => url && (url.startsWith('data:image/') || url.startsWith('https://'))
                      ) || []

                      if (imageUrls.length === 0) return null

                      if (imageUrls.length === 1) return (
                        <div
                          className="cursor-pointer group"
                          onClick={() => openImageLightbox(imageUrls[0], imageUrls, 0)}
                        >
                          <div className="relative overflow-hidden rounded-xl">
                            <img
                              src={imageUrls[0]}
                              alt="Mood board image"
                              className="w-full h-auto rounded-xl shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                              loading="lazy"
                              decoding="async"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                          </div>
                        </div>
                      )

                      return (
                        <div className="columns-2 gap-2">
                          {imageUrls.map((imageUrl: string, index: number) => (
                            <div
                              key={index}
                              className="break-inside-avoid mb-2 cursor-pointer group"
                              onClick={() => openImageLightbox(imageUrl, imageUrls, index)}
                            >
                              <div className="relative overflow-hidden rounded-lg">
                                <img
                                  src={imageUrl}
                                  alt={`Mood board image ${index + 1}`}
                                  className="w-full h-auto rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => {
                                    const parent = e.currentTarget.closest('.break-inside-avoid') as HTMLElement
                                    if (parent) parent.style.display = 'none'
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                ) : entry.media_type === 'video' ? (
                  <video
                    src={entry.media_url}
                    controls
                    className="w-full h-72 sm:h-96 object-cover rounded-xl shadow-md"
                  />
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {entry.media_type === 'audio' ? '🎵' : '📄'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {entry.media_type === 'audio' ? 'Audio File' : 'Document'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {entry.media_url.split('/').pop()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setFullEntryId(entry.id)}
              className="flex items-center text-space-whale-purple hover:text-space-whale-navy text-sm font-space-whale-accent transition-colors"
            >
              <Eye className="h-4 w-4 mr-1" />
              Read full entry
            </button>
            
            {entry.tags && entry.tags.length > 0 && entry.media_type !== 'moodboard' && (
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

      {modals}
    </>
  )
}

