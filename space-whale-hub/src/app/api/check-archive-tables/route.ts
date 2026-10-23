import { retiredApiResponse } from '@/lib/api-retired'

export const dynamic = 'force-dynamic'

export async function GET() {
  return retiredApiResponse()
}

export async function POST() {
  return retiredApiResponse()
}
