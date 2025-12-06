'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        setError(error.message || 'Failed to send password reset email. Please try again.')
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      console.error('Reset password error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full">
        <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-space-whale-heading text-space-whale-navy mb-4">
              Check Your Email
            </h2>
            <p className="font-space-whale-body text-space-whale-navy mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm font-space-whale-body text-space-whale-navy/70 mb-6">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <button
              onClick={onBack}
              className="text-space-whale-purple hover:text-space-whale-dark-purple font-space-whale-accent transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
        <div className="text-center mb-6">
          <h2 className="text-xl font-space-whale-heading text-space-whale-navy mb-2">
            Reset Password
          </h2>
          <p className="text-sm font-space-whale-body text-space-whale-navy/70">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent transition-colors font-space-whale-body"
              placeholder="Email"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-space-whale-purple to-accent-pink text-white font-space-whale-accent py-3 px-4 rounded-lg hover:from-space-whale-dark-purple hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-space-whale-purple/30"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Sending...
              </div>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="flex items-center justify-center text-sm font-space-whale-body text-space-whale-purple hover:text-space-whale-dark-purple transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

