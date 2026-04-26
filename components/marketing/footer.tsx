import Link from 'next/link'
import { Logo } from './logo'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t bg-secondary/30">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            API gateway for super-apps.
          </p>
        </div>
        <FooterCol title="Product">
          <FooterLink href="/#categories">Categories</FooterLink>
          <FooterLink href="/pricing">Pricing</FooterLink>
          <FooterLink href="/status">Status</FooterLink>
        </FooterCol>
        <FooterCol title="Developers">
          <FooterLink href="/docs">Documentation</FooterLink>
          <FooterLink href="/sign-up">Apply for access</FooterLink>
          <FooterLink href="/sign-in">Sign in</FooterLink>
        </FooterCol>
        <FooterCol title="Company">
          <FooterLink href="/contact">Contact</FooterLink>
          <FooterLink href="https://aspra.io">Aspra</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>&copy; {year} Aspra. All rights reserved.</span>
          <span className="font-mono">kapi.aspra.io</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {children}
      </Link>
    </li>
  )
}
