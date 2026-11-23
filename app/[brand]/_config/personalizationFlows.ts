import type { BrandKey } from './brands'

/**
 * The personalization flows — the two finished product-page flows, each on one
 * URL per theme (switching theme in the header swaps the product along):
 *
 *   simple   /[brand]/product/simple-personalization — the single-name necklace:
 *            the live preview's V2 (gallery preview + new layout), the gallery
 *            first on mobile
 *   custom   /[brand]/product/custom-personalization — jewelry with several
 *            options driving the preview (initials and stones, names and
 *            diamonds) and LAL's Music Memories; everything on the page
 *
 * Only the themes a flow has been built for appear in the header's theme
 * dropdown on its pages. The other prototypes (the live preview's V1–V6 and
 * the rest) are listed beside these on /[brand]/flows.
 */
export type PersonalizationFlow = 'simple' | 'custom'

export const PERSONALIZATION_FLOWS: Record<PersonalizationFlow, { segment: string; label: string; brands: BrandKey[] }> = {
  simple: { segment: 'simple-personalization', label: 'Simple Personalization', brands: ['oal', 'tgr', 'ib', 'mnn'] },
  custom: { segment: 'custom-personalization', label: 'Custom Personalization', brands: ['oal', 'tgr', 'lal'] },
}

/** A flow page's URL: the theme's flow product, or (custom) any product under it. */
export const flowPath = (brand: BrandKey, flow: PersonalizationFlow, productId?: number) =>
  `/${brand}/product/${PERSONALIZATION_FLOWS[flow].segment}${productId !== undefined ? `/${productId}` : ''}`

/** Which flow a path is on, and the product id when the URL names one. */
export function personalizationFlowOf(pathname: string): { flow: PersonalizationFlow; productId?: number } | undefined {
  const m = /\/product\/(simple-personalization|custom-personalization)(?:\/(\d+))?\/?$/.exec(pathname)
  if (!m) return undefined
  return { flow: m[1] === 'simple-personalization' ? 'simple' : 'custom', productId: m[2] ? Number(m[2]) : undefined }
}
