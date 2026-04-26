import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { QueryProvider } from '@/lib/query-client'
import { SessionProvider } from '@/lib/session-context'
import { Toaster } from '@/components/ui/sonner'
import { ConsoleSidebar } from '@/components/console/sidebar'
import type { StoredSession } from '@/lib/session-client'

async function readServerSession(): Promise<StoredSession | null> {
  const c = await cookies()
  const raw = c.get('aspra_session')?.value
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as StoredSession
  } catch {
    return null
  }
}

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await readServerSession()
  if (!session?.user?.id) redirect('/sign-in')

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <SessionProvider initial={session}>
        <QueryProvider>
          <div className="flex min-h-screen">
            <ConsoleSidebar />
            <div className="flex min-w-0 flex-1 flex-col">{children}</div>
          </div>
          <Toaster />
        </QueryProvider>
      </SessionProvider>
    </div>
  )
}
