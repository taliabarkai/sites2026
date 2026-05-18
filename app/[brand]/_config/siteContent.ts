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
  { label: 'Necklaces', href: '/category' },
  { label: 'Bracelets', href: '/bracelets' },
  { label: 'Rings', href: '/rings' },
  { label: 'Earrings', href: '/earrings' },
  { label: 'Gifts', href: '/gifts' },
  { label: 'Best Sellers', href: '/best-sellers' },
  { label: 'Design System', href: '/styleguide', highlight: true },
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
  eyebrow: 'Stay in the loop',
  title: 'Sign up and get 10% off',
  description: 'Be the first to hear about new arrivals, exclusive offers, and styling tips.',
  emailPlaceholder: 'Email Address',
  successMessage: 'Thank you — check your inbox for your welcome offer.',
  errorMessage: 'Please enter a valid email address.',
}

/** Shared hero imagery for all brands until per-brand assets are available. */
export const HERO_IMAGES = {
  desktop: 'https://cdn.oakandluna.com/digital-asset/banners/OAL_1ct_DT-SD.jpg',
  mobile: 'https://cdn.oakandluna.com/digital-asset/banners/1ct_MB-SD.jpg',
} as const

export const DEFAULT_HERO = {
  eyebrow: 'New Season',
  title: 'Jewelry made personal',
  description:
    'Discover handcrafted necklaces, bracelets, and rings designed to celebrate the moments that matter most.',
  ctaPrimary: { label: 'Shop Best Sellers', href: '/best-sellers' },
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
