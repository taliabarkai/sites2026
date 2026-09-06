'use client'

import { useCart, type CartItem } from '../../_context/CartContext'

/**
 * Demo control, checkout only: swaps the bag between one, two and three items.
 * The gifting flow branches on cart size (a single item skips item selection),
 * so both shapes need to be reachable without hand-editing localStorage.
 */

const CDN = 'https://cdn.oakandluna.com/digital-asset/product/'

const DEMO_ITEMS: CartItem[] = [
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

export function CartSizeToggle({ className }: { className?: string }) {
  const { items, replaceItems } = useCart()
  const count = items.length

  return (
    <div className={className} role="group" aria-label="Demo cart size">
      {/* Labelled so the control never reads as a live cart count */}
      <span aria-hidden="true">Cart</span>
      {([1, 2, 3] as const).map(n => (
        <button
          key={n}
          type="button"
          aria-label={`Set cart to ${n} ${n === 1 ? 'item' : 'items'}`}
          aria-pressed={count === n}
          onClick={() => replaceItems(DEMO_ITEMS.slice(0, n))}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
