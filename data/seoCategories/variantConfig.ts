import type { BrandKey } from '../../app/[brand]/_config/brands'

export type SeoCategoryVariant = 'with-image' | 'text-only'

/**
 * Controls which SEO category variant each brand renders.
 *
 * Top-level key: brand key (e.g. 'oal', 'lal')
 * Value: variant for ALL category pages in that brand
 *        — OR —
 * An object mapping specific category slugs to variants,
 * with a `_default` key as the fallback for unspecified pages.
 *
 * Examples:
 *   oal: 'with-image'                          → all OAL pages use with-image
 *   lal: 'text-only'                           → all LAL pages use text-only
 *   tgr: { _default: 'with-image', necklaces: 'text-only' }
 *        → TGR necklaces page uses text-only, all other TGR pages use with-image
 */
export type BrandVariantConfig =
  | SeoCategoryVariant
  | { _default: SeoCategoryVariant; [categorySlug: string]: SeoCategoryVariant }

export const seoCategoryVariantConfig: Record<BrandKey, BrandVariantConfig> = {
  oal: 'with-image',   // OAL keeps the image variant everywhere
  tgr: 'with-image',   // fallback until confirmed
  lal: 'text-only',    // LAL uses pills everywhere
  ib:  'with-image',   // fallback until confirmed
  mnn: 'with-image',   // fallback until confirmed
}

/**
 * Returns the correct SEO category variant for the given brand and optional
 * category slug. Falls back to 'with-image' for unrecognised brands.
 */
export function getSeoCategoryVariant(
  brand: string,
  categorySlug?: string
): SeoCategoryVariant {
  const config = seoCategoryVariantConfig[brand as BrandKey] ?? 'with-image'

  if (typeof config === 'string') return config

  return (categorySlug ? config[categorySlug] : undefined) ?? config._default
}
