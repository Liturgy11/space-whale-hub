/** Image URLs stored in journal/post tags for mood boards. */
export function getMoodBoardImageUrls(tags?: string[] | null): string[] {
  return (tags || []).filter(
    (url) => url && (url.startsWith('data:image/') || url.startsWith('https://'))
  )
}
