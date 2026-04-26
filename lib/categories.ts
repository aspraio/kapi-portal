import {
  Smartphone,
  Zap,
  Send,
  Wallet,
  Gift,
  CreditCard,
  Globe,
  Plane,
  Building2,
  type LucideIcon,
} from 'lucide-react'

export type Category = {
  slug: string
  name: string
  blurb: string
  icon: LucideIcon
}

export const CATEGORIES: Category[] = [
  {
    slug: 'mobile-recharge',
    name: 'Mobile Recharge',
    blurb: 'Top-up airtime and data on 800+ operators in 150+ countries.',
    icon: Smartphone,
  },
  {
    slug: 'utility-bills',
    name: 'Utility Bills',
    blurb: 'Pay electricity, water, gas, and internet for billers worldwide.',
    icon: Zap,
  },
  {
    slug: 'remittance',
    name: 'Remittance & Fintech',
    blurb: 'Cross-border payouts to bank accounts, wallets, and cash pickup.',
    icon: Send,
  },
  {
    slug: 'wallets',
    name: 'Wallets',
    blurb: 'Fund and withdraw from local mobile wallets across emerging markets.',
    icon: Wallet,
  },
  {
    slug: 'giftcards',
    name: 'Gift Cards',
    blurb: 'Issue digital gift cards from 1,000+ global brands.',
    icon: Gift,
  },
  {
    slug: 'virtual-cards',
    name: 'Virtual Cards',
    blurb: 'Issue branded virtual Visa and Mastercard credentials on demand.',
    icon: CreditCard,
  },
  {
    slug: 'esim',
    name: 'eSIM',
    blurb: 'Provision data eSIMs for travel and IoT in 200+ destinations.',
    icon: Globe,
  },
  {
    slug: 'travel',
    name: 'Travel',
    blurb: 'Search and book flights through a single normalized inventory.',
    icon: Plane,
  },
  {
    slug: 'hotels',
    name: 'Hotels',
    blurb: 'Aggregate hotel inventory with real-time availability and rates.',
    icon: Building2,
  },
]
