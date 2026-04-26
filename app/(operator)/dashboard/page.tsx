"use client"

/**
 * Operator dashboard — first surface after sign-in for super-admins. Shows
 * a small set of presence flags from the kapi super-admin endpoints.
 * Real platform metrics live in aspra-admin portal.
 */
import * as React from "react"
import Link from "next/link"
import { operatorApi } from "@/lib/operator/api"

export default function OperatorDashboardPage() {
  const [counts, setCounts] = React.useState({
    active: 0,
    suspended: 0,
    products: 0,
    inactiveProducts: 0,
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [active, suspended, productsActive, productsAll] = await Promise.all([
          operatorApi.listCustomers({ status: "active", limit: 1 }),
          operatorApi.listCustomers({ status: "suspended", limit: 1 }),
          operatorApi.listProviderProducts({ active: true, limit: 1 }),
          operatorApi.listProviderProducts({ limit: 1 }),
        ])
        if (cancelled) return
        setCounts({
          active: active.items.length,
          suspended: suspended.items.length,
          products: productsActive.items.length,
          inactiveProducts: Math.max(0, productsAll.items.length - productsActive.items.length),
        })
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Operator dashboard</h1>
        <p className="text-sm text-neutral-500">Snapshot of kapi customers and catalog state.</p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Active customers" value={loading ? "…" : counts.active} />
        <Stat label="Suspended" value={loading ? "…" : counts.suspended} />
        <Stat label="Active products" value={loading ? "…" : counts.products} />
        <Stat label="Inactive products" value={loading ? "…" : counts.inactiveProducts} />
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-neutral-900">Quick actions</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link className="text-neutral-900 underline" href="/customers">
              Manage customers →
            </Link>
          </li>
          <li>
            <Link className="text-neutral-900 underline" href="/provider-products">
              Manage provider products →
            </Link>
          </li>
        </ul>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-neutral-900">{value}</div>
    </div>
  )
}
