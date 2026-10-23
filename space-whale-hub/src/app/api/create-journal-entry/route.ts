import { retiredApiResponse } from '@/lib/api-retired'

export const dynamic = 'force-dynamic'

export async function POST() {
  return retiredApiResponse('/api/create-journal-entry-secure')
}
