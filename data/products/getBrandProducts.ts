import { brandProducts, type ProductItem } from './index'

/**
 * Returns the product list for the given brand.
 * Falls back to OAL if the brand key is unrecognised.
 */
export function getBrandProducts(brand: string): ProductItem[] {
  return brandProducts[brand as keyof typeof brandProducts] ?? brandProducts.oal
}
