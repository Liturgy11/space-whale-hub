import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  buildTrimMetadataPayload,
  metadataByteSize,
  trimUserMetadata,
} from '@/lib/user-metadata'
import { verifyAdminUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

type UserAuditRow = {
  id: string
  email: string | undefined
  metadataBytes: number
  metadataMB: string
  keys: string[]
  trimmedBytes: number
  savingsBytes: number
}

/** GET — list auth users with metadata sizes (admin only). */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminUser(request)
  if (!auth.ok) return auth.response

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const users: UserAuditRow[] = (data.users || []).map((u) => {
      const metadata = (u.user_metadata || {}) as Record<string, unknown>
      const metadataBytes = metadataByteSize(metadata)
      const trimmed = trimUserMetadata(metadata)
      const trimmedBytes = metadataByteSize(trimmed)

      return {
        id: u.id,
        email: u.email,
        metadataBytes,
        metadataMB: (metadataBytes / (1024 * 1024)).toFixed(2),
        keys: Object.keys(metadata),
        trimmedBytes,
        savingsBytes: metadataBytes - trimmedBytes,
      }
    })

    users.sort((a, b) => b.metadataBytes - a.metadataBytes)

    const totalBytes = users.reduce((sum, u) => sum + u.metadataBytes, 0)
    const oversized = users.filter((u) => u.metadataBytes > 50_000)

    return NextResponse.json({
      success: true,
      summary: {
        userCount: users.length,
        totalMetadataMB: (totalBytes / (1024 * 1024)).toFixed(2),
        oversizedCount: oversized.length,
        thresholdBytes: 50_000,
      },
      users,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Audit failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

/**
 * POST — trim user_metadata to allowed small fields (admin only).
 * Body: { dryRun?: boolean, userId?: string }
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminUser(request)
  if (!auth.ok) return auth.response

  try {
    const body = await request.json().catch(() => ({}))
    const dryRun = Boolean(body.dryRun)
    const targetUserId = typeof body.userId === 'string' ? body.userId : null

    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const targets = (data.users || []).filter((u) =>
      targetUserId ? u.id === targetUserId : true
    )

    const results: Array<{
      id: string
      email: string | undefined
      beforeBytes: number
      afterBytes: number
      removedKeys: string[]
      updated: boolean
    }> = []

    for (const u of targets) {
      const before = (u.user_metadata || {}) as Record<string, unknown>
      const beforeBytes = metadataByteSize(before)
      const trimmed = trimUserMetadata(before)
      const afterBytes = metadataByteSize(trimmed)
      const removedKeys = Object.keys(before).filter((k) => !(k in trimmed))

      if (!dryRun && beforeBytes !== afterBytes) {
        await supabaseAdmin.auth.admin.updateUserById(u.id, {
          user_metadata: buildTrimMetadataPayload(before),
        })
      }

      results.push({
        id: u.id,
        email: u.email,
        beforeBytes,
        afterBytes,
        removedKeys,
        updated: !dryRun && beforeBytes !== afterBytes,
      })
    }

    return NextResponse.json({
      success: true,
      dryRun,
      trimmedCount: results.filter((r) => r.beforeBytes !== r.afterBytes).length,
      results: results.sort((a, b) => b.beforeBytes - a.beforeBytes),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Trim failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
