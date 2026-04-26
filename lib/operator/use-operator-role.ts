"use client"

/**
 * useOperatorRole — operator-console-specific role helper.
 *
 * Mirrors `aspra-admin-portal/lib/use-view-role.ts` but lives under
 * `lib/operator/*` to avoid colliding with files the parallel
 * `(console)` work may add. Reads the `aspra_session` cookie set by the
 * shared sign-in flow; treats EITHER `role === "super_admin"` OR
 * `is_platform_super === true` as authorised for the `(operator)` group.
 *
 * The `is_platform_super` claim is the JWT/session source of truth set by
 * aspra-api when the principal's `super` flag is true. We accept both so
 * super-admins onboarded via either path keep working.
 */
import * as React from "react"

type StoredSessionUser = {
  id: string
  name: string
  email: string
  role: string
  is_platform_super?: boolean
}

type StoredSession = {
  user: StoredSessionUser
  accessToken: string
  permissions: string[]
  expiresAt: string
}

const SESSION_COOKIE = "aspra_session"

function readCookieSession(): StoredSession | null {
  if (typeof document === "undefined") return null
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw.slice(SESSION_COOKIE.length + 1))) as StoredSession
  } catch {
    return null
  }
}

export type OperatorRoleContext = {
  session: StoredSession | null
  isSuperAdmin: boolean
  permissions: string[]
  can: (...required: string[]) => boolean
}

export function useOperatorRole(): OperatorRoleContext {
  const [session, setSession] = React.useState<StoredSession | null>(null)

  React.useEffect(() => {
    setSession(readCookieSession())
  }, [])

  const permissions = session?.permissions ?? []
  const isSuperAdmin =
    session?.user.role === "super_admin" || session?.user.is_platform_super === true

  const can = React.useCallback(
    (...required: string[]) => required.every((r) => permissions.includes(r)),
    [permissions],
  )

  return { session, isSuperAdmin, permissions, can }
}

/**
 * Server-side helper: parse the cookie shape from a raw cookie header value.
 * Used by the `(operator)/layout.tsx` to fail-closed before any operator
 * page renders. Mirrors the JWT-side `super` claim — server callers can
 * use either source.
 */
export function parseSessionCookieValue(cookieValue: string | undefined): StoredSession | null {
  if (!cookieValue) return null
  try {
    return JSON.parse(decodeURIComponent(cookieValue)) as StoredSession
  } catch {
    return null
  }
}

export function isPlatformSuperFromSession(s: StoredSession | null): boolean {
  if (!s) return false
  return s.user.role === "super_admin" || s.user.is_platform_super === true
}
