'use client'

import * as React from 'react'
import { Loader2, Search } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ConsoleTopbar } from '@/components/console/topbar'
import { useCatalog } from '@/hooks/use-catalog'

const CATEGORIES = [
  'mobile_topup',
  'mobile_data',
  'utility',
  'gift_card',
  'esim',
  'remittance',
  'wallet',
] as const

export default function CatalogPage() {
  const [search, setSearch] = React.useState('')
  const [country, setCountry] = React.useState('')
  const [selectedCats, setSelectedCats] = React.useState<string[]>([])

  const debounced = useDebounced(search, 300)
  const debouncedCountry = useDebounced(country, 300)

  const { data: products = [], isLoading, error } = useCatalog({
    search: debounced || undefined,
    country: debouncedCountry || undefined,
    category: selectedCats.length ? selectedCats : undefined,
  })

  function toggleCat(c: string, checked: boolean) {
    setSelectedCats((prev) =>
      checked ? Array.from(new Set([...prev, c])) : prev.filter((x) => x !== c),
    )
  }

  return (
    <>
      <ConsoleTopbar title="Catalog" />
      <main className="flex flex-1 gap-6 p-6">
        <aside className="w-60 shrink-0">
          <Card>
            <CardContent className="flex flex-col gap-5 p-5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Operator, product…"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Country (ISO-2)</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="US, NG, IN…"
                  maxLength={2}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-xs">Category</Label>
                {CATEGORIES.map((c) => {
                  const checked = selectedCats.includes(c)
                  return (
                    <label key={c} className="flex cursor-pointer items-center gap-2 text-xs">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => toggleCat(c, v === true)}
                      />
                      <span className="font-mono">{c}</span>
                    </label>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="flex-1">
          {error ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-destructive">
                Couldn&apos;t load catalog: {error instanceof Error ? error.message : 'Unknown error'}
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No products match your filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <Card key={p.id} className="transition-colors hover:border-primary/40">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{p.displayName}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.providerCode} · {p.prodCode}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {p.category}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-muted-foreground">
                      {p.countryIso && (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                          {p.countryIso}
                        </span>
                      )}
                      {p.currency && (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                          {p.currency}
                        </span>
                      )}
                      {p.minAmountMinor && p.maxAmountMinor && (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                          {Number(p.minAmountMinor) / 100}–{Number(p.maxAmountMinor) / 100}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}
