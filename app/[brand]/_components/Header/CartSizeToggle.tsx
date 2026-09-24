'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { PanelPortal } from '../PanelPortal'
import { useCart } from '../../_context/CartContext'
import { getBrandFromPathname } from '../../_config/brands'
import { getDemoCartItems, isDemoCart, ERROR_PREVIEW_CART_SIZE } from '../../_config/demoCart'
import {
  CART_SIZE_PARAM,
  DEMO_CART_SIZES,
  GIFTING_VARIANTS,
  GIFTING_VARIANT_PARAM,
  STATE_PARAM,
  readCartSize,
  readGiftingVariant,
  readIsErrorState,
} from '../../_config/demoParams'
import styles from './Header.module.css'

/**
 * Demo controls, checkout only. Two controls, not one:
 *
 *  · The gifting variant is what this prototype exists to compare, so it stays
 *    a segmented control at the top level, one button per variant.
 *  · Cart size and the error state are scenarios to demo *within* a variant
 *    rather than the thing being compared, so they fold into a dropdown.
 *
 * All three live in the URL (`?gifting=v2&items=3&state=error`) so a
 * configuration can be linked rather than described — and so the variant
 * survives the refresh that the error state itself asks the shopper for.
 */
export function CartSizeToggle({ className }: { className?: string }) {
  const { items, replaceItems } = useCart()
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const brand   = getBrandFromPathname(pathname)
  const variant = readGiftingVariant(searchParams)
  const isError = readIsErrorState(searchParams)
  const urlSize = readCartSize(searchParams)

  // The bag is the brand's own, so the gifting section sees that brand's items
  // — and, where the brand has them, that item's gift options.
  const demoItems = getDemoCartItems(brand)

  const [menuOpen, setMenuOpen] = useState(false)
  // Where to pin the portalled panel: measured from the trigger, in viewport
  // coordinates, because the panel no longer shares its offset parent.
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  /** Rewrites only the keys given; anything else already on the URL survives. */
  const setParams = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value === null) params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  // The URL is the source of truth for the bag, so a shared link lands on what
  // it describes. Says nothing, and whatever is in the bag stands.
  //
  // Identity, not length: switching brand at the same cart size has to swap the
  // products too, or a brand whose options live on its items keeps the previous
  // brand's items and stops reading as item-bound.
  useEffect(() => {
    // No size in the URL, but the bag is plainly a demo bag: keep its size and
    // re-point it at this brand's products. That is what makes switching theme
    // swap the bag rather than stranding the previous brand's items in it.
    const size = urlSize ?? (isDemoCart(items) ? items.length : null)
    if (size === null) return
    const want = demoItems.slice(0, size)
    const same = items.length === want.length && want.every((w, i) => items[i]?.id === w.id)
    if (!same) replaceItems(want)
    // demoItems is rebuilt each render from static config; keying the effect on
    // it would re-run this on every render and fight the shopper's own edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSize, items, replaceItems, brand])

  /** Viewport coordinates of the spot just under the trigger's right edge. */
  const measure = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect()
    if (r) setAnchor({ top: r.bottom + 8, right: window.innerWidth - r.right })
  }, [])

  // ── Dropdown position and dismissal ─────────────────────────────────────────
  useEffect(() => {
    if (!menuOpen) return
    measure()

    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node
      // The panel is portalled, so it is no longer a descendant of the trigger.
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [menuOpen, measure])

  const count = urlSize ?? items.length

  const showSize = (n: number) => setParams({ [CART_SIZE_PARAM]: String(n), [STATE_PARAM]: null })

  // Pin the bag alongside the flag so the error preview always renders the same
  // checkout, whoever opens the link.
  const showError = () => setParams({
    [CART_SIZE_PARAM]: String(ERROR_PREVIEW_CART_SIZE),
    [STATE_PARAM]:     'error',
  })

  return (
    <div className={styles.demoControls}>
      {/* ── Gifting variant — the comparison, so it stays in the open ── */}
      <div className={className} role="group" aria-label="Gifting variant">
        <span aria-hidden="true">Gifting</span>
        {GIFTING_VARIANTS.map(key => (
          <button
            key={key}
            type="button"
            aria-label={`Show gifting variant ${key.toUpperCase()}`}
            aria-pressed={variant === key}
            onClick={() => setParams({ [GIFTING_VARIANT_PARAM]: key })}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Scenario — states to demo within a variant, so they fold away ── */}
      <div className={styles.scenarioMenu}>
        <div className={className}>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="Demo scenario"
            onClick={() => setMenuOpen(open => !open)}
          >
            {isError ? 'Error' : `Cart ${count}`}
            <span className={styles.scenarioCaret} aria-hidden="true" />
          </button>
        </div>

        {/* Portalled to the theme root. The checkout bar's switcher carries a
            transform, which makes a stacking context that traps this panel
            under the page's sticky chrome however high its z-index — the same
            trap PanelPortal exists to sidestep for the gifting panels. */}
        {menuOpen && anchor && (
        <PanelPortal>
          <div
            ref={panelRef}
            className={styles.scenarioPanel}
            style={{ top: anchor.top, right: anchor.right }}
            role="group"
            aria-label="Demo scenario"
          >
            <span className={styles.scenarioLabel} id="demo-cart-size">Items in cart</span>
            <div className={styles.scenarioRow} role="group" aria-labelledby="demo-cart-size">
              {DEMO_CART_SIZES.map(n => (
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
            </div>

            <span className={styles.scenarioLabel} id="demo-state">Page state</span>
            <div className={styles.scenarioRow} role="group" aria-labelledby="demo-state">
              <button
                type="button"
                aria-pressed={!isError}
                onClick={() => setParams({ [STATE_PARAM]: null })}
              >
                Normal
              </button>
              <button
                type="button"
                aria-label="Preview the checkout error state"
                aria-pressed={isError}
                onClick={showError}
              >
                Error
              </button>
            </div>
          </div>
        </PanelPortal>
        )}
      </div>
    </div>
  )
}
