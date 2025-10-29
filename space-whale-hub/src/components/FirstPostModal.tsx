'use client'

import Link from 'next/link'
import { X, BookOpen } from 'lucide-react'

interface FirstPostModalProps {
  onConfirm: () => void
  onClose: () => void
}

export default function FirstPostModal({ onConfirm, onClose }: FirstPostModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 p-4 overflow-y-auto flex items-center justify-center">
      <div role="dialog" aria-modal="true" className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-space-whale-lavender/30 rainbow-border-soft">
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-space-whale-heading text-space-whale-navy">A gentle note 💜</h2>
            <button aria-label="Close" onClick={onClose} className="text-space-whale-purple hover:text-space-whale-dark-purple">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-space-whale-navy font-space-whale-body mb-4">
            Content warnings are available when you post. We welcome what’s tender and receive it with care.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/about" className="btn-space-whale-secondary inline-flex items-center justify-center">
              <BookOpen className="h-4 w-4 mr-2" /> Read guidelines
            </Link>
            <button onClick={onConfirm} className="btn-lofi inline-flex items-center justify-center">Create post</button>
          </div>
        </div>
      </div>
    </div>
  )
}


