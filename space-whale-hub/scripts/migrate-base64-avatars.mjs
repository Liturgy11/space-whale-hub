#!/usr/bin/env node
/**
 * Migrate base64 avatar_url values in profiles to Supabase Storage URLs.
 * Usage: node scripts/migrate-base64-avatars.mjs [--dry-run]
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

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

loadEnvLocal()

const dryRun = process.argv.includes('--dry-run')
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: profiles, error } = await supabase
  .from('profiles')
  .select('id, display_name, avatar_url')
  .not('avatar_url', 'is', null)

if (error) {
  console.error('Failed to load profiles:', error.message)
  process.exit(1)
}

const base64Profiles = (profiles || []).filter(
  (p) => typeof p.avatar_url === 'string' && p.avatar_url.startsWith('data:')
)

console.log(`Found ${base64Profiles.length} profile(s) with base64 avatars`)

for (const profile of base64Profiles) {
  const match = profile.avatar_url.match(/^data:(image\/[\w+.-]+);base64,(.+)$/s)
  if (!match) {
    console.warn(`Skip ${profile.display_name || profile.id}: unrecognised data URL`)
    continue
  }

  const mime = match[1]
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg'
  const buffer = Buffer.from(match[2], 'base64')
  const path = `${profile.id}/${profile.id}-avatar.${ext}`

  console.log(
    `${profile.display_name || profile.id}: ${(buffer.length / 1024).toFixed(1)} KB → avatars/${path}`
  )

  if (dryRun) continue

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, buffer, { upsert: true, contentType: mime, cacheControl: '3600' })

  if (uploadError) {
    console.error(`  Upload failed:`, uploadError.message)
    continue
  }

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
  const publicUrl = urlData.publicUrl

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', profile.id)

  if (profileError) {
    console.error(`  Profile update failed:`, profileError.message)
    continue
  }

  const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
  const existingMeta = userData?.user?.user_metadata || {}

  await supabase.auth.admin.updateUserById(profile.id, {
    user_metadata: {
      ...existingMeta,
      avatar_url: publicUrl,
      display_name: existingMeta.display_name || profile.display_name || null,
    },
  })

  console.log(`  ✓ Migrated to ${publicUrl}`)
}

console.log(dryRun ? '\nDry run — no changes written.' : '\nDone.')
