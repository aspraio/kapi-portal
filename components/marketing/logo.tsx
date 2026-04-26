import Link from 'next/link'
import { cn } from '@/lib/utils'

// TODO(branding): commission a real wordmark. Using Geist Mono for now to
// give the lowercase "kapi" a clean monospace feel distinct from admin's
// serif/sans treatment.
export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2 font-mono text-lg font-semibold tracking-tight',
        className,
      )}
    >
      <span
        aria-hidden
        className="inline-block size-6 rounded-md bg-gradient-to-br from-primary to-chart-2 shadow-sm"
      />
      {!mark && <span>kapi</span>}
    </Link>
  )
}
