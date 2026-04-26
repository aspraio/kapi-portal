/**
 * Thin fetch wrapper for the Aspra public API. Mirrors the pattern in
 * `aspra-admin-portal/lib/api.ts` but without tenant scoping or session
 * caching — kapi-portal is a marketing surface that mostly hits unauth
 * public endpoints.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'https://api.aspra.io'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type FetchOpts = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null
  query?: Record<string, string | number | boolean | null | undefined>
  bearerToken?: string | null
}

function buildUrl(path: string, query?: FetchOpts['query']) {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === null || v === undefined || v === '') continue
      url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: FetchOpts = {},
): Promise<T> {
  const { body, query, bearerToken, headers: extraHeaders, ...rest } = opts

  const headers = new Headers(extraHeaders)
  headers.set('Accept', 'application/json')
  if (bearerToken) headers.set('Authorization', `Bearer ${bearerToken}`)

  let payload: BodyInit | undefined
  if (body !== undefined && body !== null) {
    if (body instanceof FormData || typeof body === 'string') {
      payload = body
    } else {
      payload = JSON.stringify(body)
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    }
  }

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers,
    body: payload,
    cache: rest.cache ?? 'no-store',
  })

  if (!res.ok) {
    let errPayload: unknown = undefined
    try {
      errPayload = await res.json()
    } catch {
      /* ignore */
    }
    const msg =
      (errPayload && typeof errPayload === 'object' && 'message' in errPayload
        ? String((errPayload as { message: unknown }).message)
        : null) ?? `${rest.method ?? 'GET'} ${path} failed (${res.status})`
    throw new ApiError(res.status, msg, errPayload)
  }

  if (res.status === 204) return undefined as unknown as T
  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) return (await res.json()) as T
  return (await res.text()) as unknown as T
}
