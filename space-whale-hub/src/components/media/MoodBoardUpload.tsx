'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMultipleMedia } from '@/lib/storage-client'
import { Upload, X, Image as ImageIcon, Loader2, Check, Plus, Trash2 } from 'lucide-react'

interface MoodBoardUploadProps {
  onUploadComplete?: (urls: string[], type: string, title?: string) => void
  onCancel?: () => void
}

interface UploadedFile {
  file: File
  preview: string
  id: string
  uploading?: boolean
  uploaded?: boolean
  url?: string
}

export default function MoodBoardUpload({ onUploadComplete, onCancel }: MoodBoardUploadProps) {
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    setError('')
    
    // Filter for images only (Android browsers sometimes return empty MIME types)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const imageFiles = newFiles.filter(file => {
      const isValidMimeType = file.type.startsWith('image/')
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      const isValidExtension = imageExtensions.includes(fileExtension)
      return isValidMimeType || isValidExtension
    })
    
    if (imageFiles.length !== newFiles.length) {
      setError('Only image files are supported for mood boards')
    }

    // Check file size (10MB limit for journal/mood boards)
    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      const fileSizeMB = (oversizedFiles[0].size / 1024 / 1024).toFixed(1)
      setError(`File too large: ${fileSizeMB}MB. Maximum size for mood boards is 10MB. Please choose smaller files or compress the images.`)
      return
    }

    const newUploadedFiles: UploadedFile[] = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7)
    }))

    setFiles(prev => [...prev, ...newUploadedFiles])
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image() // Use window.Image to avoid conflict
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const uploadFiles = async () => {
    if (!files.length || !user) return

    setUploading(true)
    setError('')

    try {
      // Use new storage system for multiple files
      const results = await uploadMultipleMedia(
        files.map(f => f.file),
        {
          category: 'journal',
          folder: 'moodboards'
        },
        user.id
      )

      const urls = results.map(result => result.url)
      
      // Call completion callback with storage URLs and title
      if (onUploadComplete) {
        onUploadComplete(urls, 'moodboard', title.trim() || undefined)
      }

    } catch (err: any) {
      console.error('Mood board upload error:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview))
    setFiles([])
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-lofi-card rounded-xl shadow-lg p-6 rainbow-border-soft">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-space-whale-heading text-space-whale-navy">Create Mood Board</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-space-whale-purple hover:text-space-whale-navy transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Title Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-space-whale-navy mb-2 font-space-whale-body">
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Autumn vibes, Morning ritual, Dreams..."
          className="mood-board-title-input"
          maxLength={100}
        />
      </div>

      {files.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-space-whale-purple bg-space-whale-lavender/20'
              : 'border-space-whale-lavender/30 hover:border-space-whale-purple/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-space-whale-purple mx-auto mb-4" />
          <h3 className="text-lg font-space-whale-subheading text-space-whale-navy mb-2">
            Upload your mood board vibes
          </h3>
          <p className="text-space-whale-navy mb-4 font-space-whale-body">
            Drag and drop images here, or click to browse
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 transition-colors font-space-whale-accent"
          >
            Choose Images
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            className="hidden"
            accept="image/*"
            multiple
          />
          <p className="text-sm text-space-whale-purple mt-4 font-space-whale-body">
            Supports multiple images (max 10MB each)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Files Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={fileObj.preview}
                    alt={fileObj.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="text-white hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add More Button */}
          <div className="flex justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 border border-space-whale-lavender/30 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/10 transition-colors font-space-whale-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add More Images
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              className="hidden"
              accept="image/*"
              multiple
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-space-whale-body">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={resetUpload}
              className="px-4 py-2 border border-space-whale-lavender/30 text-space-whale-navy rounded-lg hover:bg-space-whale-lavender/10 transition-colors font-space-whale-accent"
            >
              Cancel
            </button>
            <button
              onClick={uploadFiles}
              disabled={uploading}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-space-whale-purple to-accent-pink text-white rounded-lg hover:from-space-whale-purple/90 hover:to-accent-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-space-whale-accent"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating mood board...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create Mood Board
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}




