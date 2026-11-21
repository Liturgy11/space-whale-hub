/** Helpers for Supabase Storage public URLs and signed display. */

export function isSupabasePublicStorageUrl(url: string): boolean {
  return (
    typeof url === 'string' &&
    url.includes('/storage/v1/object/public/')
  )
}

export function isJournalStorageUrl(url: string): boolean {
  return isSupabasePublicStorageUrl(url) && url.includes('/object/public/journal/')
}

/** Collect unique journal (or all public storage) https URLs from journal entries. */
export function collectJournalMediaUrls(entries: Array<{
  media_url?: string | null
  media_urls?: string[] | null
  tags?: string[] | null
}>): string[] {
  const urls = new Set<string>()
  for (const entry of entries) {
    if (entry.media_url && isJournalStorageUrl(entry.media_url)) {
      urls.add(entry.media_url)
    }
    for (const u of entry.media_urls || []) {
      if (u && isJournalStorageUrl(u)) urls.add(u)
    }
    for (const u of entry.tags || []) {
      if (u && isJournalStorageUrl(u)) urls.add(u)
    }
  }
  return Array.from(urls)
}

export function resolveDisplayUrl(
  url: string | null | undefined,
  signedUrlMap: Record<string, string>
): string {
  if (!url) return ''
  return signedUrlMap[url] || url
}
