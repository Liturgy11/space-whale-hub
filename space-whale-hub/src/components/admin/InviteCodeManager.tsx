'use client'

import { useState, useEffect } from 'react'
import { Plus, Copy, Trash2, Calendar, Users, Key, CheckCircle, XCircle } from 'lucide-react'

interface InviteCode {
  id: string
  code: string
  max_uses: number
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
  usage: Array<{
    used_by_user: { display_name: string }
    used_at: string
  }>
}

export default function InviteCodeManager() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [maxUses, setMaxUses] = useState(1)
  const [expiresAt, setExpiresAt] = useState('')

  useEffect(() => {
    fetchInviteCodes()
  }, [])

  const fetchInviteCodes = async () => {
    try {
      const response = await fetch('/api/invite-codes')
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setInviteCodes(data.inviteCodes)
      }
    } catch (error) {
      setError('Failed to fetch invite codes')
    } finally {
      setLoading(false)
    }
  }

  const createInviteCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/invite-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: newCode,
          maxUses: maxUses,
          expiresAt: expiresAt || null
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setInviteCodes([data.inviteCode, ...inviteCodes])
        setNewCode('')
        setMaxUses(1)
        setExpiresAt('')
        setShowCreateForm(false)
        setError('')
      }
    } catch (error) {
      setError('Failed to create invite code')
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    // You could add a toast notification here
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-space-whale-purple"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-lofi-card rounded-xl shadow-lg p-8 rainbow-border-soft">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-space-whale-heading text-space-whale-navy">
            Invite Code Management
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-lofi flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Code
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 text-sm font-space-whale-body">{error}</p>
          </div>
        )}

        {showCreateForm && (
          <form onSubmit={createInviteCode} className="bg-space-whale-lavender/10 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-4">
              Create New Invite Code
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                  placeholder="e.g., SPACEWHALE2024"
                />
              </div>
              <div>
                <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                  Max Uses
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-space-whale-accent text-space-whale-navy mb-2">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border border-space-whale-lavender/30 rounded-lg bg-white text-space-whale-navy focus:ring-2 focus:ring-space-whale-purple focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="btn-space-whale"
              >
                Create Code
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-space-whale-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {inviteCodes.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-space-whale-lavender mx-auto mb-4" />
              <p className="text-space-whale-navy font-space-whale-body">
                No invite codes created yet. Create your first one to start inviting community members.
              </p>
            </div>
          ) : (
            inviteCodes.map((code) => (
              <div
                key={code.id}
                className={`border rounded-lg p-4 ${
                  isExpired(code.expires_at) || !code.is_active
                    ? 'border-red-200 bg-red-50'
                    : 'border-space-whale-lavender/30 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-lg font-mono font-bold text-space-whale-navy bg-space-whale-lavender/20 px-3 py-1 rounded">
                        {code.code}
                      </code>
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="text-space-whale-purple hover:text-space-whale-dark-purple"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {isExpired(code.expires_at) ? (
                        <XCircle className="h-5 w-5 text-red-500" title="Expired" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" title="Active" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-space-whale-navy">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{code.current_uses}/{code.max_uses} uses</span>
                      </div>
                      {code.expires_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Expires {formatDate(code.expires_at)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatDate(code.created_at)}</span>
                      </div>
                    </div>

                    {code.usage && code.usage.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-space-whale-accent text-space-whale-navy mb-2">
                          Used by:
                        </p>
                        <div className="space-y-1">
                          {code.usage.map((usage, index) => (
                            <div key={index} className="text-sm text-space-whale-purple">
                              {usage.used_by_user.display_name} - {formatDate(usage.used_at)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
