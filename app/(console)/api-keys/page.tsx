'use client'

import * as React from 'react'
import { Loader2, Plus, RotateCw, Ban, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

import {
  useApiClients,
  useRotateApiClient,
  useRevokeApiClient,
  type ApiClient,
  type CreateApiClientResult,
  type RotateApiClientResult,
} from '@/hooks/use-api-clients'
import { CreateKeyDialog } from '@/components/console/create-key-dialog'
import { SecretRevealDialog } from '@/components/console/secret-reveal-dialog'
import { ConsoleTopbar } from '@/components/console/topbar'

export default function ApiKeysPage() {
  const { data: clients = [], isLoading, error, refetch } = useApiClients()
  const rotate = useRotateApiClient()
  const revoke = useRevokeApiClient()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [revealState, setRevealState] = React.useState<
    | {
        open: boolean
        clientName: string
        clientId: string
        secret: string
        context: 'created' | 'rotated'
      }
    | null
  >(null)
  const [confirmRevoke, setConfirmRevoke] = React.useState<ApiClient | null>(null)

  function handleCreated(result: CreateApiClientResult) {
    setRevealState({
      open: true,
      clientName: result.client.name,
      clientId: result.client.clientId,
      secret: result.secret,
      context: 'created',
    })
  }

  async function handleRotate(client: ApiClient) {
    try {
      const result: RotateApiClientResult = await rotate.mutateAsync({ id: client.id })
      setRevealState({
        open: true,
        clientName: client.name,
        clientId: client.clientId,
        secret: result.secret,
        context: 'rotated',
      })
    } catch (err) {
      toast.error("Couldn't rotate", {
        description: err instanceof Error ? err.message : 'Unexpected error',
      })
    }
  }

  async function handleRevoke() {
    if (!confirmRevoke) return
    try {
      await revoke.mutateAsync({ id: confirmRevoke.id })
      toast.success('Key revoked', { description: confirmRevoke.name })
      setConfirmRevoke(null)
    } catch (err) {
      toast.error("Couldn't revoke", {
        description: err instanceof Error ? err.message : 'Unexpected error',
      })
    }
  }

  return (
    <>
      <ConsoleTopbar title="API keys" />
      <main className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="max-w-2xl text-sm text-muted-foreground">
            Issue and manage API client credentials. Plaintext secrets are shown
            once at creation and rotation — store them in your secret manager
            immediately.
          </p>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            New key
          </Button>
        </div>

        {error ? (
          <ErrorPanel
            message={error instanceof Error ? error.message : 'Unexpected error'}
            onRetry={refetch}
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        <Loader2 className="mx-auto size-4 animate-spin" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && clients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No API keys yet. Click &ldquo;New key&rdquo; to issue your first credential.
                      </TableCell>
                    </TableRow>
                  )}
                  {clients.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <code className="font-mono text-[11px]">{c.clientId}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {c.scopes.map((s) => (
                            <span
                              key={s}
                              className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.lastUsedAt
                          ? formatDistanceToNow(new Date(c.lastUsedAt), { addSuffix: true })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={c.status === 'revoked' || rotate.isPending}
                            onClick={() => handleRotate(c)}
                          >
                            <RotateCw className="mr-1.5 size-3.5" />
                            Rotate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={c.status === 'revoked'}
                            onClick={() => setConfirmRevoke(c)}
                          >
                            <Ban className="mr-1.5 size-3.5" />
                            Revoke
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />

      {revealState && (
        <SecretRevealDialog
          open={revealState.open}
          onClose={() => setRevealState(null)}
          clientName={revealState.clientName}
          clientId={revealState.clientId}
          secret={revealState.secret}
          context={revealState.context}
        />
      )}

      <AlertDialog open={!!confirmRevoke} onOpenChange={(o) => !o && setConfirmRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRevoke?.name} will stop authenticating immediately.
              In-flight requests will fail with 401. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke} disabled={revoke.isPending}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function StatusBadge({ status }: { status: ApiClient['status'] }) {
  if (status === 'active')
    return <Badge variant="outline" className="border-success/40 text-success">Active</Badge>
  if (status === 'rotating')
    return <Badge variant="outline" className="border-warning/40 text-warning">Rotating</Badge>
  if (status === 'paused')
    return <Badge variant="outline" className="border-warning/40 text-warning">Paused</Badge>
  return <Badge variant="outline" className="text-muted-foreground">Revoked</Badge>
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <AlertTriangle className="size-6 text-destructive" aria-hidden />
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">Couldn&apos;t load API keys</h3>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
