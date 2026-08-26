import type { CartItem, SelectedOption } from './CartContext'

/**
 * The order handed to the confirmation page after a successful payment.
 *
 * Money is in cents throughout, matching `CartItem.price` and the checkout's
 * own totals — the page formats on render rather than storing formatted copy.
 */

export type FulfillmentStatus =
  | 'order_placed'
  | 'jewelry_creation'
  | 'packing_qc'
  | 'shipped'
  | 'out_for_delivery'

export interface PlacedOrderItem {
  image: string
  name: string
  price: number
  /** Per-product spec rows — the same {label, value} pairs the cart carries. */
  attributes: SelectedOption[]
}

export interface PlacedOrder {
  customer: {
    firstName: string
    email: string
    phone: string
  }
  order: {
    orderNumber: string
    /** Pre-formatted for display, e.g. "Sept 10, 2025". */
    estDeliveryDate: string
  }
  items: PlacedOrderItem[]
  shippingAddress: {
    name: string
    line1: string
    cityStateZip: string
  }
  shippingMethod: {
    name: string
    estimate: string
  }
  paymentMethod: {
    label: string
  }
  totals: {
    subtotal: number
    shipping: number
    /** 0 when no promo was applied — the summary row is dropped in that case. */
    promoDiscount: number
    tax: number
    total: number
  }
  loyalty: {
    keysEarned: number
  }
  fulfillmentStatus: FulfillmentStatus
}

// ─── Session storage ──────────────────────────────────────────────────────────

/* Session rather than local storage: the confirmation page is only reachable
   off the back of a checkout in this tab, and closing the tab ends that. */
const STORAGE_KEY = 'tg_placed_order'

export function savePlacedOrder(order: PlacedOrder): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch { /* ignore quota / private-mode errors */ }
}

export function loadPlacedOrder(): PlacedOrder | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PlacedOrder) : null
  } catch {
    return null
  }
}

export function clearPlacedOrder(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/* "Sept" rather than the "Sep" Intl gives, to match the design. */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat']

function addBusinessDays(from: Date, days: number): Date {
  const date = new Date(from)
  let left = days
  while (left > 0) {
    date.setDate(date.getDate() + 1)
    const day = date.getDay()
    if (day !== 0 && day !== 6) left -= 1
  }
  return date
}

/** "Sept 10, 2025" */
function formatLongDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

/** "Tue, Sept 10" */
function formatShortDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`
}

// ─── Building an order from checkout state ────────────────────────────────────

/** Delivery windows in business days, matching the checkout's shipping copy. */
const SHIPPING_WINDOWS = {
  free:     { name: 'Free Shipping',     minDays: 6, maxDays: 8 },
  standard: { name: 'Standard Shipping', minDays: 4, maxDays: 6 },
} as const

/** One key per dollar spent, before shipping and tax. */
function keysFor(subtotalCents: number): number {
  return Math.floor(subtotalCents / 100)
}

/* Order numbers come from the commerce backend in production. Until one is
   wired up, a timestamp gives the 9 digits the design shows without two orders
   in a session colliding. */
function generateOrderNumber(): string {
  return String(Date.now()).slice(-9)
}

export interface CreatePlacedOrderInput {
  items: CartItem[]
  customer: { firstName: string; lastName: string; email: string; phone: string }
  address: { line1: string; city: string; state: string; zip: string }
  shipping: keyof typeof SHIPPING_WINDOWS
  paymentLabel: string
  totals: { subtotal: number; shipping: number; promoDiscount: number; tax: number; total: number }
  /** Injectable so tests and previews aren't tied to the wall clock. */
  now?: Date
}

/**
 * Folds checkout state into the shape the confirmation page reads. Everything
 * derived here — order number, delivery dates, keys earned — is computed from
 * the order itself; nothing about the page is fixed copy.
 */
export function createPlacedOrder({
  items,
  customer,
  address,
  shipping,
  paymentLabel,
  totals,
  now = new Date(),
}: CreatePlacedOrderInput): PlacedOrder {
  const window = SHIPPING_WINDOWS[shipping]
  const earliest = addBusinessDays(now, window.minDays)
  const latest = addBusinessDays(now, window.maxDays)

  return {
    customer: {
      firstName: customer.firstName,
      email: customer.email,
      phone: customer.phone,
    },
    order: {
      orderNumber: generateOrderNumber(),
      estDeliveryDate: formatLongDate(earliest),
    },
    items: items.map((item) => ({
      image: item.image,
      name: item.name,
      price: item.price,
      attributes: item.selectedOptions ?? [],
    })),
    shippingAddress: {
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      line1: address.line1,
      cityStateZip: `${address.city}, ${address.state} ${address.zip}`.trim(),
    },
    shippingMethod: {
      name: window.name,
      estimate: `Get it by ${formatShortDate(earliest)} to ${formatShortDate(latest)}`,
    },
    paymentMethod: { label: paymentLabel },
    totals,
    loyalty: { keysEarned: keysFor(totals.subtotal) },
    fulfillmentStatus: 'order_placed',
  }
}
