import type { BrandKey } from './brands'

/**
 * The three checkout funnels the prototype can demo.
 *
 * Each phase moves one module earlier or later in the journey; Phase 3 removes
 * the cart page altogether. Everything that differs between them is declared
 * here rather than tested for in components, so a page asks "where does gifting
 * live in this flow?" instead of "which phase am I in?".
 */

export const FLOWS = [1, 2, 3] as const

export type Flow = (typeof FLOWS)[number]

/**
 * Where a demo starts. Phase 1 is the fullest journey — cart page, gifting and
 * shipping all present — so a bare link opens on the most to show, and the
 * later phases read as things being taken away.
 */
export const DEFAULT_FLOW: Flow = 1

/** Where a module lives in a given flow. */
type Step = 'cart' | 'checkout'

export interface FlowConfig {
  /** Phase 3 goes straight from the floating cart to checkout. */
  hasCartPage: boolean
  warranty:    'floating-cart'
  gifting:     Step
  shipping:    Step
  promo:       Step
  /** Both pages show one in the phases that have both. */
  orderSummary: Step[]
  /** Exactly one page per flow, so the list is never said twice. */
  usps: Step
}

const FLOW_CONFIG: Record<Flow, FlowConfig> = {
  1: {
    hasCartPage: true,
    warranty: 'floating-cart',
    gifting:  'cart',
    shipping: 'cart',
    promo:    'cart',
    orderSummary: ['cart', 'checkout'],
    usps: 'cart',
  },
  2: {
    hasCartPage: true,
    warranty: 'floating-cart',
    gifting:  'cart',
    shipping: 'checkout',
    promo:    'cart',
    orderSummary: ['cart', 'checkout'],
    usps: 'cart',
  },
  3: {
    hasCartPage: false,
    warranty: 'floating-cart',
    gifting:  'checkout',
    shipping: 'checkout',
    promo:    'checkout',
    orderSummary: ['checkout'],
    usps: 'checkout',
  },
}

export function getFlowConfig(flow: Flow): FlowConfig {
  return FLOW_CONFIG[flow]
}

/** Shown on the presenter control. */
export const FLOW_LABELS: Record<Flow, { name: string; summary: string }> = {
  1: { name: 'Phase 1', summary: 'New checkout without account page' },
  2: { name: 'Phase 2', summary: 'Shipping moves to checkout' },
  3: { name: 'Phase 3', summary: 'No cart page' },
}

/** The steps this flow's breadcrumb should name. The shrinking count is the point. */
export function getFlowSteps(flow: Flow): string[] {
  return getFlowConfig(flow).hasCartPage
    ? ['My Bag', 'Contact Information', 'Payment & Shipping']
    : ['Contact Information', 'Payment & Shipping']
}

/**
 * What a brand offers, in one place.
 *
 * LAL sells wall art and canvases, which no protection plan covers — so the
 * warranty is absent from the bag, the summaries and the presenter control
 * alike. Kept here so no component has to name the brand itself.
 */
export function getBrandFeatures(brand: BrandKey) {
  return { warranty: brand !== 'lal' }
}
