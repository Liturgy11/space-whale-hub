'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { uploadMedia } from '@/lib/storage-client'
import { Upload, X, Image, Video, File, Music, Loader2, Check } from 'lucide-react'

interface MediaUploadProps {
  onUploadComplete?: (url: string, type: string) => void
  onCancel?: () => void
}

export default function MediaUpload({ onUploadComplete, onCancel }: MediaUploadProps) {
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    setError('')
    setUploadedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-green-500" />
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-blue-500" />
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-purple-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const getFileType = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    if (type.startsWith('audio/')) return 'audio'
    return 'document'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const uploadFile = async () => {
    if (!uploadedFile || !user) return

    setUploading(true)
    setError('')

    try {
      console.log('Uploading file for personal media:', { fileName: uploadedFile.name, fileSize: uploadedFile.size, fileType: uploadedFile.type })

      // Use new storage system instead of direct storage calls
      const result = await uploadMedia(uploadedFile, {
        category: 'archive',
        filename: `${Date.now()}-${uploadedFile.name}`
      }, user.id)

      console.log('File uploaded to storage:', result.url)
      setUploadProgress(100)
      
      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(result.url, getFileType(uploadedFile))
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setUploadProgress(0)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Media</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Upload your creative content
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Choose Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Supports images, videos, audio, and documents (max 50MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File Preview */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              {getFileIcon(uploadedFile)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {uploadedFile.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(uploadedFile.size)} • {getFileType(uploadedFile)}
                </p>
              </div>
              <button
                onClick={resetUpload}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image Preview */}
            {uploadedFile.type.startsWith('image/') && previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Uploading...</span>
                <span className="text-gray-500 dark:text-gray-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Success */}
          {uploadProgress === 100 && !uploading && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Upload completed successfully!
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={resetUpload}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={uploadFile}
              disabled={uploading}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to Personal Space
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
