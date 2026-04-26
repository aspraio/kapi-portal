"use client"

/**
 * OperatorShell — sidebar + topbar chrome for the (operator) route group.
 * Self-contained: doesn't reuse the marketing TopNav or any sidebar
 * primitives that the parallel `(console)` work might add. Plain Tailwind,
 * no shadcn `sidebar` primitive (kept dependency-free intentionally so
 * 2b's new packages don't break our build).
 */
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Boxes, LayoutDashboard, LogOut } from "lucide-react"

type Session = {
  user: { name: string; email: string; role: string; is_platform_super?: boolean }
}

type NavLink = { href: string; label: string; icon: React.ComponentType<{ className?: string }> }

const NAV: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/provider-products", label: "Provider Products", icon: Boxes },
]

function signOut() {
  if (typeof document === "undefined") return
  document.cookie = "aspra_session=; Path=/; Max-Age=0; SameSite=Lax"
  window.location.href = "/sign-in"
}

export function OperatorShell({
  session,
  children,
}: {
  session: Session
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="flex w-60 flex-col border-r border-neutral-200 bg-white">
        <div className="px-6 py-5 border-b border-neutral-200">
          <div className="text-sm font-semibold text-neutral-900">kapi · operator</div>
          <div className="text-xs text-neutral-500 mt-0.5">internal · super-admin</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-neutral-200 p-3">
          <div className="px-3 py-2 text-xs text-neutral-500">
            <div className="text-neutral-900 font-medium truncate">{session.user.name || session.user.email}</div>
            <div className="truncate">{session.user.email}</div>
          </div>
          <button
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
