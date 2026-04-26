import { API_BASE_URL } from '@/lib/api'

type CatalogStats = {
  countries?: number
  operators?: number
  products?: number
}

async function loadStats(): Promise<CatalogStats | null> {
  // TODO(phase 2): switch to a versioned `/v1/public/catalog/stats` endpoint
  // when it exists. For now we attempt `?stats=1` and fall back to
  // hardcoded placeholders if the call fails.
  try {
    const res = await fetch(`${API_BASE_URL}/v1/public/catalog?stats=1`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as CatalogStats
    return json ?? null
  } catch {
    return null
  }
}

export async function StatsStrip() {
  const stats = await loadStats()
  const items = [
    { label: 'Countries', value: stats?.countries ?? '150+' },
    { label: 'Operators & billers', value: stats?.operators ?? '1,200+' },
    { label: 'Products', value: stats?.products ?? '9 categories' },
  ]
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
      {items.map((it) => (
        <div key={it.label} className="bg-background px-6 py-8 text-center">
          <div className="font-mono text-3xl font-semibold tracking-tight text-foreground">
            {it.value}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{it.label}</div>
        </div>
      ))}
    </div>
  )
}
