'use client'

import * as React from 'react'
import { Copy, Check, AlertTriangle } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

/**
 * Single-use plaintext secret reveal. Operator must copy + acknowledge before
 * the dialog closes. Adapted from admin-portal/components/developers.
 */
export function SecretRevealDialog({
  open,
  onClose,
  clientName,
  clientId,
  secret,
  context = 'created',
}: {
  open: boolean
  onClose: () => void
  clientName: string
  clientId: string
  secret: string
  context?: 'created' | 'rotated'
}) {
  const [copied, setCopied] = React.useState(false)
  const [ack, setAck] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setCopied(false)
      setAck(false)
    }
  }, [open])

  async function copy() {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      toast.success('Secret copied to clipboard')
    } catch {
      toast.error("Couldn't copy — select and copy manually")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && ack && onClose()}>
      <DialogContent
        className="sm:max-w-lg"
        onEscapeKeyDown={(e) => {
          if (!ack) e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (!ack) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            API client {context === 'rotated' ? 'rotated' : 'created'}
          </DialogTitle>
          <DialogDescription>
            Copy the secret below now. It will not be shown again — if you lose
            it you&apos;ll need to rotate the key to issue a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-3.5 flex-none text-warning" aria-hidden />
              <p>
                This is the only time we&apos;ll display the plaintext secret for
                <span className="ml-1 font-mono">{clientName}</span>. Store it in
                your secret manager before continuing.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Client ID
            </Label>
            <code className="rounded-md border bg-muted/50 px-2 py-1.5 font-mono text-xs">
              {clientId}
            </code>
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Client secret
            </Label>
            <div className="flex items-stretch gap-2">
              <code className="flex-1 break-all rounded-md border bg-muted/50 px-2 py-1.5 font-mono text-xs">
                {secret}
              </code>
              <Button type="button" variant="outline" size="sm" onClick={copy}>
                {copied ? (
                  <>
                    <Check className="mr-1.5 size-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 size-3.5" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="ack-secret"
              checked={ack}
              onCheckedChange={(v) => setAck(v === true)}
            />
            <Label htmlFor="ack-secret" className="cursor-pointer text-xs leading-relaxed">
              I have copied the secret and understand it cannot be retrieved later.
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" disabled={!ack} onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
