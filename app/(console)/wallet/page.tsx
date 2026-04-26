'use client'

import * as React from 'react'
import { Loader2, Plus, Wallet as WalletIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConsoleTopbar } from '@/components/console/topbar'
import { useWallet, useWalletEntries, type WalletEntry } from '@/hooks/use-wallet'

function formatMoney(amountMinor: string | undefined, currency: string | undefined) {
  if (!amountMinor || !currency) return '—'
  try {
    const n = Number(BigInt(amountMinor)) / 100
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return `${amountMinor} ${currency}`
  }
}

export default function WalletPage() {
  const wallet = useWallet()
  const entries = useWalletEntries()
  const [topupOpen, setTopupOpen] = React.useState(false)

  return (
    <>
      <ConsoleTopbar title="Wallet" />
      <main className="flex flex-1 flex-col gap-4 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <WalletIcon className="size-6" />
                </span>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Available balance
                  </div>
                  <div className="text-3xl font-semibold tracking-tight">
                    {wallet.isLoading
                      ? '—'
                      : formatMoney(wallet.data?.availableMinor, wallet.data?.currency)}
                  </div>
                  {wallet.data?.reservedMinor && BigInt(wallet.data.reservedMinor) > 0n && (
                    <div className="text-xs text-muted-foreground">
                      Reserved: {formatMoney(wallet.data.reservedMinor, wallet.data.currency)}
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={() => setTopupOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                Top up
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-1 p-5">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Currency
              </div>
              <div className="font-mono text-lg font-semibold">
                {wallet.data?.currency ?? '—'}
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Status
              </div>
              <Badge variant="outline" className="w-fit border-success/40 text-success">
                {wallet.data?.status ?? 'active'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Wallet entries</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kind</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Memo</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center">
                      <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )}
                {!entries.isLoading && (entries.data?.items ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No entries yet.
                    </TableCell>
                  </TableRow>
                )}
                {(entries.data?.items ?? []).map((e: WalletEntry) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {e.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatMoney(e.amountMinor, e.currency)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {e.reference ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {e.memo ?? '—'}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Top up wallet</DialogTitle>
            <DialogDescription>
              Stripe top-up integration coming soon — contact sales for manual top-up.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/30 p-4 text-xs text-muted-foreground">
            Email <span className="font-mono text-foreground">sales@aspra.io</span> with
            your customer ID and we&apos;ll wire your account within one business
            day. Self-serve top-up via Stripe is on the roadmap.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopupOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <a href="mailto:sales@aspra.io?subject=Wallet%20top-up">Email sales</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
