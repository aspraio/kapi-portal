'use client'

import * as React from 'react'
import {
  Activity,
  AlertCircle,
  KeyRound,
  Wallet as WalletIcon,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  useApiClientUsage,
  useApiClientLogs,
} from '@/hooks/use-api-clients'
import { useWallet } from '@/hooks/use-wallet'
import { cn } from '@/lib/utils'

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

export default function DashboardPage() {
  const clients = useApiClients()
  const wallet = useWallet()
  const primaryClientId = clients.data?.find((c) => c.status === 'active')?.id ?? null
  const usage = useApiClientUsage(primaryClientId, '24h')
  const logs = useApiClientLogs(primaryClientId, 10)

  const totals = usage.data?.totals
  const activeKeys = clients.data?.filter((c) => c.status === 'active').length ?? 0

  const points = (usage.data?.points ?? []).map((p) => ({
    bucket: new Date(p.bucket).toLocaleTimeString([], { hour: '2-digit' }),
    requests: p.requests,
    errors: p.errors,
    p50: p.p50Ms,
    p95: p.p95Ms,
  }))

  return (
    <>
      <ConsoleTopbar title="Dashboard" />
      <main className="flex flex-1 flex-col gap-6 p-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            label="Requests (24h)"
            value={totals ? totals.requests.toLocaleString() : '—'}
            icon={Activity}
            tone="primary"
          />
          <Stat
            label="Error rate"
            value={
              totals
                ? `${(totals.errorRate * 100).toFixed(2)}%`
                : '—'
            }
            icon={AlertCircle}
            tone={totals && totals.errorRate > 0.02 ? 'destructive' : 'success'}
          />
          <Stat
            label="Wallet balance"
            value={
              wallet.data
                ? formatMoney(wallet.data.availableMinor, wallet.data.currency)
                : '—'
            }
            icon={WalletIcon}
            tone="primary"
          />
          <Stat
            label="Active keys"
            value={String(activeKeys)}
            icon={KeyRound}
            tone="primary"
          />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Requests / minute</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points}>
                  <defs>
                    <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    dataKey="requests"
                    stroke="var(--primary)"
                    fill="url(#reqFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Latency p50 / p95 (ms)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Line dataKey="p50" stroke="var(--chart-2)" dot={false} />
                  <Line dataKey="p95" stroke="var(--chart-3)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent calls</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(logs.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No requests yet. Use your API key to make your first call.
                    </TableCell>
                  </TableRow>
                )}
                {(logs.data ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {row.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn('font-mono text-xs', row.statusCode >= 400 ? 'text-destructive' : 'text-success')}>
                        {row.statusCode}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{row.latencyMs}ms</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
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

function Stat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'primary' | 'success' | 'destructive'
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-md',
            tone === 'primary' && 'bg-primary/15 text-primary',
            tone === 'success' && 'bg-success/15 text-success',
            tone === 'destructive' && 'bg-destructive/15 text-destructive',
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="truncate text-xl font-semibold tracking-tight">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
