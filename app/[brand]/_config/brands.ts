export const BRANDS = [
  { key: 'oal', label: 'Oak and Luna', shortLabel: 'OAL' },
  { key: 'tgr', label: 'Theo Grace', shortLabel: 'TGR' },
  { key: 'lal', label: 'Lime and Lou', shortLabel: 'LAL' },
  { key: 'ib', label: 'Israel Blessing', shortLabel: 'IB' },
  { key: 'mnn', label: 'MYKA', shortLabel: 'MNN' },
] as const

export type BrandKey = (typeof BRANDS)[number]['key']

export const VALID_BRANDS: BrandKey[] = BRANDS.map((brand) => brand.key)

export function isBrandKey(value: string): value is BrandKey {
  return VALID_BRANDS.includes(value as BrandKey)
}

export function resolveBrand(value: string | undefined, fallback: BrandKey = 'oal'): BrandKey {
  return value && isBrandKey(value) ? value : fallback
}

export function getBrandFromPathname(pathname: string): BrandKey {
  const segment = pathname.split('/').filter(Boolean)[0]
  return resolveBrand(segment)
}

/** Keep the current route path when switching brand (e.g. /oal/category → /tgr/category). */
export function buildBrandPath(pathname: string, brand: BrandKey): string {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return `/${brand}`
  }

  if (isBrandKey(segments[0])) {
    segments[0] = brand
    return `/${segments.join('/')}`
  }

  return `/${brand}${pathname.startsWith('/') ? pathname : `/${pathname}`}`
}

export function getBrandMeta(brand: BrandKey) {
  return BRANDS.find((entry) => entry.key === brand) ?? BRANDS[0]
}
