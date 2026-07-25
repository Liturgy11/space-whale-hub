/** Image URLs stored in journal/post tags for mood boards. */
export function getMoodBoardImageUrls(tags?: string[] | null): string[] {
  return (tags || []).filter(
    (url) => url && (url.startsWith('data:image/') || url.startsWith('https://'))
  )
}

interface MoodBoardPostFields {
  tags?: string[] | null
  media_url?: string | null
  media_urls?: string[] | null
}

/** Resolve mood board images from tags (legacy) or media_urls (preferred). */
export function getMoodBoardDisplayUrls(post: MoodBoardPostFields): string[] {
  const fromTags = getMoodBoardImageUrls(post.tags)
  if (fromTags.length > 0) return fromTags
  if (post.media_urls?.length) return post.media_urls.filter(Boolean)
  if (post.media_url) return [post.media_url]
  return []
}
