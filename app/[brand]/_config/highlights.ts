import type { BrandKey } from './brands'

/** One circle in the mobile highlights bar. The href is added per brand at use. */
export interface HighlightContent {
  label: string
  image: string
}

/**
 * Oak and Luna — category-led, using the July carousel imagery.
 */
const OAL_HIGHLIGHTS: HighlightContent[] = [
  { label: 'Earrings',    image: 'https://cdn.oakandluna.com/digital-asset/banners/oal-carousel_earrings_july26.jpg' },
  { label: 'Necklaces',   image: 'https://cdn.oakandluna.com/digital-asset/banners/oal-carousel_necklace_july26.jpg' },
  { label: 'Accessories', image: 'https://cdn.oakandluna.com/digital-asset/banners/oal-carousel_bags_july26.jpg' },
  { label: 'Bracelets',   image: 'https://cdn.oakandluna.com/digital-asset/banners/oal-carousel_bracelet_july26.jpg' },
]

/**
 * Lime and Lou — occasion-led rather than category-led, matching the brand's
 * custom-canvas catalog.
 */
const LAL_HIGHLIGHTS: HighlightContent[] = [
  { label: 'For the Music Lovers', image: 'https://cdn.limeandlou.com/digital-asset/hp/mm_cat_carou.png' },
  { label: 'Anniversary Gifts',    image: 'https://cdn.limeandlou.com/digital-asset/product/aquadream-custom-canvas-12.jpg' },
  { label: 'Family Portraits',     image: 'https://cdn.limeandlou.com/digital-asset/category-banners/FOR_FAMILY.png' },
  { label: 'Paws & Memories',      image: 'https://cdn.limeandlou.com/digital-asset/category-banners/FOR_PET.png' },
]

/**
 * Shared by Theo Grace, Israel Blessing and MYKA — a mix of collection and
 * category shortcuts on TGR imagery.
 */
const TGR_HIGHLIGHTS: HighlightContent[] = [
  { label: 'New Arrivals',            image: 'https://cdn.theograce.com/digital-asset/banners/category_promo1_saltwater.jpg' },
  { label: 'Nicky Hilton’s Favorites', image: 'https://cdn.theograce.com/digital-asset/banners/2506_Charmed_Collection_Landing_Page_IMG03.jpg' },
  { label: 'Earrings',                image: 'https://cdn.theograce.com/digital-asset/banners/04-%20Rings%20and%20Earrings.jpg?w=640' },
  { label: 'Necklaces',               image: 'https://cdn.theograce.com/digital-asset/banners/02-%20Necklaces.jpg' },
  { label: 'Bracelets',               image: 'https://cdn.theograce.com/digital-asset/banners/03-%20Bracelets.jpg' },
  { label: 'Best Sellers',            image: 'https://cdn.theograce.com/digital-asset/banners/Bracelets_box2.jpg' },
  { label: 'Accessories',             image: 'https://cdn.theograce.com/digital-asset/product/secret-garden-bag-charm-6.jpg' },
]

/** Highlights per brand. */
export const BRAND_HIGHLIGHTS: Record<BrandKey, HighlightContent[]> = {
  oal: OAL_HIGHLIGHTS,
  lal: LAL_HIGHLIGHTS,
  tgr: TGR_HIGHLIGHTS,
  ib:  TGR_HIGHLIGHTS,
  mnn: TGR_HIGHLIGHTS,
}
