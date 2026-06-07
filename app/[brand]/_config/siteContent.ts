export interface NavLink {
  label: string
  href: string
  highlight?: boolean
}

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export const DEFAULT_TOPLINE = {
  promoLeft: 'Subscribe & Get 10% Off',
  promoCenter: 'Free Shipping on All Orders',
  helpLabel: 'Need help?',
  trackLabel: 'Track My Order',
  helpHref: '/help',
  trackHref: '/track-order',
}

export const DEFAULT_NAV_LINKS: NavLink[] = [
  // { label: 'Shop All', href: '/category' },
  // { label: 'Gifts', href: '/gifts' },
  { label: 'Best Sellers', href: '/category' },
  // { label: 'Sale', href: '/sale' },
  { label: 'New In', href: '/category/t2' },
  { label: 'Shop All', href: '/category/t3' },
  { label: 'Design System', href: '/styleguide' },
]

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Customer Care',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Track My Order', href: '/track-order' },
      { label: 'Shipping Information', href: '/shipping' },
      { label: 'Payment Policy', href: '/payment-policy' },
      { label: 'Jewelry Care', href: '/jewelry-care' },
      { label: 'Warranty', href: '/warranty' },
    ],
  },
  {
    title: 'About Us',
    links: [
      { label: 'Our Story', href: '/our-story' },
      { label: 'Blog', href: '/blog' },
      { label: 'Sizing Guide', href: '/sizing' },
      { label: 'Collaborations', href: '/collaborations' },
      { label: 'Sustainability', href: '/sustainability' },
    ],
  },
  {
    title: 'Legal & Privacy',
    links: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Payment Policy', href: '/payment-policy' },
    ],
  },
]

export const DEFAULT_NEWSLETTER = {
  eyebrow: '',
  title: 'Sign up for 15% off',
  description: 'Be the first to discover new drops, special offers, and all things Oak and Luna.',
  emailPlaceholder: 'Email Address',
  successMessage: 'Thank you — check your inbox for your welcome offer.',
  errorMessage: 'Please enter a valid email address.',
}

/** Shared hero imagery for all brands until per-brand assets are available. */
export const HERO_IMAGES = {
  desktop: '/images/hero-desktop.jpg',
  mobile: '/images/hero-mobile.jpg',
} as const

export const DEFAULT_HERO = {
  eyebrow: 'New Season',
  title: 'Jewelry made personal',
  description:
    'Discover handcrafted necklaces, bracelets, and rings designed to celebrate the moments that matter most.',
  ctaPrimary: { label: 'Shop Best Sellers', href: '/category' },
  ctaSecondary: { label: 'Personalize Yours', href: '/personalize' },
  imageAlt: 'Gold diamond pendant necklace in jewelry tweezers beside a model wearing gold jewelry',
}

export const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'X', href: 'https://x.com' },
  { label: 'Pinterest', href: 'https://pinterest.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
]

export const PAYMENT_METHODS = ['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay']
