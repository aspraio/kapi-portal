'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export type CatalogProduct = {
  id: string
  providerCode: string
  prodCode: string
  countryIso: string | null
  operatorCode: string | null
  displayName: string
  category: string
  currency: string | null
  minAmountMinor: string | null
  maxAmountMinor: string | null
  fixedValuesMinor: string[]
  active: boolean
}

export type CatalogFilters = {
  category?: string[]
  country?: string
  search?: string
}

export function useCatalog(filters: CatalogFilters = {}) {
  return useQuery({
    queryKey: ['catalog', filters],
    queryFn: async () => {
      const res = await apiFetch<{ items: CatalogProduct[] }>('/v1/admin/catalog', {
        query: {
          country: filters.country,
          search: filters.search,
          category: filters.category?.join(','),
        },
      })
      return res.items
    },
    staleTime: 60_000,
  })
}
