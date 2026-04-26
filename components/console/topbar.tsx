'use client'

import * as React from 'react'
import { Wallet as WalletIcon, ChevronDown } from 'lucide-react'

import { useSession } from '@/lib/session-context'
import { useWallet } from '@/hooks/use-wallet'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'

function formatMinor(amountMinor: string | undefined, currency: string | undefined): string {
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

export function ConsoleTopbar({ title }: { title?: string }) {
  const { session, signOut } = useSession()
  const router = useRouter()
  const wallet = useWallet()
  const [env, setEnv] = React.useState<'sandbox' | 'live'>('sandbox')

  const initials = (session?.user?.name ?? session?.user?.email ?? '??')
    .split(/[\s@.]+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/60 px-6 backdrop-blur">
      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
        )}
      </div>

      <Select value={env} onValueChange={(v) => setEnv(v as 'sandbox' | 'live')}>
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sandbox">Sandbox</SelectItem>
          <SelectItem value="live">Live</SelectItem>
        </SelectContent>
      </Select>

      <div
        className={cn(
          'flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs',
          wallet.isError && 'opacity-60',
        )}
        title="Wallet balance"
      >
        <WalletIcon className="size-3.5 text-primary" />
        <span className="font-mono">
          {wallet.data
            ? formatMinor(wallet.data.availableMinor, wallet.data.currency)
            : '—'}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-sm transition-colors hover:bg-muted">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
            {initials || 'U'}
          </span>
          <span className="hidden max-w-[140px] truncate text-xs sm:inline">
            {session?.user?.email ?? 'Account'}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuLabel className="text-xs">
            <div className="font-medium">{session?.user?.name}</div>
            <div className="text-muted-foreground">{session?.user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              signOut()
              router.push('/sign-in')
            }}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
