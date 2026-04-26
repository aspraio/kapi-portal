import Link from 'next/link'
import { ArrowRight, Shield, Zap, Globe2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CATEGORIES } from '@/lib/categories'
import { CodeSample } from '@/components/marketing/code-sample'
import { StatsStrip } from '@/components/marketing/stats-strip'

export default function LandingPage() {
  return (
    <>
      <Hero />
      <section className="border-t bg-secondary/30">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <StatsStrip />
        </div>
      </section>
      <Categories />
      <CodeSection />
      <TrustStrip />
      <CTA />
    </>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_0%,oklch(0.95_0.05_290)_0%,transparent_70%)]"
      />
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-24 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Now in private beta
          </span>
          <h1 className="mt-6 text-balance font-sans text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            One API for every <span className="text-primary">super-app service</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            kapi is a single integration for mobile recharge, utility bills, remittance,
            wallets, gift cards, virtual cards, eSIM, travel, and hotels — across 150+
            countries.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/sign-up">
                Get an API key <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/docs">Read the docs</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Sign-up is reviewed manually. Approval typically within one business day.
          </p>
        </div>
      </div>
    </section>
  )
}

function Categories() {
  return (
    <section id="categories" className="border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Nine product categories. One contract.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Build payments, top-ups, payouts, and travel into your super-app without
            negotiating with a dozen aggregators.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon
            return (
              <Card
                key={c.slug}
                className="group transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CodeSection() {
  return (
    <section className="border-t bg-secondary/30">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Built for engineers, priced for super-apps.
          </h2>
          <p className="mt-3 text-muted-foreground">
            REST + JSON, idempotent by default, OpenAPI 3.1 spec, typed SDKs for Node,
            Python, Go, and PHP. Sandbox keys are issued the moment your application is
            approved.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              { icon: Zap, text: 'Single auth, single ledger, single webhook surface.' },
              { icon: Globe2, text: 'Multi-currency settlement and FX baked in.' },
              { icon: Shield, text: 'Idempotency keys mandatory — no duplicate spend.' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-3.5" />
                </span>
                <span className="text-foreground/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <CodeSample />
      </div>
    </section>
  )
}

function TrustStrip() {
  // TODO(branding): replace placeholder partner names with real customer logos
  // when we have signed case studies.
  const placeholders = ['Partner', 'Telco', 'Wallet', 'Bank', 'Travel']
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Trusted by builders integrating cash and digital payments
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
          {placeholders.map((p) => (
            <span
              key={p}
              className="font-mono text-sm font-semibold tracking-tight text-muted-foreground"
            >
              {p.toLowerCase()}.co
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-chart-2/5">
          <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center md:px-12">
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Ship the next super-app on a single API.
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Apply for sandbox access. We review every application manually to keep
              fraud and abuse off the network.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/sign-up">
                  Apply for access <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
