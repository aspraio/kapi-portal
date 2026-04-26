import type { StoredSession } from './session-client'

/**
 * Any signed-in non-anonymous user gets developer-console access. The
 * Phase 2a backend issues sessions only after a customer application is
 * approved, so cookie presence is sufficient at the UI gate. Sensitive
 * operations are re-checked server-side anyway.
 */
export function hasConsoleAccess(session: StoredSession | null): boolean {
  if (!session) return false
  if (!session.user?.id) return false
  const expires = Date.parse(session.expiresAt)
  if (!Number.isFinite(expires)) return true
  return expires > Date.now()
}
