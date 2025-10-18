'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/lib/database'
import { Shield, Lock, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react'

export default function PrivacySettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    dataRetention: 'indefinite', // indefinite, 1year, 6months, 30days
    dataSharing: false,
    analytics: false,
    contentWarnings: true,
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      screenReader: false
    }
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(user?.id!, { privacy_settings: settings })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save privacy settings:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Privacy & Safety Settings
        </h2>
      </div>

      {/* Data Retention */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Data Retention
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          How long should we keep your personal data?
        </p>
        <div className="space-y-2">
          {[
            { value: 'indefinite', label: 'Keep indefinitely (recommended for healing journey)', desc: 'Your reflections help track your growth over time' },
            { value: '1year', label: '1 year', desc: 'Data automatically deleted after 1 year' },
            { value: '6months', label: '6 months', desc: 'Data automatically deleted after 6 months' },
            { value: '30days', label: '30 days', desc: 'Data automatically deleted after 30 days' }
          ].map((option) => (
            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="dataRetention"
                value={option.value}
                checked={settings.dataRetention === option.value}
                onChange={(e) => setSettings({...settings, dataRetention: e.target.value})}
                className="mt-1 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Toggles */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lock className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Anonymous Analytics</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Help improve the platform (no personal data)</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.analytics}
              onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Content Warnings</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Show content warnings for sensitive material</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.contentWarnings}
              onChange={(e) => setSettings({...settings, contentWarnings: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">
              Your Privacy is Protected
            </h4>
            <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
              <li>• All personal reflections are encrypted and private</li>
              <li>• Only you can access your journal entries</li>
              <li>• Data is stored securely with industry-standard encryption</li>
              <li>• You can delete your data at any time</li>
              <li>• We never share your personal information</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  )
}

