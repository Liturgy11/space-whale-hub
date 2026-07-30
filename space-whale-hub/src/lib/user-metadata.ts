/** Small fields only — keeps auth sessions under localStorage quota. */
export const ALLOWED_USER_METADATA_KEYS = [
  'display_name',
  'pronouns',
  'country',
  'avatar_url',
  'email_opt_in',
] as const

export type AllowedUserMetadataKey = (typeof ALLOWED_USER_METADATA_KEYS)[number]

export type TrimmedUserMetadata = Partial<
  Record<AllowedUserMetadataKey, string | boolean | null>
>

const MAX_STRING_LENGTH = 2048

function isAllowedKey(key: string): key is AllowedUserMetadataKey {
  return (ALLOWED_USER_METADATA_KEYS as readonly string[]).includes(key)
}

/** Strip unknown/large values from auth user_metadata. */
export function trimUserMetadata(
  metadata: Record<string, unknown> | null | undefined
): TrimmedUserMetadata {
  if (!metadata || typeof metadata !== 'object') return {}

  const trimmed: TrimmedUserMetadata = {}

  for (const key of ALLOWED_USER_METADATA_KEYS) {
    const value = metadata[key]
    if (value === undefined || value === null) continue

    if (key === 'email_opt_in') {
      trimmed.email_opt_in = Boolean(value)
      continue
    }

    if (typeof value === 'string' && value.length <= MAX_STRING_LENGTH) {
      trimmed[key] = value
    }
  }

  return trimmed
}

/** Build update payload that nulls removed keys (Supabase merges metadata). */
export function buildTrimMetadataPayload(
  metadata: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const trimmed = trimUserMetadata(metadata)
  const payload: Record<string, unknown> = { ...trimmed }

  if (metadata && typeof metadata === 'object') {
    for (const key of Object.keys(metadata)) {
      if (!(key in trimmed)) payload[key] = null
    }
  }

  return payload
}

export function metadataByteSize(metadata: Record<string, unknown> | null | undefined): number {
  if (!metadata) return 0
  return new Blob([JSON.stringify(metadata)]).size
}

export function sessionPayloadSize(metadata: Record<string, unknown> | null | undefined): {
  bytes: number
  mb: string
} {
  const bytes = metadataByteSize(metadata)
  return { bytes, mb: (bytes / (1024 * 1024)).toFixed(2) }
}
