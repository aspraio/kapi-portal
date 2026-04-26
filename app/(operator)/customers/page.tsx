"use client"

/**
 * Customers list — every kapi customer (one per approved tenant). Filter
 * by status, search by company name. Paginated by cursor.
 */
import * as React from "react"
import Link from "next/link"
import { operatorApi, formatMinor, type KapiCustomerListItem } from "@/lib/operator/api"

export default function CustomersPage() {
  const [items, setItems] = React.useState<KapiCustomerListItem[]>([])
  const [status, setStatus] = React.useState<string>("")
  const [q, setQ] = React.useState<string>("")
  const [cursor, setCursor] = React.useState<string | null>(null)
  const [nextCursor, setNextCursor] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(
    async (reset: boolean) => {
      setLoading(true)
      setError(null)
      try {
        const res = await operatorApi.listCustomers({
          status: status || undefined,
          q: q || undefined,
          cursor: reset ? undefined : cursor ?? undefined,
          limit: 50,
        })
        setItems((prev) => (reset ? res.items : [...prev, ...res.items]))
        setNextCursor(res.nextCursor)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        setLoading(false)
      }
    },
    [status, q, cursor],
  )

  React.useEffect(() => {
    void load(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Customers</h1>
          <p className="text-sm text-neutral-500">All kapi customers across tenants.</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setCursor(null)
              void load(true)
            }
          }}
          placeholder="Search by company name…"
          className="h-9 w-64 rounded-md border border-neutral-300 bg-white px-3 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Wallet</th>
              <th className="px-4 py-3">API clients</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/customers/${c.id}`} className="font-medium text-neutral-900 hover:underline">
                    {c.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{c.country}</td>
                <td className="px-4 py-3">
                  <StatusPill status={c.status} />
                </td>
                <td className="px-4 py-3 text-neutral-700 font-mono text-xs">
                  {c.wallet ? formatMinor(c.wallet.availableMinor, c.wallet.currency) : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{c._count.apiClients}</td>
                <td className="px-4 py-3 text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {nextCursor && (
        <div className="flex justify-center">
          <button
            onClick={() => {
              setCursor(nextCursor)
              void load(false)
            }}
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200"
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>
}
