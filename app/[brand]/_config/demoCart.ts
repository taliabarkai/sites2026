import { lalProducts } from '../../../data/products'
import type { BrandKey } from './brands'
import type { CartItem } from '../_context/CartContext'
import type { BrandGiftOption } from './giftOptions'

/**
 * Stand-in bag for the demo checkout. Shared by the header's cart-size control
 * and the `?state=error` preview, so a shared preview link lands on the same
 * checkout the toggle produces rather than an empty one.
 */

const CDN = 'https://cdn.oakandluna.com/digital-asset/product/'

export const DEMO_CART_ITEMS: CartItem[] = [
  {
    id: 'demo-willow-tag',
    name: 'Willow Tag Initial Necklace with Diamond — Gold Vermeil',
    price: 13000,
    image: `${CDN}lock-luna-charm-with-round-cut-moissanite-gold-vermeil-6.jpg`,
    isPersonalized: true,
  },
  {
    id: 'demo-engraved-compass',
    name: 'Engraved Compass Necklace with Diamond — Gold Vermeil',
    price: 15000,
    image: `${CDN}engraved-comprass-necklace-gold-vermeil-1.jpg`,
    isPersonalized: true,
  },
  {
    id: 'demo-singapore-chain',
    name: 'Singapore Chain Name Necklace — Gold Vermeil',
    price: 11000,
    image: `${CDN}singapore-chain-name-necklace-gold-vermeil-8.jpg`,
    isPersonalized: true,
  },
]

// ── LAL — Lime and Lou ───────────────────────────────────────────────────────
// LAL stocks no shared packaging catalog. Each product has one gift note card
// whose design mirrors that product's own artwork, so the note travels with the
// item rather than with the brand: it is written onto the cart line here, and
// the gifting section resolves `item.giftOptions ?? brandGiftOptions`.

const LAL_NOTE_CDN = 'https://cdn.limeandlou.com/digital-asset/product/'

/** $5 flat, and the card is the image, the name and the price — no description. */
const LAL_GIFT_NOTE_PRICE = 500

/** Keyed by the product id it belongs to in `lalProducts`. */
const LAL_GIFT_NOTES: Record<number, BrandGiftOption> = {
  17: {
    id:    'lal-note-music-memory',
    name:  'Custom Music Memory Gift Note',
    price: LAL_GIFT_NOTE_PRICE,
    image: `${LAL_NOTE_CDN}custom-music-memory-gift-note-2.jpg`,
  },
  3: {
    id:    'lal-note-watercolor',
    name:  'Custom Watercolor Gift Note',
    price: LAL_GIFT_NOTE_PRICE,
    image: `${LAL_NOTE_CDN}custom-watercolor-gift-note-1.jpg`,
  },
  2: {
    id:    'lal-note-pop',
    name:  'Custom Pop Gift Note',
    price: LAL_GIFT_NOTE_PRICE,
    image: `${LAL_NOTE_CDN}custom-pop-squad-gift-note-1.jpg`,
  },
}

/**
 * Cart order for the 1/2/3-item toggle. Prices and imagery come from the LAL
 * product fixture, so the bag and the catalog can never disagree.
 */
const LAL_CART_PRODUCT_IDS = [17, 3, 2]

const LAL_DEMO_CART_ITEMS: CartItem[] = LAL_CART_PRODUCT_IDS.map(id => {
  const product = lalProducts.find(p => p.id === id)
  if (!product) throw new Error(`LAL demo cart: no product ${id} in the LAL fixture`)

  return {
    id:             `demo-lal-${id}`,
    name:           product.name,
    price:          product.priceInCents ?? 0,
    image:          product.image,
    isPersonalized: true,
    giftOptions:    [LAL_GIFT_NOTES[id]],
  }
})

const DEMO_CART_BY_BRAND: Partial<Record<BrandKey, CartItem[]>> = {
  lal: LAL_DEMO_CART_ITEMS,
}

/** The demo bag for a brand. Brands without one of their own share the default. */
export function getDemoCartItems(brand: BrandKey): CartItem[] {
  return DEMO_CART_BY_BRAND[brand] ?? DEMO_CART_ITEMS
}

const ALL_DEMO_ITEM_IDS = new Set(
  [...DEMO_CART_ITEMS, ...LAL_DEMO_CART_ITEMS].map(item => item.id),
)

/**
 * Whether this bag is a demo bag — any brand's.
 *
 * Lets a brand switch re-point the bag at the new brand's equivalent without
 * touching a cart the shopper actually built, which has ids of its own.
 */
export function isDemoCart(items: { id: string }[]): boolean {
  return items.length > 0 && items.every(item => ALL_DEMO_ITEM_IDS.has(item.id))
}

/** Cart size the error preview is pinned to, so the shared link is deterministic. */
export const ERROR_PREVIEW_CART_SIZE = 2
