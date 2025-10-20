'use client'

import { useState, useEffect } from 'react'
import { clearSupabaseStorage, getStorageUsage, clearAllStorage } from '@/lib/storage-utils'
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

export default function StorageDebugger() {
  const [storageInfo, setStorageInfo] = useState<{
    totalSize: number
    itemCount: number
    sizeInMB: string
  }>({ totalSize: 0, itemCount: 0, sizeInMB: '0' })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    updateStorageInfo()
  }, [])

  const updateStorageInfo = () => {
    const info = getStorageUsage()
    setStorageInfo(info)
  }

  const handleClearSupabase = () => {
    const success = clearSupabaseStorage()
    if (success) {
      updateStorageInfo()
      alert('Supabase storage cleared!')
    } else {
      alert('Failed to clear storage')
    }
  }

  const handleClearAll = () => {
    if (confirm('This will clear ALL localStorage data. Are you sure?')) {
      const success = clearAllStorage()
      if (success) {
        updateStorageInfo()
        alert('All storage cleared! You may need to sign in again.')
        window.location.reload()
      } else {
        alert('Failed to clear storage')
      }
    }
  }

  // Only show if storage is getting large
  const shouldShow = parseFloat(storageInfo.sizeInMB) > 1 || storageInfo.itemCount > 50

  if (!shouldShow && !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <h3 className="text-sm font-medium text-yellow-800">Storage Warning</h3>
        </div>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-yellow-600 hover:text-yellow-800"
        >
          {isVisible ? '−' : '+'}
        </button>
      </div>
      
      {isVisible && (
        <div className="space-y-3">
          <div className="text-xs text-yellow-700">
            <p>Storage Usage: {storageInfo.sizeInMB} MB</p>
            <p>Items: {storageInfo.itemCount}</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleClearSupabase}
              className="flex items-center px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Supabase
            </button>
            
            <button
              onClick={handleClearAll}
              className="flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </button>
          </div>
          
          <button
            onClick={updateStorageInfo}
            className="text-xs text-yellow-600 hover:text-yellow-800 underline"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}
