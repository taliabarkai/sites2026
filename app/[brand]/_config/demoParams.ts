/**
 * Query parameters that describe a checkout demo configuration.
 *
 * The prototype's scenario switches live in the URL rather than in component
 * state so a specific configuration can be sent to a reviewer as a link —
 * and so the variant survives the page refresh that the error state's own
 * call to action asks for.
 *
 *   ?gifting=v2&items=3&state=error
 */

import { FLOWS, DEFAULT_FLOW, type Flow } from './flow'

export const GIFTING_VARIANTS = ['v1', 'v2'] as const

export type GiftingVariant = (typeof GIFTING_VARIANTS)[number]

/** The flow that shipped first; absent parameter means this one. */
export const DEFAULT_GIFTING_VARIANT: GiftingVariant = 'v1'

export const FLOW_PARAM            = 'flow'
export const WARRANTY_PARAM        = 'warranty'
export const GIFTING_VARIANT_PARAM = 'gifting'
export const CART_SIZE_PARAM       = 'items'
export const STATE_PARAM           = 'state'

/** Cart sizes the demo can be switched between. */
export const DEMO_CART_SIZES = [1, 2, 3] as const

/** The warranty add-on — hidden, or one of its two designs — owned by the floating cart's control. */
export const WARRANTY_VARIANTS = ['hidden', 'v1', 'v2'] as const

export type WarrantyVariant = (typeof WARRANTY_VARIANTS)[number]

export const DEFAULT_WARRANTY_VARIANT: WarrantyVariant = 'hidden'

interface ReadableParams {
  get(name: string): string | null
}

export function readFlow(params: ReadableParams): Flow {
  const raw = Number(params.get(FLOW_PARAM))
  return FLOWS.includes(raw as Flow) ? (raw as Flow) : DEFAULT_FLOW
}

export function readWarrantyVariant(params: ReadableParams): WarrantyVariant {
  const raw = params.get(WARRANTY_PARAM)?.toLowerCase()
  return WARRANTY_VARIANTS.includes(raw as WarrantyVariant)
    ? (raw as WarrantyVariant)
    : DEFAULT_WARRANTY_VARIANT
}

export function readGiftingVariant(params: ReadableParams): GiftingVariant {
  const raw = params.get(GIFTING_VARIANT_PARAM)?.toLowerCase()
  return GIFTING_VARIANTS.includes(raw as GiftingVariant)
    ? (raw as GiftingVariant)
    : DEFAULT_GIFTING_VARIANT
}

/**
 * The cart size the URL asks for, or null when it says nothing — in which case
 * whatever is already in the bag stands, as it did before the parameter existed.
 */
export function readCartSize(params: ReadableParams): number | null {
  const raw = Number(params.get(CART_SIZE_PARAM))
  return DEMO_CART_SIZES.includes(raw as (typeof DEMO_CART_SIZES)[number]) ? raw : null
}

export function readIsErrorState(params: ReadableParams): boolean {
  return params.get(STATE_PARAM) === 'error'
}

/**
 * The sale preview: one line in the bag marked down, and the saving carried
 * into every order summary. Shares the `state` key with the error preview —
 * both answer "show me this page in a particular state" — and the two are
 * mutually exclusive by construction, since one key holds one value.
 */
export function readIsSaleState(params: ReadableParams): boolean {
  return params.get(STATE_PARAM) === 'sale'
}

/**
 * Track My Order previews three outcomes rather than two, so it reads the
 * same key for a value rather than a flag. `readIsErrorState` stays as it is
 * for checkout, which only knows "error" — a `duplicate` there reads as no
 * error at all, which is the right answer for a page with no such state.
 */
export const TRACK_ORDER_STATES = ['default', 'error', 'duplicate'] as const

export type TrackOrderState = (typeof TRACK_ORDER_STATES)[number]

export function readTrackOrderState(params: ReadableParams): TrackOrderState {
  const value = params.get(STATE_PARAM)
  return value === 'error' || value === 'duplicate' ? value : 'default'
}

/**
 * The nested items Drawer demo: the products that show it — product 15 on
 * every brand, and product 18 on OAL — and how many companion products its
 * drawer holds (`?charms=6`).
 */
export function isNestedDrawerProduct(brand: string, productId: number): boolean {
  return productId === 15 || (brand === 'oal' && productId === 18)
}

export const NESTED_DRAWER_PARAM = 'charms'
export const NESTED_DRAWER_COUNTS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export const DEFAULT_NESTED_DRAWER_COUNT = 3

export function readNestedDrawerCount(params: ReadableParams): number {
  const raw = Number(params.get(NESTED_DRAWER_PARAM))
  return NESTED_DRAWER_COUNTS.includes(raw as (typeof NESTED_DRAWER_COUNTS)[number])
    ? raw
    : DEFAULT_NESTED_DRAWER_COUNT
}

/**
 * How the drawer's PDP trigger looks (`?trigger=link`): a bordered field, or a
 * text link with an arrow, set like the field labels above it.
 */
export const NESTED_TRIGGER_PARAM = 'trigger'
export const NESTED_TRIGGER_STYLES = ['field', 'link'] as const

export type NestedTriggerStyle = (typeof NESTED_TRIGGER_STYLES)[number]

export const DEFAULT_NESTED_TRIGGER_STYLE: NestedTriggerStyle = 'field'

export function readNestedTriggerStyle(params: ReadableParams): NestedTriggerStyle {
  const raw = params.get(NESTED_TRIGGER_PARAM)
  return NESTED_TRIGGER_STYLES.includes(raw as NestedTriggerStyle)
    ? (raw as NestedTriggerStyle)
    : DEFAULT_NESTED_TRIGGER_STYLE
}

/**
 * A path with the current demo configuration attached.
 *
 * Every internal step has to carry these forward: the whole point is that one
 * link is one configuration, and losing them mid-journey silently resets the
 * prototype to its defaults.
 */
export function withDemoParams(path: string, params: ReadableParams & { toString(): string }): string {
  const query = params.toString()
  return query ? `${path}?${query}` : path
}
