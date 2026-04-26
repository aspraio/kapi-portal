/**
 * Minimal session cookie helpers — kept compatible with the cookie shape used
 * by `aspra-admin-portal` so a session set here is recognised there too.
 * See `aspra-admin-portal/lib/session-client.tsx` for the canonical version.
 */

const SESSION_COOKIE = 'aspra_session'

export type StoredSession = {
  user: { id: string; name: string; email: string; role: string }
  accessToken: string
  permissions: string[]
  expiresAt: string
}

export function writeSessionCookie(session: StoredSession) {
  if (typeof document === 'undefined') return
  const value = encodeURIComponent(JSON.stringify(session))
  const expires = new Date(session.expiresAt).toUTCString()
  const isHttps = window.location.protocol === 'https:'
  const sameSite = isHttps ? 'None; Secure' : 'Lax'
  document.cookie = `${SESSION_COOKIE}=${value}; Path=/; Expires=${expires}; SameSite=${sameSite}`
}

export function readSessionCookie(): StoredSession | null {
  if (typeof document === 'undefined') return null
  const raw = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw.slice(SESSION_COOKIE.length + 1))) as StoredSession
  } catch {
    return null
  }
}
