import type { ComponentType } from 'react'
import type { ProductItem } from '../../../data/products'

type StarIconType = ComponentType<{ size?: number }>

type TgrRatingProps =
  | { rating: number; reviewCount: number; StarIcon: StarIconType }
  | Record<string, never>

/**
 * Returns the review-star props for a ProductCard — only for the TGR and LAL
 * brands. For every other brand it returns an empty object, so the rating row
 * is omitted. Spread the result onto `<ProductCard {...} />`.
 *
 * The numbers come from the product registry, the same source the PDP price row
 * and the PDP reviews section use, so one product reads the same everywhere.
 */
export function tgrRatingProps(
  brand: string,
  product: ProductItem,
  StarIcon: StarIconType,
): TgrRatingProps {
  if (brand !== 'tgr' && brand !== 'lal') return {}
  if (product.rating == null || product.reviewCount == null) return {}
  return {
    rating: product.rating,
    reviewCount: product.reviewCount,
    StarIcon,
  }
}
