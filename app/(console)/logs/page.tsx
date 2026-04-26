'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { useApiClients, useApiClientLogs } from '@/hooks/use-api-clients'
import { cn } from '@/lib/utils'

export default function LogsPage() {
  const clients = useApiClients()
  const [selected, setSelected] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!selected && clients.data?.length) setSelected(clients.data[0].id)
  }, [clients.data, selected])

  const logs = useApiClientLogs(selected, 200)

  return (
    <>
      <ConsoleTopbar title="Logs" />
      <main className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
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
          <span className="text-xs text-muted-foreground">
            Last 200 requests
          </span>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center">
                      <Loader2 className="mx-auto size-4 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )}
                {!logs.isLoading && (logs.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      {selected ? 'No requests recorded yet.' : 'Select an API key.'}
                    </TableCell>
                  </TableRow>
                )}
                {(logs.data ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">
                      {format(new Date(row.createdAt), 'MMM d HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {row.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.endpoint}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-mono text-xs',
                          row.statusCode >= 500
                            ? 'text-destructive'
                            : row.statusCode >= 400
                              ? 'text-warning'
                              : 'text-success',
                        )}
                      >
                        {row.statusCode}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {row.latencyMs}ms
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
