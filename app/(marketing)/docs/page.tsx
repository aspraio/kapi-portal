'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { BookOpen, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { API_BASE_URL } from '@/lib/api'

// Mirror of the dynamic-import pattern used in
// `aspra-admin-portal/app/(portal)/developers/docs/page.tsx`.
const SCALAR_PACKAGE = '@scalar/api-reference-react'

const ScalarApiReference = dynamic<{ configuration: Record<string, unknown> }>(
  async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import(/* webpackIgnore: true */ SCALAR_PACKAGE)
      return mod.ApiReferenceReact ?? mod.default
    } catch {
      return function Missing() {
        return <DocsPlaceholder />
      }
    }
  },
  { ssr: false, loading: () => <DocsPlaceholder loading /> },
)

const SPEC_URL = `${API_BASE_URL}/v1/public/openapi.json`

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">API documentation</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live OpenAPI reference, served straight from the running aspra-api backend.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={SPEC_URL} target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" /> Raw spec
          </a>
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <ScalarErrorBoundary fallback={<DocsPlaceholder />}>
            <ScalarApiReference
              configuration={{
                spec: { url: SPEC_URL },
                hideClientButton: false,
                layout: 'modern',
                theme: 'default',
                metaData: {
                  title: 'Aspra Public API',
                  description: `Backend at ${API_BASE_URL}`,
                },
              }}
            />
          </ScalarErrorBoundary>
        </CardContent>
      </Card>
    </div>
  )
}

function DocsPlaceholder({ loading = false }: { loading?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
        <BookOpen className="size-5 text-primary" />
      </div>
      <h3 className="text-sm font-semibold">
        {loading ? 'Loading reference…' : 'API reference'}
      </h3>
      <p className="max-w-md text-xs text-muted-foreground">
        {loading
          ? 'Fetching the OpenAPI spec from the backend.'
          : 'Install @scalar/api-reference-react to render the embedded reference. The raw spec is available below.'}
      </p>
      <Button variant="outline" size="sm" asChild>
        <a href={SPEC_URL} target="_blank" rel="noreferrer">
          Open OpenAPI spec
        </a>
      </Button>
    </div>
  )
}

class ScalarErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
