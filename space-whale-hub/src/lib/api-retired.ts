import { NextResponse } from 'next/server'

/** Legacy/debug routes return 410 so they stop serving without breaking the build tree. */
export function retiredApiResponse(replacement?: string) {
  return NextResponse.json(
    {
      success: false,
      error: replacement
        ? `This endpoint has been retired. Use ${replacement} instead.`
        : 'This endpoint has been retired.',
    },
    { status: 410 }
  )
}
