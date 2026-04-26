"use client"

/**
 * Provider products — the public-API catalog. Operators can create, edit
 * (toggle active, rename), and soft-delete (deactivate) products.
 */
import * as React from "react"
import { operatorApi, formatMinor, type ProviderProduct } from "@/lib/operator/api"

type FormState = {
  providerCode: string
  prodCode: string
  countryIso: string
  operatorCode: string
  displayName: string
  category: string
  currency: string
  minAmountMinor: string
  maxAmountMinor: string
  active: boolean
}

const EMPTY_FORM: FormState = {
  providerCode: "",
  prodCode: "",
  countryIso: "",
  operatorCode: "",
  displayName: "",
  category: "",
  currency: "USD",
  minAmountMinor: "",
  maxAmountMinor: "",
  active: true,
}

export default function ProviderProductsPage() {
  const [items, setItems] = React.useState<ProviderProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<ProviderProduct | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [filterActive, setFilterActive] = React.useState<string>("")

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await operatorApi.listProviderProducts({
        active: filterActive === "" ? undefined : filterActive === "true",
        limit: 200,
      })
      setItems(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [filterActive])

  React.useEffect(() => {
    void load()
  }, [load])

  async function deactivate(p: ProviderProduct) {
    if (!confirm(`Deactivate "${p.displayName}"? Historical records keep the prod_code reference.`)) return
    try {
      await operatorApi.deleteProviderProduct(p.id)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed")
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Provider products</h1>
          <p className="text-sm text-neutral-500">
            The public-API catalog. Soft-delete only — historical iPos transactions reference prod_code.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-neutral-900 text-white px-3 py-1.5 text-sm hover:bg-neutral-800"
        >
          New product
        </button>
      </header>

      <div className="flex items-center gap-3">
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Prod code</th>
              <th className="px-4 py-3">Display</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Range</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs">{p.providerCode}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.prodCode}</td>
                <td className="px-4 py-3">{p.displayName}</td>
                <td className="px-4 py-3 text-neutral-600">{p.category}</td>
                <td className="px-4 py-3 text-neutral-600">{p.countryIso ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {formatMinor(p.minAmountMinor, p.currency)} – {formatMinor(p.maxAmountMinor, p.currency)}
                </td>
                <td className="px-4 py-3">{p.active ? "✓" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(p)} className="text-xs text-neutral-700 hover:underline">
                    Edit
                  </button>{" "}
                  {p.active && (
                    <button
                      onClick={() => deactivate(p)}
                      className="ml-3 text-xs text-red-700 hover:underline"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-neutral-500">
                  No provider products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductFormDialog
          initial={editing}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onDone={async () => {
            setCreating(false)
            setEditing(null)
            await load()
          }}
        />
      )}
    </div>
  )
}

function ProductFormDialog({
  initial,
  onClose,
  onDone,
}: {
  initial: ProviderProduct | null
  onClose: () => void
  onDone: () => void
}) {
  const [form, setForm] = React.useState<FormState>(
    initial
      ? {
          providerCode: initial.providerCode,
          prodCode: initial.prodCode,
          countryIso: initial.countryIso ?? "",
          operatorCode: initial.operatorCode ?? "",
          displayName: initial.displayName,
          category: initial.category,
          currency: initial.currency ?? "USD",
          minAmountMinor: initial.minAmountMinor ?? "",
          maxAmountMinor: initial.maxAmountMinor ?? "",
          active: initial.active,
        }
      : EMPTY_FORM,
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const body: Record<string, unknown> = {
      displayName: form.displayName,
      category: form.category,
      currency: form.currency,
      countryIso: form.countryIso || undefined,
      operatorCode: form.operatorCode || undefined,
      minAmountMinor: form.minAmountMinor || undefined,
      maxAmountMinor: form.maxAmountMinor || undefined,
      active: form.active,
    }
    if (!initial) {
      body.providerCode = form.providerCode
      body.prodCode = form.prodCode
    }
    try {
      if (initial) {
        await operatorApi.patchProviderProduct(initial.id, body as Partial<ProviderProduct>)
      } else {
        await operatorApi.createProviderProduct(body as Partial<ProviderProduct>)
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
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
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg"
      >
        <h3 className="text-base font-semibold text-neutral-900">
          {initial ? "Edit provider product" : "New provider product"}
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Field label="Provider code" disabled={!!initial}>
            <input
              value={form.providerCode}
              onChange={(e) => field("providerCode", e.target.value)}
              disabled={!!initial}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 disabled:bg-neutral-50"
            />
          </Field>
          <Field label="Prod code" disabled={!!initial}>
            <input
              value={form.prodCode}
              onChange={(e) => field("prodCode", e.target.value)}
              disabled={!!initial}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 disabled:bg-neutral-50"
            />
          </Field>
          <Field label="Display name">
            <input
              value={form.displayName}
              onChange={(e) => field("displayName", e.target.value)}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3"
            />
          </Field>
          <Field label="Category">
            <input
              value={form.category}
              onChange={(e) => field("category", e.target.value)}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3"
            />
          </Field>
          <Field label="Country (ISO-2)">
            <input
              value={form.countryIso}
              onChange={(e) => field("countryIso", e.target.value.toUpperCase())}
              maxLength={2}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3"
            />
          </Field>
          <Field label="Operator code">
            <input
              value={form.operatorCode}
              onChange={(e) => field("operatorCode", e.target.value)}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3"
            />
          </Field>
          <Field label="Currency">
            <input
              value={form.currency}
              onChange={(e) => field("currency", e.target.value.toUpperCase())}
              maxLength={3}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3"
            />
          </Field>
          <Field label="Active">
            <select
              value={form.active ? "true" : "false"}
              onChange={(e) => field("active", e.target.value === "true")}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </Field>
          <Field label="Min amount (minor)">
            <input
              value={form.minAmountMinor}
              onChange={(e) => field("minAmountMinor", e.target.value)}
              inputMode="numeric"
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3"
            />
          </Field>
          <Field label="Max amount (minor)">
            <input
              value={form.maxAmountMinor}
              onChange={(e) => field("maxAmountMinor", e.target.value)}
              inputMode="numeric"
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3"
            />
          </Field>
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
            {submitting ? "Saving…" : initial ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  disabled,
  children,
}: {
  label: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={`text-xs font-medium ${disabled ? "text-neutral-400" : "text-neutral-700"}`}>{label}</span>
      {children}
    </label>
  )
}
