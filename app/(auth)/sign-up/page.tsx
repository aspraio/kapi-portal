'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIES } from '@/lib/categories'
import { apiFetch, ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'

const VOLUMES = ['<10k', '10k–100k', '100k–1M', '1M–10M', '10M+'] as const

const schema = z.object({
  // step 1 — org
  companyName: z.string().min(2, 'Company name is required'),
  country: z.string().min(2, 'Country is required'),
  website: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  // step 2 — contact
  contactName: z.string().min(2, 'Name is required'),
  contactEmail: z.string().email('Valid email required'),
  contactPhone: z.string().min(5, 'Phone number is required'),
  // step 3 — use case
  expectedVolume: z.enum(VOLUMES, {
    errorMap: () => ({ message: 'Select an expected monthly volume' }),
  }),
  categories: z.array(z.string()).min(1, 'Pick at least one category'),
  useCase: z.string().min(20, 'Tell us a bit more (at least 20 chars)'),
  // step 4 — terms
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms to apply' }),
  }),
})

type FormValues = z.infer<typeof schema>

const stepFields: Array<Array<keyof FormValues>> = [
  ['companyName', 'country', 'website'],
  ['contactName', 'contactEmail', 'contactPhone'],
  ['expectedVolume', 'categories', 'useCase'],
  ['acceptTerms'],
]

const stepTitles = ['Your organisation', 'Primary contact', 'Use case', 'Confirm']

// Backend volume buckets — keep in sync with the zod enum on
// `POST /v1/public/auth/register`. The form labels above use a non-ASCII
// dash for readability; the API expects ASCII hyphens.
const VOLUME_TO_API: Record<(typeof VOLUMES)[number], string> = {
  '<10k': '<10k',
  '10k–100k': '10k-100k',
  '100k–1M': '100k-1M',
  '1M–10M': '1M-10M',
  '10M+': '10M+',
}

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(0)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      companyName: '',
      country: '',
      website: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      expectedVolume: undefined as unknown as FormValues['expectedVolume'],
      categories: [],
      useCase: '',
      acceptTerms: false as unknown as true,
    },
  })

  const next = async () => {
    const ok = await form.trigger(stepFields[step])
    if (ok) setStep((s) => Math.min(s + 1, stepFields.length - 1))
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await apiFetch('/v1/public/auth/register', {
        method: 'POST',
        body: {
          companyName: values.companyName,
          country: values.country,
          website: values.website || undefined,
          expectedVolume: VOLUME_TO_API[values.expectedVolume],
          categories: values.categories,
          useCase: values.useCase,
          contactName: values.contactName,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone || undefined,
          acceptTerms: values.acceptTerms,
          acceptMarketing: false,
        },
      })
      router.push('/sign-up/thanks')
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.status === 429
            ? 'Too many applications from this network. Please try again later.'
            : e.status === 400
              ? 'Some fields look invalid. Please review your answers and try again.'
              : `Sorry, something went wrong (${e.status}). Please try again.`
          : 'Network error — please check your connection and retry.'
      setSubmitError(msg)
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Apply for sandbox access</CardTitle>
        <CardDescription>
          Tell us a bit about what you&apos;re building. Every application is reviewed
          manually — we&apos;ll respond within one business day.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper step={step} />

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <h2 className="text-lg font-semibold">{stepTitles[step]}</h2>

          {step === 0 && (
            <div className="space-y-4">
              <Field label="Company name" error={form.formState.errors.companyName?.message}>
                <Input {...form.register('companyName')} placeholder="Acme Super-app, Inc." />
              </Field>
              <Field label="Country of incorporation" error={form.formState.errors.country?.message}>
                <Input {...form.register('country')} placeholder="Nigeria" />
              </Field>
              <Field label="Website (optional)" error={form.formState.errors.website?.message}>
                <Input type="url" {...form.register('website')} placeholder="https://acme.com" />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Full name" error={form.formState.errors.contactName?.message}>
                <Input {...form.register('contactName')} placeholder="Ada Lovelace" />
              </Field>
              <Field label="Work email" error={form.formState.errors.contactEmail?.message}>
                <Input type="email" {...form.register('contactEmail')} placeholder="ada@acme.com" />
              </Field>
              <Field label="Phone (with country code)" error={form.formState.errors.contactPhone?.message}>
                <Input {...form.register('contactPhone')} placeholder="+234 801 234 5678" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Expected monthly call volume" error={form.formState.errors.expectedVolume?.message}>
                <Controller
                  control={form.control}
                  name="expectedVolume"
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a range" />
                      </SelectTrigger>
                      <SelectContent>
                        {VOLUMES.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v} calls / month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field
                label="Categories of interest"
                error={form.formState.errors.categories?.message as string | undefined}
              >
                <Controller
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {CATEGORIES.map((c) => {
                        const checked = field.value?.includes(c.slug) ?? false
                        return (
                          <label
                            key={c.slug}
                            className={cn(
                              'flex cursor-pointer items-start gap-3 rounded-md border bg-background px-3 py-2.5 text-sm transition-colors',
                              checked
                                ? 'border-primary/60 bg-primary/5'
                                : 'hover:border-foreground/20',
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const next = new Set(field.value ?? [])
                                if (v) next.add(c.slug)
                                else next.delete(c.slug)
                                field.onChange([...next])
                              }}
                              className="mt-0.5"
                            />
                            <span className="leading-tight">
                              <span className="block font-medium">{c.name}</span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
              </Field>

              <Field label="What are you building?" error={form.formState.errors.useCase?.message}>
                <Textarea
                  {...form.register('useCase')}
                  rows={5}
                  placeholder="A brief description of your product, target users, and which kapi services you'd integrate first."
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <ReviewBlock values={form.getValues()} />

              <Field error={form.formState.errors.acceptTerms?.message}>
                <Controller
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border bg-background px-3 py-3 text-sm">
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                        className="mt-0.5"
                      />
                      <span className="leading-snug text-muted-foreground">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        , and confirm the information above is accurate.
                      </span>
                    </label>
                  )}
                />
              </Field>
            </div>
          )}

          {submitError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4" /> Back
            </Button>

            {step < stepFields.length - 1 ? (
              <Button type="button" onClick={next}>
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Submitting…' : 'Submit application'}
              </Button>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already approved?{' '}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-2 text-xs font-medium">
      {stepTitles.map((t, i) => {
        const state = i < step ? 'done' : i === step ? 'active' : 'todo'
        return (
          <li key={t} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'inline-flex size-6 items-center justify-center rounded-full border text-[11px]',
                state === 'done' && 'border-primary bg-primary text-primary-foreground',
                state === 'active' && 'border-primary text-primary',
                state === 'todo' && 'border-border text-muted-foreground',
              )}
            >
              {state === 'done' ? <Check className="size-3" /> : i + 1}
            </span>
            <span
              className={cn(
                'hidden whitespace-nowrap sm:inline',
                state === 'todo' && 'text-muted-foreground',
              )}
            >
              {t}
            </span>
            {i < stepTitles.length - 1 && (
              <span className="ml-2 hidden h-px flex-1 bg-border sm:block" aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function ReviewBlock({ values }: { values: FormValues }) {
  const rows: Array<[string, string]> = [
    ['Company', values.companyName],
    ['Country', values.country],
    ['Website', values.website || '—'],
    ['Contact', `${values.contactName} <${values.contactEmail}>`],
    ['Phone', values.contactPhone],
    ['Expected volume', values.expectedVolume ?? '—'],
    [
      'Categories',
      values.categories.length
        ? values.categories
            .map((s) => CATEGORIES.find((c) => c.slug === s)?.name ?? s)
            .join(', ')
        : '—',
    ],
  ]

  return (
    <div className="overflow-hidden rounded-md border bg-secondary/30">
      <dl className="divide-y text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-4 px-4 py-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="col-span-2 font-medium">{v}</dd>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-4 px-4 py-3">
          <dt className="text-muted-foreground">Use case</dt>
          <dd className="col-span-2 whitespace-pre-wrap text-sm leading-snug">
            {values.useCase || '—'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
