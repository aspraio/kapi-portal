/**
 * Layout for the kapi operator console — internal Aspra-only surface for
 * managing kapi customers, their wallets, and the public-API provider
 * catalog.
 *
 * Server-side fail-closed: read the `aspra_session` cookie, verify the
 * caller is super_admin (or `is_platform_super`), redirect otherwise.
 * No 403 page — we just bounce to /sign-in to keep the surface invisible
 * to non-authorized users.
 *
 * Lives in its own route group `(operator)` so it cannot collide with the
 * parallel `(console)` (customer-facing) work.
 */
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { OperatorShell } from "@/components/operator/operator-shell"
import {
  parseSessionCookieValue,
  isPlatformSuperFromSession,
} from "@/lib/operator/use-operator-role"

export default async function OperatorLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies()
  const raw = jar.get("aspra_session")?.value
  const session = parseSessionCookieValue(raw)

  if (!session || !isPlatformSuperFromSession(session)) {
    redirect("/sign-in?next=/dashboard")
  }

  return <OperatorShell session={session}>{children}</OperatorShell>
}
