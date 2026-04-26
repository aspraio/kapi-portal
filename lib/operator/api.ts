/**
 * Operator-console fetch helpers. Thin wrappers around `apiFetch` from
 * `lib/api.ts` that pre-target the super-admin `/v1/kapi/*` endpoints
 * shipped in aspra-api `feat/operator-endpoints`.
 *
 * Kept in `lib/operator/*` to avoid colliding with the parallel
 * `(console)` work that may add its own `lib/api-*` helpers.
 *
 * Money values are returned as strings on the wire (BigInt -> string in
 * the API response); we keep them as strings here too — convert at the
 * formatter boundary, never in transport.
 */
import { apiFetch } from "@/lib/api"

/**
 * Aspra list endpoints all return this envelope. Defined locally so we
 * don't depend on a shared type that may or may not exist in `lib/api`
 * across the parallel work streams.
 */
type Paginated<T> = {
  items: T[]
  nextCursor: string | null
  total?: number
}

export type KapiCustomerListItem = {
  id: string
  tenantId: string
  companyName: string
  country: string
  status: "active" | "suspended"
  createdAt: string
  updatedAt: string
  wallet: KapiWalletSummary | null
  _count: { apiClients: number }
}

export type KapiWalletSummary = {
  id: string
  customerId: string
  currency: string
  availableMinor: string
  reservedMinor: string
  createdAt: string
  updatedAt: string
}

export type KapiCustomerDetail = KapiCustomerListItem & {
  apiClients: Array<{
    id: string
    name: string
    clientId: string
    status: string
    scopes: string[]
    rateLimitRps: number
    createdAt: string
    revokedAt: string | null
  }>
}

export type KapiWalletEntry = {
  id: string
  walletId: string
  kind: string
  amountMinor: string
  currency: string
  reference: string | null
  memo: string | null
  createdAt: string
}

export type ProviderProduct = {
  id: string
  providerCode: string
  prodCode: string
  countryIso: string | null
  operatorCode: string | null
  displayName: string
  category: string
  currency: string | null
  minAmountMinor: string | null
  maxAmountMinor: string | null
  fixedValuesMinor: string[]
  active: boolean
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export const operatorApi = {
  listCustomers(params: { status?: string; q?: string; cursor?: string; limit?: number } = {}) {
    return apiFetch<Paginated<KapiCustomerListItem>>("/v1/kapi/customers", {
      query: { ...params },
    })
  },
  getCustomer(id: string) {
    return apiFetch<{ customer: KapiCustomerDetail }>(`/v1/kapi/customers/${id}`)
  },
  patchCustomer(id: string, body: { status?: "active" | "suspended"; companyName?: string }) {
    return apiFetch<{ customer: KapiCustomerDetail }>(`/v1/kapi/customers/${id}`, {
      method: "PATCH",
      body,
    })
  },
  adjustWallet(
    id: string,
    body: { amountMinor: string; currency: string; reason: string; reference?: string },
  ) {
    return apiFetch<{ wallet: KapiWalletSummary; entries: { customerEntryId: string; suspenseEntryId: string } }>(
      `/v1/kapi/customers/${id}/wallet/adjust`,
      { method: "POST", body },
    )
  },
  listEntries(id: string, params: { cursor?: string; limit?: number } = {}) {
    return apiFetch<Paginated<KapiWalletEntry>>(`/v1/kapi/customers/${id}/wallet/entries`, {
      query: { ...params },
    })
  },
  listProviderProducts(
    params: {
      providerCode?: string
      category?: string
      countryIso?: string
      active?: boolean
      cursor?: string
      limit?: number
    } = {},
  ) {
    return apiFetch<Paginated<ProviderProduct>>("/v1/kapi/provider-products", {
      query: { ...params },
    })
  },
  createProviderProduct(body: Partial<ProviderProduct>) {
    return apiFetch<{ product: ProviderProduct }>("/v1/kapi/provider-products", {
      method: "POST",
      body: body as Record<string, unknown>,
    })
  },
  patchProviderProduct(id: string, body: Partial<ProviderProduct>) {
    return apiFetch<{ product: ProviderProduct }>(`/v1/kapi/provider-products/${id}`, {
      method: "PATCH",
      body: body as Record<string, unknown>,
    })
  },
  deleteProviderProduct(id: string) {
    return apiFetch<{ product: ProviderProduct }>(`/v1/kapi/provider-products/${id}`, {
      method: "DELETE",
    })
  },
}

/** Format minor units to a human display string (no FX, no rounding). */
export function formatMinor(minor: string | null | undefined, currency: string | null | undefined) {
  if (minor === null || minor === undefined) return "—"
  const n = BigInt(minor)
  const negative = n < 0n
  const abs = negative ? -n : n
  const major = abs / 100n
  const sub = (abs % 100n).toString().padStart(2, "0")
  return `${negative ? "-" : ""}${major.toString()}.${sub} ${currency ?? ""}`.trim()
}
