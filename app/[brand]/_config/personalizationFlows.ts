import type { BrandKey } from './brands'

/**
 * The personalization flows. Each one lives on one URL per theme (switching
 * theme in the header swaps the product along).
 *
 * The earlier two, listed on /[brand]/flows:
 *   simple   /[brand]/product/simple-personalization — the single-name necklace:
 *            the live preview's V2 (gallery preview + new layout), the gallery
 *            first on mobile
 *   custom   /[brand]/product/custom-personalization — jewelry with several
 *            options driving the preview (initials and stones, names and
 *            diamonds) and LAL's Music Memories; everything on the page
 *
 * The final three, listed on /[brand]/final-flows. Every theme, and each one
 * takes simple and complex products alike: however many options a product
 * has, the flow stays the same.
 *   v1       /[brand]/product/final-flow/v1 — Simple Personalization's layout:
 *            gallery first, sticky on mobile while the shopper fills the form
 *   v2       /[brand]/product/final-flow/v2 — V1 with the breadcrumbs, name,
 *            price and reviews above the gallery on mobile (the live preview's V2)
 *   v3       /[brand]/product/final-flow/v3 — Custom Personalization's Option 1
 *            as OAL had it: the gallery scrolls away and the preview docks at the
 *            top once the shopper's own design comes in
 *   poc      /[brand]/product/final-flow/poc — Final-Poc: V2 with its switch
 *            fixed to B2, restyled (the choice in view filled black; Gallery
 *            with an image icon)
 *
 * Only the themes a flow has been built for appear in the header's theme
 * dropdown on its pages.
 */
export type PersonalizationFlow = 'simple' | 'custom' | FinalFlow
export type FinalFlow = 'v1' | 'v2' | 'v3' | 'poc'

export const FINAL_FLOWS: FinalFlow[] = ['v1', 'v2', 'v3', 'poc']
/** V2 and the Final-Poc built on it: the header above the gallery, the preview / photos switch */
export const isV2Flow = (flow: string | undefined) => flow === 'v2' || flow === 'poc'
export const isFinalFlow = (flow: string | undefined): flow is FinalFlow => FINAL_FLOWS.includes(flow as FinalFlow)

const ALL_BRANDS: BrandKey[] = ['oal', 'tgr', 'lal', 'ib', 'mnn']

export const PERSONALIZATION_FLOWS: Record<PersonalizationFlow, { segment: string; label: string; brands: BrandKey[] }> = {
  simple: { segment: 'simple-personalization', label: 'Simple Personalization', brands: ['oal', 'tgr', 'ib', 'mnn'] },
  custom: { segment: 'custom-personalization', label: 'Custom Personalization', brands: ['oal', 'tgr', 'lal'] },
  v1: { segment: 'final-flow/v1', label: 'Flow V1', brands: ALL_BRANDS },
  v2: { segment: 'final-flow/v2', label: 'Flow V2', brands: ALL_BRANDS },
  v3: { segment: 'final-flow/v3', label: 'Flow V3', brands: ALL_BRANDS },
  poc: { segment: 'final-flow/poc', label: 'Final-Poc', brands: ALL_BRANDS },
}

/** A flow page's URL: the theme's flow product, or (custom, the final flows) any product under it. */
export const flowPath = (brand: BrandKey, flow: PersonalizationFlow, productId?: number) =>
  `/${brand}/product/${PERSONALIZATION_FLOWS[flow].segment}${productId !== undefined ? `/${productId}` : ''}`

/** Which flow a path is on, and the product id when the URL names one. */
export function personalizationFlowOf(pathname: string): { flow: PersonalizationFlow; productId?: number } | undefined {
  const m = /\/product\/(simple-personalization|custom-personalization|final-flow\/(?:v[123]|poc))(?:\/(\d+))?\/?$/.exec(pathname)
  if (!m) return undefined
  const flow = (Object.keys(PERSONALIZATION_FLOWS) as PersonalizationFlow[]).find((f) => PERSONALIZATION_FLOWS[f].segment === m[1])!
  return { flow, productId: m[2] ? Number(m[2]) : undefined }
}
