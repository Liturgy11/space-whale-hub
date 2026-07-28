'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, BookOpen } from 'lucide-react'
import { SpaceIllustration } from '@/components/ui/EmptyState'
import { SPACE_ILLUSTRATIONS } from '@/lib/space-illustrations'

interface WelcomeModalProps {
  onClose: () => void
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [closing, setClosing] = useState(false)

  const handleClose = () => {
    setClosing(true)
    setTimeout(onClose, 150)
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 p-4 overflow-y-auto flex items-center justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className={`w-full max-w-lg bg-white rounded-2xl shadow-xl border border-space-whale-lavender/30 rainbow-border-soft ${closing ? 'scale-95 opacity-95' : 'scale-100'} transition-transform`}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 min-w-0">
              <SpaceIllustration
                src={SPACE_ILLUSTRATIONS.deepSpace}
                className="h-10 w-10 flex-shrink-0"
              />
              <h2 id="welcome-title" className="text-xl sm:text-2xl font-space-whale-heading text-space-whale-navy">
                Welcome to Space Whale Portal!
              </h2>
            </div>
            <button
              aria-label="Close"
              onClick={handleClose}
              className="text-space-whale-purple hover:text-space-whale-dark-purple"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 font-space-whale-body text-space-whale-navy">
            <p className="text-sm sm:text-base">Before you dive in, a few things:</p>

            <div className="bg-lofi-card rounded-lg p-4 border border-space-whale-lavender/30">
              <p className="font-space-whale-accent">🌊 This is a slow space</p>
              <p className="text-sm">No pressure to post or respond.</p>
            </div>

            <div className="bg-lofi-card rounded-lg p-4 border border-space-whale-lavender/30">
              <p className="font-space-whale-accent">💜 Your privacy matters</p>
              <p className="text-sm">Journal entries are private by default.</p>
            </div>

            <div className="bg-lofi-card rounded-lg p-4 border border-space-whale-lavender/30">
              <p className="font-space-whale-accent">🌱 Community care is collective</p>
              <p className="text-sm">Please read our guidelines before posting in Community Orbit.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/about"
              className="btn-space-whale-secondary inline-flex items-center justify-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Read Full Guidelines
            </Link>
            <button onClick={handleClose} className="btn-lofi inline-flex items-center justify-center">
              Start Exploring →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}




