'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ConsoleTopbar } from '@/components/console/topbar'
import { useSession } from '@/lib/session-context'
import { apiFetch, ApiError } from '@/lib/api'
import { useApiClients, useUpdateApiClient } from '@/hooks/use-api-clients'

const InviteSchema = z.object({
  email: z.string().email('Enter a valid email'),
  name: z.string().min(2, 'Name is too short'),
})
type InviteValues = z.infer<typeof InviteSchema>

export default function SettingsPage() {
  const { session } = useSession()
  const clients = useApiClients()
  const updateClient = useUpdateApiClient()
  const [confirmPause, setConfirmPause] = React.useState(false)
  const [inviting, setInviting] = React.useState(false)

  const form = useForm<InviteValues>({
    resolver: zodResolver(InviteSchema),
    defaultValues: { email: '', name: '' },
  })

  async function handleInvite(values: InviteValues) {
    setInviting(true)
    try {
      await apiFetch('/v1/admin/users/invite', {
        method: 'POST',
        body: { email: values.email, name: values.name },
      })
      toast.success('Invitation sent', { description: values.email })
      form.reset()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Unexpected error'
      toast.error("Couldn't send invite", { description: msg })
    } finally {
      setInviting(false)
    }
  }

  async function handlePauseAll() {
    setConfirmPause(false)
    try {
      const list = clients.data ?? []
      await Promise.all(
        list
          .filter((c) => c.status === 'active')
          .map((c) =>
            updateClient.mutateAsync({ id: c.id, patch: { status: 'paused' } }),
          ),
      )
      toast.success('All API keys paused')
    } catch (err) {
      toast.error('Some keys could not be paused', {
        description: err instanceof Error ? err.message : 'Unexpected error',
      })
    }
  }

  return (
    <>
      <ConsoleTopbar title="Settings" />
      <main className="flex flex-1 flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Organization</CardTitle>
            <CardDescription className="text-xs">
              Identity on file. Contact support to change company name or country.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company name" value={session?.user?.name ?? '—'} />
            <Field label="Primary contact" value={session?.user?.email ?? '—'} />
            <Field label="User ID" value={session?.user?.id ?? '—'} mono />
            <Field label="Role" value={session?.user?.role ?? '—'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Members</CardTitle>
            <CardDescription className="text-xs">
              Invite teammates to manage API keys, webhooks, and wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-wrap items-end gap-3"
              onSubmit={form.handleSubmit(handleInvite)}
            >
              <div className="flex flex-1 flex-col gap-1.5 sm:max-w-[240px]">
                <Label htmlFor="invite-name" className="text-xs">Name</Label>
                <Input id="invite-name" placeholder="Jane Doe" {...form.register('name')} />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 sm:max-w-[280px]">
                <Label htmlFor="invite-email" className="text-xs">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="jane@yourcompany.com"
                  {...form.register('email')}
                />
              </div>
              <Button type="submit" disabled={inviting}>
                Send invite
              </Button>
            </form>
            {form.formState.errors.email && (
              <p className="mt-2 text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">Danger zone</CardTitle>
            <CardDescription className="text-xs">
              Pausing all keys halts authentication for every integration on this
              account. Reverse it any time from API keys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Pause all API access</span>
                <span className="text-xs text-muted-foreground">
                  {(clients.data ?? []).filter((c) => c.status === 'active').length} active
                  {' '}
                  <Badge variant="outline" className="ml-1 border-success/40 text-success">
                    keys
                  </Badge>
                </span>
              </div>
              <Button
                variant="destructive"
                onClick={() => setConfirmPause(true)}
                disabled={updateClient.isPending}
              >
                Pause all
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={confirmPause} onOpenChange={setConfirmPause}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause all API keys?</AlertDialogTitle>
            <AlertDialogDescription>
              All currently-active keys will be set to paused. New requests will
              return 401 until you resume them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePauseAll}>Pause all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={mono ? 'font-mono text-xs' : 'text-sm'}>{value}</span>
    </div>
  )
}
