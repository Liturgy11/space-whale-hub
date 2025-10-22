'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function StorageTest() {
  const { user } = useAuth()
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runStorageTest = async () => {
    if (!user?.id) {
      alert('Please log in to test storage')
      return
    }

    setTesting(true)
    setResults(null)

    try {
      const response = await fetch('/api/test-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await response.json()
      setResults(data)
      
      if (data.success) {
        console.log('✅ Storage test completed successfully')
      } else {
        console.error('❌ Storage test failed:', data.error)
      }
      
    } catch (error) {
      console.error('Storage test error:', error)
      setResults({ error: error.message, success: false })
    } finally {
      setTesting(false)
    }
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to test storage</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border">
      <h3 className="text-lg font-semibold mb-4">🧪 Storage Test</h3>
      
      <div className="space-y-4">
        <button 
          onClick={runStorageTest}
          disabled={testing}
          className="w-full px-4 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-space-whale-accent"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing Storage...
            </>
          ) : (
            'Run Storage Test'
          )}
        </button>

        {results && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Test Results:</h4>
            
            {results.success ? (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                All storage tests passed!
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <XCircle className="h-4 w-4 mr-2" />
                Storage test failed: {results.error}
              </div>
            )}

            {results.results && (
              <div className="mt-2 text-sm">
                <p>Check browser console for detailed results.</p>
                <p>Successful uploads: {results.results.filter((r: any) => r.success).length}</p>
                <p>Failed uploads: {results.results.filter((r: any) => !r.success).length}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>What this tests:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Bucket creation and RLS policies</li>
            <li>File upload to each bucket (avatars, posts, journal, archive)</li>
            <li>Public URL generation</li>
            <li>File deletion</li>
            <li>User permission validation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
