import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const metadata = { title: 'Pricing — kapi' }

const tiers = [
  {
    name: 'Sandbox',
    price: 'Free',
    blurb: 'For evaluation and integration.',
    features: ['Full sandbox catalog', 'Test transactions', 'OpenAPI + SDK access', 'Email support'],
    cta: 'Apply for access',
    href: '/sign-up',
    featured: false,
  },
  {
    name: 'Production',
    price: 'Prepaid float',
    blurb: 'Pay-as-you-go on a topped-up wallet.',
    features: [
      'All 9 product categories',
      'Multi-currency settlement',
      'Webhooks + idempotency',
      'Per-transaction fee on top of provider cost',
      'Slack + email support',
    ],
    cta: 'Apply for access',
    href: '/sign-up',
    featured: true,
  },
  {
    name: 'Scale',
    price: 'Custom',
    blurb: 'For volumes above 1M monthly calls.',
    features: [
      'Volume-tier pricing',
      'Dedicated provider routing',
      'Uptime SLA',
      'Solutions engineer',
    ],
    cta: 'Talk to sales',
    href: '/contact',
    featured: false,
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Pricing built around your float.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Top up a prepaid wallet and consume any service in the catalog. No subscription,
          no minimum commit during private beta.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={
              t.featured
                ? 'border-primary/40 bg-gradient-to-br from-primary/5 to-transparent shadow-md'
                : ''
            }
          >
            <CardHeader>
              <CardTitle className="text-lg">{t.name}</CardTitle>
              <CardDescription>{t.blurb}</CardDescription>
              <div className="mt-2 font-mono text-3xl font-semibold tracking-tight">
                {t.price}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-6">
              <ul className="space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={t.featured ? 'default' : 'outline'}>
                <Link href={t.href}>{t.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Final per-transaction fees are confirmed at approval and depend on country, product,
        and volume tier.
      </p>
    </div>
  )
}
