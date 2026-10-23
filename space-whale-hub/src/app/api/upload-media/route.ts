import { retiredApiResponse } from '@/lib/api-retired'

export const dynamic = 'force-dynamic'

export async function POST() {
  return retiredApiResponse('/api/create-signed-upload-secure or /api/upload-storage')
}
