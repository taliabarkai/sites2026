import type { ProductItem } from '../../../../data/products'
import type { QuickAddProduct } from '../QuickAddPanel'

/** Parse a display price string like "$135" into integer cents. */
function priceStringToCents(value?: string): number | undefined {
  if (!value) return undefined
  const digits = value.replace(/[^0-9.]/g, '')
  if (!digits) return undefined
  return Math.round(parseFloat(digits) * 100)
}

/**
 * Adapt a `ProductItem` (the shape stored in the products registry) into the
 * `QuickAddProduct` shape the hotspot Quick-Add drawer already expects, so the
 * gallery and personalization fields render exactly as they do for hotspots.
 *
 * The option set mirrors the brand's PDP buy options (metal, engraving, chain
 * length) — the first value of each option is the pre-selected default and
 * carries a 0 price offset so the drawer total matches the card price.
 */
export function toQuickAddProduct(product: ProductItem): QuickAddProduct {
  const images = [
    { src: product.image, alt: product.name },
    ...(product.hoverImage ? [{ src: product.hoverImage, alt: product.name }] : []),
  ]

  return {
    title: product.name,
    price: product.priceInCents ?? priceStringToCents(product.price) ?? 0,
    salePrice: priceStringToCents(product.originalPrice),
    currency: '$',
    rating: product.rating,
    reviewCount: product.reviewCount,
    images,
    pdpUrl: product.href,
    options: [
      {
        name: 'Metal',
        type: 'swatch',
        values: [
          { label: 'Gold Vermeil', value: 'vermeil', color: 'var(--gold-vermeil-18k)', price: 0 },
          { label: 'Sterling Silver', value: 'silver', color: 'var(--sterling-silver-925)', price: -1000 },
          { label: 'Solid 14k Gold', value: 'solid-14k', color: 'var(--solid-gold-14k)', price: 5000 },
          { label: 'Rose Gold', value: 'rose', color: 'var(--rose-gold-14k)', price: 1500 },
        ],
      },
      { name: 'Engrave a name or message', type: 'text-input', maxLength: 12, placeholder: 'e.g. Sofia' },
      {
        name: 'Chain Length',
        type: 'pills',
        values: ['16"', '18"', '20"', '22"'].map((len) => ({ label: len, value: len })),
      },
    ],
  }
}
