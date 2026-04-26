import Link from 'next/link'
import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/marketing/logo'

export const metadata = { title: 'Developer console coming soon — kapi' }

export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Logo />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Back to site</Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <Card className="w-full max-w-xl">
          <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </span>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Developer console launching soon
              </h1>
              <p className="max-w-md text-sm text-muted-foreground">
                You&apos;re signed in, but the self-serve developer console
                (API keys, wallet, usage, webhooks) is still in build. We&apos;ll
                email you the moment it&apos;s ready.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/docs">Read the docs</Link>
              </Button>
              <Button asChild>
                <Link href="/">Back home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
