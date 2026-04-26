'use client'

/**
 * React-query hooks for the developer console — API clients, webhooks, usage.
 * Backed by `/v1/admin/api-clients/*` endpoints (Phase 2a).
 *
 * Adapted from aspra-admin-portal/hooks/use-api-clients.ts; the kapi portal
 * does not run in demo mode (we always hit the live backend with a session
 * token), and there is no admin-side tenant override — the JWT already
 * scopes the caller to their KapiCustomer.
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export type ApiClientStatus = 'active' | 'revoked' | 'rotating' | 'paused'
export type ApiClientTier = 'internal' | 'partner' | 'public'

export type ApiClient = {
  id: string
  name: string
  clientId: string
  scopes: string[]
  tier?: ApiClientTier
  status: ApiClientStatus
  createdAt: string
  lastUsedAt: string | null
  ownerEmail?: string | null
  webhookUrl?: string | null
  rateLimitRps?: number
}

export type CreateApiClientInput = {
  name: string
  scopes: string[]
  tier: ApiClientTier
  ownerEmail?: string
  webhookUrl?: string
}

export type CreateApiClientResult = { client: ApiClient; secret: string }
export type RotateApiClientResult = { client: ApiClient; secret: string }

export type WebhookDelivery = {
  id: string
  apiClientId: string
  eventType: string
  url: string
  status: 'pending' | 'delivered' | 'failed' | 'exhausted'
  attempts: number
  lastError: string | null
  nextAttemptAt: string | null
  lastStatusCode?: number | null
  createdAt: string
}

export type ApiClientUsagePoint = {
  bucket: string
  requests: number
  errors: number
  p50Ms: number
  p95Ms: number
}

export type ApiClientUsage = {
  clientId: string
  range: '1h' | '24h' | '7d'
  points: ApiClientUsagePoint[]
  totals: { requests: number; errors: number; errorRate: number }
}

export const devQk = {
  all: ['api-clients'] as const,
  list: () => ['api-clients', 'list'] as const,
  one: (id: string) => ['api-clients', id] as const,
  usage: (id: string, range: ApiClientUsage['range']) =>
    ['api-clients', id, 'usage', range] as const,
  webhookDeliveries: (id: string) =>
    ['api-clients', id, 'webhooks'] as const,
}

export function useApiClients() {
  return useQuery({
    queryKey: devQk.list(),
    queryFn: async () => {
      const res = await apiFetch<{ items: ApiClient[] }>('/v1/admin/api-clients')
      return res.items
    },
  })
}

export function useCreateApiClient(
  opts?: UseMutationOptions<CreateApiClientResult, Error, CreateApiClientInput>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input) =>
      apiFetch<CreateApiClientResult>('/v1/admin/api-clients', {
        method: 'POST',
        body: input as unknown as Record<string, unknown>,
      }),
    ...opts,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: devQk.list() })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(opts?.onSuccess as any)?.(...args)
    },
  })
}

export function useRotateApiClient(
  opts?: UseMutationOptions<RotateApiClientResult, Error, { id: string }>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }) =>
      apiFetch<RotateApiClientResult>(`/v1/admin/api-clients/${id}/rotate`, {
        method: 'POST',
      }),
    ...opts,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: devQk.list() })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(opts?.onSuccess as any)?.(...args)
    },
  })
}

export function useRevokeApiClient(
  opts?: UseMutationOptions<ApiClient, Error, { id: string }>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }) =>
      apiFetch<ApiClient>(`/v1/admin/api-clients/${id}/revoke`, { method: 'POST' }),
    ...opts,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: devQk.list() })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(opts?.onSuccess as any)?.(...args)
    },
  })
}

export function useUpdateApiClient(
  opts?: UseMutationOptions<
    ApiClient,
    Error,
    { id: string; patch: Partial<CreateApiClientInput & { status: ApiClientStatus }> }
  >,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }) =>
      apiFetch<ApiClient>(`/v1/admin/api-clients/${id}`, {
        method: 'PATCH',
        body: patch as unknown as Record<string, unknown>,
      }),
    ...opts,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: devQk.list() })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(opts?.onSuccess as any)?.(...args)
    },
  })
}

export function useApiClientUsage(
  clientId: string | null,
  range: ApiClientUsage['range'] = '24h',
) {
  return useQuery({
    queryKey: devQk.usage(clientId ?? '_none', range),
    enabled: !!clientId,
    queryFn: async () => {
      if (!clientId) throw new Error('clientId required')
      return apiFetch<ApiClientUsage>(
        `/v1/admin/api-clients/${clientId}/usage`,
        { query: { range } },
      )
    },
  })
}

export function useWebhookDeliveries(clientId: string | null) {
  return useQuery({
    queryKey: devQk.webhookDeliveries(clientId ?? '_none'),
    enabled: !!clientId,
    queryFn: async () => {
      if (!clientId) throw new Error('clientId required')
      const res = await apiFetch<{ items: WebhookDelivery[] }>(
        `/v1/admin/api-clients/${clientId}/webhook-deliveries`,
      )
      return res.items
    },
  })
}

export function useRetryWebhookDelivery(
  opts?: UseMutationOptions<
    WebhookDelivery,
    Error,
    { clientId: string; deliveryId: string }
  >,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ clientId, deliveryId }) =>
      apiFetch<WebhookDelivery>(
        `/v1/admin/api-clients/${clientId}/webhook-deliveries/${deliveryId}/retry`,
        { method: 'POST' },
      ),
    ...opts,
    onSuccess: (...args) => {
      const vars = args[1] as { clientId: string }
      qc.invalidateQueries({ queryKey: devQk.webhookDeliveries(vars.clientId) })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(opts?.onSuccess as any)?.(...args)
    },
  })
}

export type ApiClientLogRow = {
  id: string
  apiClientId: string
  endpoint: string
  method: string
  statusCode: number
  latencyMs: number
  createdAt: string
}

export function useApiClientLogs(clientId: string | null, limit = 100) {
  return useQuery({
    queryKey: ['api-clients', clientId ?? '_none', 'logs', limit],
    enabled: !!clientId,
    queryFn: async () => {
      if (!clientId) throw new Error('clientId required')
      const res = await apiFetch<{ items: ApiClientLogRow[] }>(
        `/v1/admin/api-clients/${clientId}/logs`,
        { query: { limit } },
      )
      return res.items
    },
  })
}
