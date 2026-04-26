'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateApiClient,
  type ApiClientTier,
  type CreateApiClientResult,
} from '@/hooks/use-api-clients'

const AVAILABLE_SCOPES = [
  { id: 'txn:read', label: 'Read transactions' },
  { id: 'txn:write', label: 'Create transactions' },
  { id: 'ledger:read', label: 'Read ledger' },
  { id: 'device:read', label: 'Read devices' },
  { id: 'tenant:read', label: 'Read tenants' },
  { id: 'webhook:manage', label: 'Manage webhook subscriptions' },
] as const

const TIERS: { value: ApiClientTier; label: string; hint: string }[] = [
  { value: 'public', label: 'Public', hint: 'Default for new integrations. 60 req/min.' },
  { value: 'partner', label: 'Partner', hint: 'Trusted partners. 600 req/min.' },
  { value: 'internal', label: 'Internal', hint: 'First-party services only.' },
]

const FormSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  ownerEmail: z.string().email().optional().or(z.literal('')),
  webhookUrl: z.string().url().optional().or(z.literal('')),
  tier: z.enum(['internal', 'partner', 'public']),
  scopes: z.array(z.string()).min(1, 'Select at least one scope'),
})
type FormValues = z.infer<typeof FormSchema>

export function CreateKeyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (result: CreateApiClientResult) => void
}) {
  const create = useCreateApiClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      ownerEmail: '',
      webhookUrl: '',
      tier: 'public',
      scopes: ['txn:read'],
    },
  })

  React.useEffect(() => {
    if (!open) form.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function onSubmit(values: FormValues) {
    try {
      const result = await create.mutateAsync({
        name: values.name,
        scopes: values.scopes,
        tier: values.tier,
        ownerEmail: values.ownerEmail || undefined,
        webhookUrl: values.webhookUrl || undefined,
      })
      onCreated(result)
      onOpenChange(false)
    } catch (err) {
      toast.error("Couldn't create client", {
        description: err instanceof Error ? err.message : 'Unexpected error',
      })
    }
  }

  const scopes = form.watch('scopes')
  function toggleScope(id: string, checked: boolean) {
    const next = checked
      ? Array.from(new Set([...scopes, id]))
      : scopes.filter((s) => s !== id)
    form.setValue('scopes', next, { shouldValidate: true })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New API key</DialogTitle>
          <DialogDescription>
            Issue a credential pair. The plaintext secret is shown once.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Production server"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ownerEmail">Owner email (optional)</Label>
            <Input
              id="ownerEmail"
              type="email"
              placeholder="dev@yourcompany.com"
              {...form.register('ownerEmail')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
            <Input
              id="webhookUrl"
              type="url"
              placeholder="https://yourapp.example/webhooks/aspra"
              {...form.register('webhookUrl')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tier</Label>
            <Select
              value={form.watch('tier')}
              onValueChange={(v) => form.setValue('tier', v as ApiClientTier)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {TIERS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex flex-col">
                      <span>{t.label}</span>
                      <span className="text-[11px] text-muted-foreground">{t.hint}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Scopes</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AVAILABLE_SCOPES.map((s) => {
                const checked = scopes.includes(s.id)
                return (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-start gap-2 rounded-md border bg-muted/20 px-2.5 py-2 text-xs"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => toggleScope(s.id, v === true)}
                    />
                    <div className="flex flex-col">
                      <code className="font-mono text-[11px]">{s.id}</code>
                      <span className="text-muted-foreground">{s.label}</span>
                    </div>
                  </label>
                )
              })}
            </div>
            {form.formState.errors.scopes && (
              <p className="text-xs text-destructive">{form.formState.errors.scopes.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              Create key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
