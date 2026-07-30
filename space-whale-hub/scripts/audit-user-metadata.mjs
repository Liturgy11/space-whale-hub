#!/usr/bin/env node
/**
 * Audit Supabase auth user_metadata sizes.
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env or .env.local
 *
 * Usage:
 *   node scripts/audit-user-metadata.mjs
 *   node scripts/audit-user-metadata.mjs --trim --dry-run
 *   node scripts/audit-user-metadata.mjs --trim
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const ALLOWED_KEYS = new Set([
  'display_name',
  'pronouns',
  'country',
  'avatar_url',
  'email_opt_in',
])

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  }
}

function byteSize(obj) {
  return new Blob([JSON.stringify(obj ?? {})]).size
}

function trimMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return {}
  const out = {}
  for (const key of ALLOWED_KEYS) {
    const v = metadata[key]
    if (v === undefined || v === null) continue
    if (key === 'email_opt_in') {
      out[key] = Boolean(v)
    } else if (typeof v === 'string' && v.length <= 2048) {
      out[key] = v
    }
  }
  return out
}

function buildTrimPayload(metadata) {
  const trimmed = trimMetadata(metadata)
  const payload = { ...trimmed }
  if (metadata && typeof metadata === 'object') {
    for (const key of Object.keys(metadata)) {
      if (!(key in trimmed)) payload[key] = null
    }
  }
  return payload
}

loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const dryRun = process.argv.includes('--dry-run')
const trim = process.argv.includes('--trim')

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
if (error) {
  console.error('listUsers failed:', error.message)
  process.exit(1)
}

const rows = (data.users || [])
  .map((u) => {
    const before = u.user_metadata || {}
    const trimmed = trimMetadata(before)
    const payload = buildTrimPayload(before)
    return {
      id: u.id,
      email: u.email,
      beforeBytes: byteSize(before),
      afterBytes: byteSize(trimmed),
      keys: Object.keys(before),
      removedKeys: Object.keys(before).filter((k) => !(k in trimmed)),
    }
  })
  .sort((a, b) => b.beforeBytes - a.beforeBytes)

console.log('\n=== User metadata audit ===\n')
for (const r of rows) {
  const flag = r.beforeBytes > 50_000 ? ' ⚠️  OVERSIZED' : ''
  console.log(
    `${r.email || r.id}: ${(r.beforeBytes / 1024).toFixed(1)} KB → ${(r.afterBytes / 1024).toFixed(1)} KB${flag}`
  )
  if (r.removedKeys.length) console.log(`  would remove: ${r.removedKeys.join(', ')}`)
}

const totalBefore = rows.reduce((s, r) => s + r.beforeBytes, 0)
console.log(`\nTotal metadata: ${(totalBefore / 1024 / 1024).toFixed(2)} MB across ${rows.length} users`)

if (trim) {
  console.log(dryRun ? '\n--dry-run: no changes written' : '\nTrimming metadata...')
  for (const r of rows) {
    if (r.beforeBytes === r.afterBytes) continue
    if (dryRun) continue
    const trimmed = trimMetadata(
      data.users.find((u) => u.id === r.id)?.user_metadata || {}
    )
    const payload = buildTrimPayload(
      data.users.find((u) => u.id === r.id)?.user_metadata || {}
    )
    const { error: updateError } = await supabase.auth.admin.updateUserById(r.id, {
      user_metadata: payload,
    })
    if (updateError) console.error(`Failed ${r.email}:`, updateError.message)
    else console.log(`Trimmed ${r.email}`)
  }
}
