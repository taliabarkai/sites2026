import type { BrandKey } from './brands'

export interface CategoryTile {
  label: string
  href: string
  image: string
}

/**
 * Shop-by-category tiles: the homepage's category grid and the mobile menu
 * carousel. Every tile points at the category page.
 */
export function getCategoryTiles(brand: BrandKey): CategoryTile[] {
  return [
    { label: 'Necklaces', href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/NECKLACES_banner_HP_OAL.jpg' },
    { label: 'Bracelets', href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/Bracelets-banner_HP_OAL.jpg' },
    { label: 'Earrings',  href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/EARRINGS_banner_HP_OAL.jpg' },
    { label: 'Rings',     href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/RINGS-banner_HP_OAL.jpg' },
  ]
}
