import type { ComponentType } from 'react'
import type { ProductItem } from '../../../data/products'

// ─── TGR-only: product review ratings ──────────────────────────────────────
// Shared by every category template so the same demo ratings render on the
// product cards regardless of layout variant. Values span 3.5–4.9; several
// land on a half (.4/.7 round to a half star, rendered with a grey empty
// portion). Indexed by product id for stable, repeatable output.
const TGR_RATINGS = [4.9, 4.4, 3.5, 4.7, 3.9, 4.8, 4.2, 4.5, 3.7, 4.6, 4.0, 4.3, 4.1, 3.8, 4.9, 3.6]
const TGR_REVIEW_COUNTS = [467, 476, 15, 312, 89, 203, 128, 54, 247, 183, 76, 421, 38, 162, 509, 94]

type StarIconType = ComponentType<{ size?: number }>

type TgrRatingProps =
  | { rating: number; reviewCount: number; StarIcon: StarIconType }
  | Record<string, never>

/**
 * Returns the review-star props for a ProductCard — only for the TGR and LAL
 * brands. For every other brand it returns an empty object, so the rating
 * row is omitted. Spread the result onto `<ProductCard {...} />`.
 */
export function tgrRatingProps(
  brand: string,
  product: ProductItem,
  StarIcon: StarIconType,
): TgrRatingProps {
  if (brand !== 'tgr' && brand !== 'lal') return {}
  return {
    rating: TGR_RATINGS[product.id % TGR_RATINGS.length]!,
    reviewCount: TGR_REVIEW_COUNTS[product.id % TGR_REVIEW_COUNTS.length]!,
    StarIcon,
  }
}
