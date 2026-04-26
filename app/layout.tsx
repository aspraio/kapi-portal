import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'kapi — API gateway for super-apps',
  description:
    'One API for mobile recharge, utility bills, remittance, wallets, gift cards, virtual cards, eSIM, travel, and hotels.',
  metadataBase: new URL('https://kapi.aspra.io'),
  openGraph: {
    title: 'kapi — API gateway for super-apps',
    description:
      'One API for every super-app service. Mobile recharge, utilities, remittance, wallets, gift cards, virtual cards, eSIM, travel, hotels.',
    url: 'https://kapi.aspra.io',
    siteName: 'kapi',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
