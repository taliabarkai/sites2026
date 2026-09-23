import type { CartItem } from '../_context/CartContext'

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

/** Cart size the error preview is pinned to, so the shared link is deterministic. */
export const ERROR_PREVIEW_CART_SIZE = 2
