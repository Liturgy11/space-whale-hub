/**
 * Utility functions for handling signed URLs for archive media
 */

export interface SignedUrlResult {
  original_url: string
  signed_url: string
  expires_at?: string
  error?: string
}

/**
 * Generate signed URLs for a list of media URLs
 */
export async function getSignedUrls(mediaUrls: string[]): Promise<SignedUrlResult[]> {
  if (!mediaUrls || mediaUrls.length === 0) {
    return []
  }

  try {
    const response = await fetch('/api/get-signed-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ media_urls: mediaUrls })
    })

    if (!response.ok) {
      console.error('Failed to get signed URLs:', response.statusText)
      // Fallback to original URLs
      return mediaUrls.map(url => ({
        original_url: url,
        signed_url: url,
        error: 'Failed to generate signed URL'
      }))
    }

    const result = await response.json()
    
    if (!result.success) {
      console.error('API error:', result.error)
      // Fallback to original URLs
      return mediaUrls.map(url => ({
        original_url: url,
        signed_url: url,
        error: result.error
      }))
    }

    return result.data
  } catch (error) {
    console.error('Error getting signed URLs:', error)
    // Fallback to original URLs
    return mediaUrls.map(url => ({
      original_url: url,
      signed_url: url,
      error: 'Network error'
    }))
  }
}

/**
 * Generate signed URL for a single media URL
 */
export async function getSignedUrl(mediaUrl: string): Promise<string> {
  const results = await getSignedUrls([mediaUrl])
  return results[0]?.signed_url || mediaUrl
}

/**
 * Create a mapping of original URLs to signed URLs
 */
export function createSignedUrlMap(signedUrlResults: SignedUrlResult[]): Record<string, string> {
  const urlMap: Record<string, string> = {}
  
  signedUrlResults.forEach(result => {
    urlMap[result.original_url] = result.signed_url
  })
  
  return urlMap
}



