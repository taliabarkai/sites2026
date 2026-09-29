import { isOrderStatus, type OrderStatus } from './orderStatus'

/**
 * Order lookup for the Track My Order page.
 *
 * A mock today, shaped like the endpoint that will replace it: one async
 * function, in `(orderNumber, email)`, out a `TrackedOrder` or `null`. Swapping
 * it for a real fetch should not touch a single caller.
 *
 * Everything the page renders is already parsed here. The backend sends
 * shipping as raw strings like `ESTDDEL:` and `SHIPPING_MESSAGE`; those get
 * resolved into `name` and `estimate` at this boundary so no component ever has
 * to know they existed.
 */

export interface TrackedOrderItem {
  image:      string
  name:       string
  /** Minor units (cents), like the rest of the project. */
  price:      number
  attributes: Array<{ label: string; value: string }>
}

export interface ShippingUpdate {
  /** Already formatted for display, e.g. "Oct 3, 2026". */
  date:     string
  time:     string
  title:    string
  location: string
}

export interface TrackedOrder {
  orderNumber:      string
  email:            string
  status:           OrderStatus
  /** "Oct 1, 2026" */
  orderDate:        string
  /** "Oct 6, 2026" */
  estDeliveryDate:  string
  /** The weekday that date falls on, for the arrival panel. */
  estDeliveryWeekday: string
  /** True only on the day itself; drives "Arriving today". */
  arrivingToday:    boolean
  customer:         { firstName: string; lastName: string; phone: string }
  shippingAddress:  { name: string; line1: string; cityStateZip: string }
  /** Parsed, never a raw backend string. */
  shippingMethod:   { name: string; estimate: string }
  paymentMethod:    { label: string }
  items:            TrackedOrderItem[]
  totals:           { subtotal: number; shipping: number; promoDiscount: number; tax: number; total: number }
  carrier:          { name: string; trackingNumber: string; trackingUrl: string }
  /** Newest first. */
  shippingUpdates:  ShippingUpdate[]
}

/** The order every lookup resolves to, and the identity the sign-in mock knows. */
const SAMPLE_ORDER_NUMBER = '516422457'
const SAMPLE_EMAIL        = 'johndoe@gmail.com'

const SAMPLE: TrackedOrder = {
  orderNumber:     SAMPLE_ORDER_NUMBER,
  email:           SAMPLE_EMAIL,
  status:          'shipped',
  orderDate:       'Oct 1, 2026',
  estDeliveryDate: 'Oct 6, 2026',
  estDeliveryWeekday: 'Tuesday',
  arrivingToday:   false,
  customer:        { firstName: 'John', lastName: 'Doe', phone: '(516) 555-9476' },
  shippingAddress: {
    name:         'John Doe',
    line1:        '123 Main Street',
    cityStateZip: 'Port Washington, NY 11050',
  },
  shippingMethod: { name: 'Free Shipping', estimate: 'Get it by Tue, Oct 6 to Thu, Oct 8' },
  paymentMethod:  { label: 'Apple Pay' },
  items: [
    {
      image: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-6.jpg',
      name:  'Lock & Luna Charm with Round Cut Moissanite — Gold',
      price: 10500,
      attributes: [
        { label: 'Material', value: 'Gold Vermeil 18k' },
        { label: 'Chain Length', value: '18"' },
      ],
    },
    {
      image: 'https://cdn.oakandluna.com/digital-asset/product/engraved-comprass-necklace-gold-vermeil-1.jpg',
      name:  'Engraved Compass Necklace with Diamond — Gold Vermeil',
      price: 15000,
      attributes: [
        { label: 'Material', value: 'Gold Vermeil 18k' },
        { label: 'Chain Length', value: '18"' },
      ],
    },
  ],
  totals:  { subtotal: 25500, shipping: 0, promoDiscount: 0, tax: 2040, total: 27540 },
  carrier: {
    name:           'FedEx',
    trackingNumber: '2233445566',
    trackingUrl:    'https://www.fedex.com/fedextrack/?trknbr=2233445566',
  },
  shippingUpdates: [
    { date: 'Oct 4, 2026', time: '7:12 AM',  title: 'Out for delivery',            location: 'Port Washington, NY' },
    { date: 'Oct 3, 2026', time: '9:48 PM',  title: 'Arrived at local facility',   location: 'Melville, NY' },
    { date: 'Oct 3, 2026', time: '6:02 AM',  title: 'Departed FedEx location',     location: 'Newark, NJ' },
    { date: 'Oct 2, 2026', time: '4:35 PM',  title: 'Shipment picked up',          location: 'Secaucus, NJ' },
    { date: 'Oct 1, 2026', time: '11:20 AM', title: 'Shipping label created',      location: 'Secaucus, NJ' },
  ],
}

/** Stand-in for network latency, so the loading state is actually reachable. */
const LOOKUP_DELAY_MS = 600

export interface GetTrackedOrderOptions {
  /**
   * QA only: forces the status so every state can be previewed from the URL.
   * Ignored unless it names a real status.
   */
  statusOverride?: string | null
}

/**
 * Look up one order. Resolves to `null` when nothing matches — a miss is an
 * ordinary answer here, not an error, because the shopper mistyping their own
 * order number is the common case.
 */
export async function getTrackedOrder(
  orderNumber: string,
  email: string,
  options: GetTrackedOrderOptions = {},
): Promise<TrackedOrder | null> {
  await new Promise(resolve => setTimeout(resolve, LOOKUP_DELAY_MS))

  // Typed as the shopper would: a leading #, stray spaces, any casing.
  const cleanNumber = orderNumber.trim().replace(/^#/, '')
  const cleanEmail  = email.trim().toLowerCase()

  /* A prototype, so any order number and any address resolve — the page is
     here to show the states, not to guard a database. Whether a lookup fails
     is the demo toggle's business (`?state=error`), handled by the caller. */
  if (!cleanNumber || !cleanEmail) return null

  const override = options.statusOverride
  const status = override && isOrderStatus(override) ? override : SAMPLE.status

  return {
    ...SAMPLE,
    /* Echo back what was typed. The sample order stands in for the real one,
       but a demo that answers "516422457" to whatever you entered looks like
       it ignored you. */
    orderNumber: cleanNumber,
    email:       cleanEmail,
    status,
    arrivingToday: status === 'out_for_delivery',
  }
}
