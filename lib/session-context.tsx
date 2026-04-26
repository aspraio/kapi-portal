'use client'

import * as React from 'react'
import { readSessionCookie, type StoredSession } from './session-client'

type Ctx = {
  session: StoredSession | null
  refresh: () => void
  signOut: () => void
}

const SessionContext = React.createContext<Ctx | null>(null)

export function SessionProvider({
  initial,
  children,
}: {
  initial?: StoredSession | null
  children: React.ReactNode
}) {
  const [session, setSession] = React.useState<StoredSession | null>(initial ?? null)

  React.useEffect(() => {
    setSession(readSessionCookie())
  }, [])

  const refresh = React.useCallback(() => setSession(readSessionCookie()), [])

  const signOut = React.useCallback(() => {
    if (typeof document !== 'undefined') {
      document.cookie = 'aspra_session=; Path=/; Max-Age=0; SameSite=Lax'
    }
    setSession(null)
  }, [])

  return (
    <SessionContext.Provider value={{ session, refresh, signOut }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = React.useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
