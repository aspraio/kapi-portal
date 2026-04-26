import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { API_BASE_URL } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = { title: 'Status — kapi' }

async function probe(): Promise<{ ok: boolean; ms: number | null }> {
  const start = Date.now()
  try {
    const res = await fetch(`${API_BASE_URL}/v1/public/openapi.json`, {
      next: { revalidate: 30 },
    })
    return { ok: res.ok, ms: Date.now() - start }
  } catch {
    return { ok: false, ms: null }
  }
}

export default async function StatusPage() {
  const status = await probe()
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">System status</h1>
      <p className="mt-4 text-muted-foreground">
        Live probe of the public API. A real status page with per-component history
        ships in a later phase.
      </p>

      <Card className="mt-10">
        <CardContent className="flex items-center gap-4 py-6">
          {status.ok ? (
            <>
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <div className="font-semibold">Public API operational</div>
                <div className="text-sm text-muted-foreground">
                  OpenAPI spec served in {status.ms ?? '—'} ms.
                </div>
              </div>
            </>
          ) : (
            <>
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </span>
              <div>
                <div className="font-semibold">Public API unreachable</div>
                <div className="text-sm text-muted-foreground">
                  We couldn&apos;t reach {API_BASE_URL}. Try again in a moment.
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        Probed endpoint: <code className="font-mono">{API_BASE_URL}/v1/public/openapi.json</code>
      </p>
    </div>
  )
}
