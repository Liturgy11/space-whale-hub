// Module-level variables persist across client-side navigation in Next.js.
// Used to carry the recovery session tokens from /auth/callback to
// /auth/reset-password without relying on localStorage (which can be
// unavailable or over-quota in webviews).

let _accessToken: string | null = null
let _refreshToken: string | null = null

export function storeRecoveryTokens(accessToken: string, refreshToken: string) {
  _accessToken = accessToken
  _refreshToken = refreshToken
}

export function consumeRecoveryTokens(): { accessToken: string; refreshToken: string } | null {
  if (!_accessToken || !_refreshToken) return null
  const tokens = { accessToken: _accessToken, refreshToken: _refreshToken }
  _accessToken = null
  _refreshToken = null
  return tokens
}
