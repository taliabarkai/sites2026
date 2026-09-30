/**
 * The fulfillment journey, in one place.
 *
 * Five steps, and six statuses: `delivered` is not a sixth step, it is every
 * step complete. Keeping that distinction here means a stepper never has to
 * decide what "done" looks like — it asks for an index and gets one.
 *
 * `app/[brand]/_context/placedOrder.ts` carries an older union of its own for
 * the thank-you page. `fromFulfillmentStatus` maps it onto this one, so the two
 * can be reconciled later without either page having to change today.
 */

export const ORDER_STEPS = [
  'Order Placed',
  'Jewelry Creation',
  'Packing & Quality Control',
  'Shipped',
  'Delivered',
] as const

export type OrderStep = (typeof ORDER_STEPS)[number]

export const ORDER_STATUSES = [
  'placed',
  'creation',
  'packing',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
}

/**
 * Which of the five steps each status stands on.
 *
 * `out_for_delivery` shares the Shipped step: the journey ends at Delivered,
 * so there is no separate milestone for the van. It is still its own status
 * because the arrival copy above the stepper changes on the day.
 */
const STATUS_STEP_INDEX: Record<OrderStatus, number> = {
  placed:           0,
  creation:         1,
  packing:          2,
  shipped:          3,
  out_for_delivery: 3,
  delivered:        4,
}

/**
 * The step the order has most recently reached.
 *
 * A status names a milestone that has *happened* — "shipped" means the parcel
 * is gone, not that shipping is pending — so that step is the current one and
 * it counts as done. The confirmation page has always drawn it this way.
 */
export function currentStepIndex(status: OrderStatus): number {
  return STATUS_STEP_INDEX[status]
}

/** How many steps are finished, the current one included. */
export function completedStepCount(status: OrderStatus): number {
  return STATUS_STEP_INDEX[status] + 1
}

/** A package is only traceable once it has actually left. */
export function hasTracking(status: OrderStatus): boolean {
  return status === 'shipped' || status === 'out_for_delivery' || status === 'delivered'
}

/** What the delivery tile calls the date it is showing. */
export function deliveryDateLabel(status: OrderStatus, arrivingToday = false): string {
  if (status === 'delivered') return 'Delivered on'
  return arrivingToday ? 'Arriving today' : 'Estimated Delivery'
}

/**
 * The thank-you page's own status union, mapped onto this one.
 *
 * Kept as a pure function rather than a rename so that page and its context
 * stay untouched; migrating it later is a matter of deleting this.
 */
export function fromFulfillmentStatus(
  status: 'order_placed' | 'jewelry_creation' | 'packing_qc' | 'shipped' | 'out_for_delivery',
): OrderStatus {
  switch (status) {
    case 'order_placed':     return 'placed'
    case 'jewelry_creation': return 'creation'
    case 'packing_qc':       return 'packing'
    default:                 return status
  }
}
