export interface PostMediaFields {
  media_url?: string | null
  media_urls?: string[] | null
  media_type?: string | null
}

/** Ordered media URLs for a post (gallery + legacy single-image). */
export function getPostMediaUrls(post: PostMediaFields): string[] {
  if (post.media_urls && post.media_urls.length > 0) {
    return post.media_urls.filter(Boolean)
  }
  if (post.media_url) return [post.media_url]
  return []
}

export function resolvePostMediaType(
  urls: string[],
  explicitType?: string | null
): string | null {
  if (urls.length === 0) return null
  if (urls.length > 1) return 'gallery'
  if (explicitType === 'video') return 'video'
  return explicitType || 'image'
}

export const MAX_POST_IMAGES = 10
