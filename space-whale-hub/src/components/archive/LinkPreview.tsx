'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Play, Image, FileText, Music } from 'lucide-react'

interface LinkPreviewProps {
  url: string
  title?: string
  description?: string
  className?: string
}

interface LinkMetadata {
  title?: string
  description?: string
  image?: string
  siteName?: string
}

export default function LinkPreview({ url, title, description, className = '' }: LinkPreviewProps) {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (url && !metadata) {
      fetchLinkMetadata(url)
    }
  }, [url])

  const fetchLinkMetadata = async (url: string) => {
    setLoading(true)
    setError(false)
    
    try {
      // For now, we'll create a simple preview based on the URL
      // In a production app, you'd want to use a proper link preview service
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      
      // Simple domain-based preview generation
      let previewData: LinkMetadata = {
        title: title || `Content from ${domain}`,
        description: description || `External content hosted on ${domain}`,
        siteName: domain
      }

      // Add specific handling for common platforms
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        previewData = {
          title: title || 'YouTube Video',
          description: description || 'Watch this video on YouTube',
          siteName: 'YouTube',
          image: '/youtube-preview.jpg' // You'd want to extract actual thumbnail
        }
      } else if (domain.includes('vimeo.com')) {
        previewData = {
          title: title || 'Vimeo Video',
          description: description || 'Watch this video on Vimeo',
          siteName: 'Vimeo'
        }
      } else if (domain.includes('cloudflare.stream')) {
        previewData = {
          title: title || 'Cloudflare Stream Video',
          description: description || 'Streaming video content',
          siteName: 'Cloudflare Stream'
        }
      }

      setMetadata(previewData)
    } catch (err) {
      console.error('Error fetching link metadata:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return <Play className="h-5 w-5" />
    } else if (url.includes('vimeo.com')) {
      return <Play className="h-5 w-5" />
    } else if (url.includes('cloudflare.stream')) {
      return <Play className="h-5 w-5" />
    } else {
      return <ExternalLink className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className={`w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (error || !metadata) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`block w-full aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all duration-300 ${className}`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🔗</div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            View External Content
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Click to open in new tab
          </p>
        </div>
      </a>
    )
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`block w-full aspect-video bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="h-full flex">
        {/* Preview Image/Icon */}
        <div className="w-1/3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
          {metadata.image ? (
            <img 
              src={metadata.image} 
              alt={metadata.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="text-2xl mb-1">
                {getPlatformIcon(url)}
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {metadata.siteName}
              </p>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
            {metadata.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {metadata.description}
          </p>
          <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400">
            <ExternalLink className="h-3 w-3 mr-1" />
            Open in {metadata.siteName}
          </div>
        </div>
      </div>
    </a>
  )
}
