'use client'

import * as React from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConsoleTopbar } from '@/components/console/topbar'
import {
  useApiClients,
  useWebhookDeliveries,
  useRetryWebhookDelivery,
  type WebhookDelivery,
} from '@/hooks/use-api-clients'

export default function WebhooksPage() {
  const clients = useApiClients()
  const [selected, setSelected] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!selected && clients.data?.length) setSelected(clients.data[0].id)
  }, [clients.data, selected])

  const deliveries = useWebhookDeliveries(selected)
  const retry = useRetryWebhookDelivery()

  async function handleRetry(d: WebhookDelivery) {
    if (!selected) return
    try {
      await retry.mutateAsync({ clientId: selected, deliveryId: d.id })
      toast.success('Delivery requeued')
    } catch (err) {
      toast.error("Couldn't retry", {
        description: err instanceof Error ? err.message : 'Unexpected error',
      })
    }
  }

  const activeClient = clients.data?.find((c) => c.id === selected)

  return (
    <>
      <ConsoleTopbar title="Webhooks" />
      <main className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selected ?? ''} onValueChange={(v) => setSelected(v)}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select API key" />
            </SelectTrigger>
            <SelectContent>
              {(clients.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeClient?.webhookUrl && (
            <span className="rounded-md border bg-card px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
              {activeClient.webhookUrl}
            </span>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Last error</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center">
                      <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )}
                {!deliveries.isLoading && (deliveries.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      {selected
                        ? 'No webhook deliveries yet.'
                        : 'Select an API key to see its delivery history.'}
                    </TableCell>
                  </TableRow>
                )}
                {(deliveries.data ?? []).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.eventType}</TableCell>
                    <TableCell>
                      <DeliveryBadge status={d.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{d.attempts}</TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground" title={d.lastError ?? ''}>
                      {d.lastError ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={retry.isPending || d.status === 'delivered'}
                        onClick={() => handleRetry(d)}
                      >
                        <RefreshCw className="mr-1.5 size-3.5" />
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

function DeliveryBadge({ status }: { status: WebhookDelivery['status'] }) {
  const cls =
    status === 'delivered'
      ? 'border-success/40 text-success'
      : status === 'failed' || status === 'exhausted'
        ? 'border-destructive/40 text-destructive'
        : 'border-warning/40 text-warning'
  return (
    <Badge variant="outline" className={cls}>
      {status}
    </Badge>
  )
}
