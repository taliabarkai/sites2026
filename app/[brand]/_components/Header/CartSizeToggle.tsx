'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { PanelPortal } from '../PanelPortal'
import { useCart } from '../../_context/CartContext'
import { useDemoCartSync } from '../../_context/useDemoCartSync'
import { getBrandFromPathname } from '../../_config/brands'
import { getDemoCartItems, ERROR_PREVIEW_CART_SIZE } from '../../_config/demoCart'
import { getFlowConfig } from '../../_config/flow'
import {
  CART_SIZE_PARAM,
  DEMO_CART_SIZES,
  GIFTING_VARIANTS,
  GIFTING_VARIANT_PARAM,
  STATE_PARAM,
  readCartSize,
  readFlow,
  readGiftingVariant,
  readIsErrorState,
} from '../../_config/demoParams'
import styles from './Header.module.css'

interface DropdownProps {
  /** What the closed control reads — the value, so the header states it. */
  label: string
  /** Names the control for anyone who cannot see which value it holds. */
  title: string
  className?: string
  /** Given a way to close, so choosing a value can dismiss the panel. */
  children: (close: () => void) => React.ReactNode
}

/**
 * One scenario control: a pill that opens a small panel.
 *
 * Portalled and pinned in viewport coordinates — the checkout bar's switcher
 * carries a transform, which makes a stacking context that would otherwise bury
 * this panel under the page's sticky chrome however high its z-index.
 */
function Dropdown({ label, title, className, children }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const measure = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect()
    if (r) setAnchor({ top: r.bottom + 8, right: window.innerWidth - r.right })
  }, [])

  useEffect(() => {
    if (!open) return
    measure()

    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
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
  }, [open, measure])

  return (
    <div className={styles.scenarioMenu}>
      <div className={className}>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          aria-label={title}
          onClick={() => setOpen(o => !o)}
        >
          {label}
          <span className={styles.scenarioCaret} aria-hidden="true" />
        </button>
      </div>

      {open && anchor && (
        <PanelPortal>
          <div
            ref={panelRef}
            className={styles.scenarioPanel}
            style={{ top: anchor.top, right: anchor.right }}
            role="group"
            aria-label={title}
          >
            {children(() => setOpen(false))}
          </div>
        </PanelPortal>
      )}
    </div>
  )
}

/**
 * Demo controls, checkout only. Three, each owning one thing:
 *
 *  · Gifting — the design being compared, so it stays open as a segmented
 *    control. Absent in the flows that gift on the cart page instead.
 *  · Items — how many lines are in the bag.
 *  · Page state — normal, or the checkout's error preview.
 *
 * All of it lives in the URL (`?gifting=v2&items=3&state=error`) so a
 * configuration can be linked rather than described, and each control writes
 * only its own keys — the floating cart's flow and warranty survive untouched.
 */
export function CartSizeToggle({ className }: { className?: string }) {
  const { items, replaceItems } = useCart()
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const brand   = getBrandFromPathname(pathname)
  const variant = readGiftingVariant(searchParams)
  // Phases 1 and 2 put gifting on the cart page, so this control has nothing to
  // switch here — it is hidden rather than left sitting inert.
  const giftingInCheckout = getFlowConfig(readFlow(searchParams)).gifting === 'checkout'
  const isError = readIsErrorState(searchParams)
  const urlSize = readCartSize(searchParams)

  // The bag is the brand's own, so the gifting section sees that brand's items
  // — and, where the brand has them, that item's gift options.
  const demoItems = getDemoCartItems(brand)

  useDemoCartSync()

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

  const count = urlSize ?? items.length

  const showSize = (n: number) => setParams({ [CART_SIZE_PARAM]: String(n) })

  // Pin the bag alongside the flag so the error preview always renders the same
  // checkout, whoever opens the link.
  const showError = () => setParams({
    [CART_SIZE_PARAM]: String(ERROR_PREVIEW_CART_SIZE),
    [STATE_PARAM]:     'error',
  })

  return (
    <div className={styles.demoControls}>
      {/* ── Gifting variant — only where there is a gifting section to vary ── */}
      {giftingInCheckout && (
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
      )}

      {/* ── How many lines are in the bag ── */}
      <Dropdown label={`Items ${count}`} title="Items in cart" className={className}>
        {close => (
          <div className={styles.scenarioRow}>
            {DEMO_CART_SIZES.map(n => (
              <button
                key={n}
                type="button"
                aria-label={`Set cart to ${n} ${n === 1 ? 'item' : 'items'}`}
                aria-pressed={count === n}
                onClick={() => { showSize(n); close() }}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </Dropdown>

      {/* ── Normal, or the checkout's error preview ── */}
      <Dropdown label={isError ? 'Error' : 'Normal'} title="Page state" className={className}>
        {close => (
          <div className={styles.scenarioRow}>
            <button
              type="button"
              aria-pressed={!isError}
              onClick={() => { setParams({ [STATE_PARAM]: null }); close() }}
            >
              Normal
            </button>
            <button
              type="button"
              aria-label="Preview the checkout error state"
              aria-pressed={isError}
              onClick={() => { showError(); close() }}
            >
              Error
            </button>
          </div>
        )}
      </Dropdown>
    </div>
  )
}
