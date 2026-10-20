import type { BrandKey } from './brands'

export interface NavLink {
  label: string
  href: string
  highlight?: boolean
  desktopHidden?: boolean
  /**
   * Renders the link as artwork instead of text, swapping to `hover` on
   * hover/focus. `label` is still the accessible name.
   */
  image?: { default: string; hover: string }
  /** Sub-links shown in a dropdown (desktop hover / mobile expand). */
  children?: NavLink[]
  /**
   * Titled link columns shown in a full-width mega menu on desktop hover
   * (mobile: expandable section). Takes precedence over `children`.
   */
  groups?: NavGroup[]
}

export interface NavGroup {
  title: string
  links: NavLink[]
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
  contactLabel: 'Contact Us',
  helpHref: '/help',
  trackHref: '/track-order',
  contactHref: '/contact-us',
}

export const DEFAULT_NAV_LINKS: NavLink[] = [
  // { label: 'Shop All', href: '/category' },
  // { label: 'Gifts', href: '/gifts' },
  { label: 'Best Sellers', href: '/category' },
  {
    label: 'New In',
    href: '/category/t4',
    // Artwork label hidden for now — shows the plain "New In" text instead.
    // Uncomment to bring the gold "New in" image back.
    // image: {
    //   default: '/images/nav/new-in-default.jpg',
    //   hover:   '/images/nav/new-in-hover.jpg',
    // },
  },
  {
    label: 'Shop By',
    href: '#shop-by',
    groups: [
      {
        title: 'Category Page',
        links: [
          { label: 'Best Sellers - Current', href: '/category' },
          { label: 'Best Sellers - V1', href: '/category/v1' },
          { label: 'Best Sellers - V2', href: '/category/v2' },
          { label: 'Best Sellers - V3', href: '/category/v3' },
          { label: 'Best Sellers - V4', href: '/category/v4' },
        ],
      },
      {
        title: 'Category Layouts',
        links: [
          { label: 'New In', href: '/category/t4' },
          { label: 'Shop the Look', href: '/category/t3' },
          { label: 'Sale', href: '/category/t5' },
        ],
      },
    ],
  },
  { label: 'Shop the Look', href: '/category/t3' },
  { label: 'Sale', href: '/category/t5' },
  {
    label: 'Design References',
    href: '#',
    children: [
      { label: 'Panel Examples', href: '/panel-examples' },
      { label: 'Highlights Bar', href: '/highlights-examples' },
      { label: 'Form Fields', href: '/form-fields' },
      { label: 'Design Systems', href: '/styleguide' },
    ],
  },
]

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Customer Care',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Track My Order', href: '/track-order' },
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'Customer Feedback', href: '/customer-feedback' },
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

/**
 * Trustpilot standing, shown by the confirmation page's review prompt.
 *
 * There is no Trustpilot feed in the project yet, so this is the one place the
 * score lives — swap it for the live API response when that exists rather than
 * repeating the number in a component.
 */
export const TRUSTPILOT = {
  score: 4.5,
  outOf: 5,
  reviewUrl: 'https://www.trustpilot.com',
  reviewCountLabel: 'Over 60,000 Reviews',
}

/**
 * Each brand's own clickable artwork for the feedback success screen (V3) —
 * it links to Trustpilot, like the Share the Love CTA. `null` until the brand
 * supplies one; the page shows a 3:2 placeholder frame instead. Artwork shows
 * full card width at its own aspect ratio, so copy baked into it is never
 * cropped. The link is named "Leave a review on Trustpilot", so the image
 * itself needs no alt text.
 */
export const SHARE_THE_LOVE_IMAGE: Record<BrandKey, string | null> = {
  oal: 'https://cdn.oakandluna.com/digital-asset/banners/TRUST_PILOT_MOBILE_BLACK__2.jpg',
  tgr: 'https://d3k81ch9hvuctc.cloudfront.net/company/RW2niK/images/9d1ed465-293c-4c7d-becf-4434d0e3145a.jpeg',
  lal: 'https://cdn.limeandlou.com/digital-asset/articles/ReviewMB.jpg',
  ib:  'https://cdn.israelblessing.com/digital-asset/banners/IB_AfterFeedback_MB.png',
  mnn: 'https://cdn.mynamenecklace.com/digital-asset/banners/feedback_img_MB.jpg',
}

/** Feedback success screen title, per brand (every version). `\n` breaks the line. */
export const FEEDBACK_SUCCESS_TITLE: Record<BrandKey, string> = {
  oal: 'Thank you\nFor Your Great Feedback!',
  tgr: 'thank you for your great feedback!',
  lal: 'Thank you for your kind feedback!',
  ib:  'Thank you for your great feedback!',
  mnn: 'Thank You For\nYour Great Feedback!',
}

/**
 * Each brand's image on the feedback success screen (V4), between the intro
 * sentence and the discount code. Not a link. `null` until the brand supplies
 * one; the page shows a 3:2 placeholder frame (1200 × 800) instead. Artwork
 * shows full card width at its own aspect ratio, and is decorative, so it
 * needs no alt text.
 */
export const FEEDBACK_OFFER_IMAGE: Record<BrandKey, string | null> = {
  oal: null,
  tgr: null,
  lal: null,
  ib:  null,
  mnn: null,
}

/**
 * SMS signup prompt on the order confirmation page. Shared across brands for
 * now — when the per-brand copy lands, this becomes a Record<BrandKey, …> map
 * the way BRAND_HIGHLIGHTS already is.
 */
export const SMS_SIGNUP = {
  title: 'Join our SMS squad',
  body: 'for first dibs on free gifts, exclusive offers & more.',
  cta: 'Sign me up for SMS',
}
