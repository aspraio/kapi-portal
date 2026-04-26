import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = { title: 'Application received — kapi' }

export default function ThanksPage() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-6" />
        </span>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Application received</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Thanks — we&apos;ve logged your request. Our team manually reviews every
            application and will respond within one business day. Watch the email
            address you provided for next steps.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/docs">Browse docs</Link>
          </Button>
          <Button asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
