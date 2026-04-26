"use client"

/**
 * Customer detail — single kapi customer. Shows wallet, ledger entries,
 * API clients, and the actions an operator can take:
 *   - suspend / unsuspend
 *   - adjust wallet (manual credit/debit, double-entry on the backend)
 */
import * as React from "react"
import { useParams } from "next/navigation"
import {
  operatorApi,
  formatMinor,
  type KapiCustomerDetail,
  type KapiWalletEntry,
} from "@/lib/operator/api"

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [customer, setCustomer] = React.useState<KapiCustomerDetail | null>(null)
  const [entries, setEntries] = React.useState<KapiWalletEntry[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [showAdjust, setShowAdjust] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const reload = React.useCallback(async () => {
    if (!id) return
    try {
      const [{ customer }, entriesRes] = await Promise.all([
        operatorApi.getCustomer(id),
        operatorApi.listEntries(id, { limit: 50 }),
      ])
      setCustomer(customer)
      setEntries(entriesRes.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    }
  }, [id])

  React.useEffect(() => {
    void reload()
  }, [reload])

  async function toggleStatus() {
    if (!customer || !id) return
    if (!confirm(`${customer.status === "active" ? "Suspend" : "Reactivate"} ${customer.companyName}?`)) return
    setBusy(true)
    try {
      await operatorApi.patchCustomer(id, {
        status: customer.status === "active" ? "suspended" : "active",
      })
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusy(false)
    }
  }

  if (error) {
    return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
  }
  if (!customer) {
    return <div className="text-sm text-neutral-500">Loading…</div>
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{customer.companyName}</h1>
          <div className="mt-1 text-sm text-neutral-500">
            {customer.country} · {customer.status}
          </div>
          <div className="mt-1 text-xs text-neutral-400 font-mono">tenant: {customer.tenantId}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleStatus}
            disabled={busy}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          >
            {customer.status === "active" ? "Suspend" : "Reactivate"}
          </button>
          <button
            onClick={() => setShowAdjust(true)}
            className="rounded-md bg-neutral-900 text-white px-3 py-1.5 text-sm hover:bg-neutral-800"
          >
            Adjust wallet
          </button>
        </div>
      </header>

      <section className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-neutral-900">Wallet</h2>
        {customer.wallet ? (
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-neutral-500">Available</div>
              <div className="mt-1 font-mono">
                {formatMinor(customer.wallet.availableMinor, customer.wallet.currency)}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Reserved</div>
              <div className="mt-1 font-mono">
                {formatMinor(customer.wallet.reservedMinor, customer.wallet.currency)}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Currency</div>
              <div className="mt-1 font-mono">{customer.wallet.currency}</div>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-neutral-500">No wallet provisioned.</p>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white">
        <header className="border-b border-neutral-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-neutral-900">Ledger entries</h2>
        </header>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Memo</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-3 text-neutral-500">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">{e.kind}</td>
                <td className="px-4 py-3 font-mono">{formatMinor(e.amountMinor, e.currency)}</td>
                <td className="px-4 py-3 text-neutral-600">{e.memo ?? "—"}</td>
                <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{e.reference ?? "—"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">
                  No ledger entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white">
        <header className="border-b border-neutral-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-neutral-900">API clients</h2>
        </header>
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Client ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Rate (rps)</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customer.apiClients.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.clientId}</td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3">{c.rateLimitRps}</td>
                <td className="px-4 py-3 text-neutral-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {customer.apiClients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">
                  No API clients.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {showAdjust && customer.wallet && (
        <AdjustWalletDialog
          customerId={customer.id}
          currency={customer.wallet.currency}
          onClose={() => setShowAdjust(false)}
          onDone={async () => {
            setShowAdjust(false)
            await reload()
          }}
        />
      )}
    </div>
  )
}

function AdjustWalletDialog({
  customerId,
  currency,
  onClose,
  onDone,
}: {
  customerId: string
  currency: string
  onClose: () => void
  onDone: () => void
}) {
  const [direction, setDirection] = React.useState<"credit" | "debit">("credit")
  const [amount, setAmount] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [reference, setReference] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!amount || Number(amount) <= 0) {
      setError("Amount must be positive.")
      return
    }
    if (reason.trim().length < 3) {
      setError("Reason is required (min 3 chars).")
      return
    }
    setSubmitting(true)
    try {
      const [maj, sub = ""] = amount.split(".")
      const minor = BigInt(maj) * 100n + BigInt((sub + "00").slice(0, 2) || "0")
      const signed = direction === "credit" ? minor : -minor
      await operatorApi.adjustWallet(customerId, {
        amountMinor: signed.toString(),
        currency,
        reason,
        reference: reference || undefined,
      })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adjustment failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
      >
        <h3 className="text-base font-semibold text-neutral-900">Adjust wallet</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Writes a double-entry pair (customer + suspense) and an audit log row.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-700">Direction</label>
            <div className="mt-1 inline-flex rounded-md border border-neutral-300">
              {(["credit", "debit"] as const).map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`px-3 py-1.5 text-sm ${
                    direction === d ? "bg-neutral-900 text-white" : "text-neutral-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700">Amount ({currency})</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              className="mt-1 h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Goodwill credit / billing correction / write-off / …"
              className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-700">Reference (optional)</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="ticket #, invoice #, …"
              className="mt-1 h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800">{error}</div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-neutral-900 text-white px-3 py-1.5 text-sm hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  )
}
