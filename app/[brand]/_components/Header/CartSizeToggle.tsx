'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useCart } from '../../_context/CartContext'
import { DEMO_CART_ITEMS, ERROR_PREVIEW_CART_SIZE } from '../../_config/demoCart'

/**
 * Demo control, checkout only: swaps the bag between one, two and three items,
 * and exposes the checkout error state as a fourth, linkable preview.
 *
 * The gifting flow branches on cart size (a single item skips item selection),
 * so both shapes need to be reachable without hand-editing localStorage.
 *
 * The error preview is driven by `?state=error` rather than local state so the
 * view survives a refresh and can be shared as a link for QA and design review.
 */

export function CartSizeToggle({ className }: { className?: string }) {
  const { items, replaceItems } = useCart()
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const count     = items.length
  const isError   = searchParams.get('state') === 'error'

  /** Rewrites `state` without touching any other param already on the URL. */
  const setState = (value: string | null) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set('state', value)
    else next.delete('state')

    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const showSize = (n: number) => {
    replaceItems(DEMO_CART_ITEMS.slice(0, n))
    setState(null)
  }

  const showError = () => {
    // Pin the bag so the error preview always renders the same checkout.
    replaceItems(DEMO_CART_ITEMS.slice(0, ERROR_PREVIEW_CART_SIZE))
    setState('error')
  }

  return (
    <div className={className} role="group" aria-label="Demo cart size">
      {/* Labelled so the control never reads as a live cart count */}
      <span aria-hidden="true">Cart</span>
      {([1, 2, 3] as const).map(n => (
        <button
          key={n}
          type="button"
          aria-label={`Set cart to ${n} ${n === 1 ? 'item' : 'items'}`}
          aria-pressed={!isError && count === n}
          onClick={() => showSize(n)}
        >
          {n}
        </button>
      ))}

      <span aria-hidden="true" data-toggle-divider />

      <button
        type="button"
        aria-label="Preview the checkout error state"
        aria-pressed={isError}
        onClick={showError}
      >
        Error
      </button>
    </div>
  )
}
