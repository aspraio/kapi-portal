import Link from 'next/link'
import { Mail, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata = { title: 'Contact — kapi' }

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        Talk to the team.
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        For sandbox access, use the application form. For commercial conversations,
        partnerships, or anything else, reach us directly.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Mail className="size-5" />
            </span>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sales, partnerships, and integration questions.
              </p>
            </div>
            <Button asChild variant="outline">
              <a href="mailto:hello@aspra.io">hello@aspra.io</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 py-6">
            <span className="inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <MessageSquare className="size-5" />
            </span>
            <div>
              <h3 className="font-semibold">Apply for access</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The fastest path to a sandbox key. Manual review, usually within one
                business day.
              </p>
            </div>
            <Button asChild>
              <Link href="/sign-up">Start application</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
