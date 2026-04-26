'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch, type Paginated } from '@/lib/api'

export type Wallet = {
  id: string
  customerId: string
  currency: string
  availableMinor: string
  reservedMinor: string
  status?: 'active' | 'suspended'
}

export type WalletEntry = {
  id: string
  walletId: string
  kind: 'topup' | 'charge' | 'reversal' | 'adjustment'
  amountMinor: string
  currency: string
  reference: string | null
  memo: string | null
  createdAt: string
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => apiFetch<Wallet>('/v1/admin/wallet'),
    retry: false,
  })
}

export function useWalletEntries(cursor?: string | null) {
  return useQuery({
    queryKey: ['wallet', 'entries', cursor ?? null],
    queryFn: async () =>
      apiFetch<Paginated<WalletEntry>>('/v1/admin/wallet/entries', {
        query: cursor ? { cursor } : undefined,
      }),
  })
}
