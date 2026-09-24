'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { PanelPortal } from '../../PanelPortal'
import { getBrandFromPathname, type BrandKey } from '../../../_config/brands'
import {
  FLOWS,
  FLOW_LABELS,
  getBrandFeatures,
  getFlowConfig,
  type Flow,
} from '../../../_config/flow'
import {
  FLOW_PARAM,
  WARRANTY_PARAM,
  WARRANTY_VARIANTS,
  readFlow,
  readWarrantyVariant,
} from '../../../_config/demoParams'
import styles from './FlowControls.module.css'

interface FlowControlsProps {
  brand: BrandKey
  /** Closes the cart before navigating away from a page the flow has removed. */
  onNavigate?: () => void
}

/**
 * The presenter's control, in the floating cart header where the journey starts.
 *
 * Flow is the parent: it is what the three phases exist to compare, so it stays
 * a segmented control at the top level. Warranty is a design choice *within* a
 * phase, so it nests under a dropdown — and disappears entirely on a brand with
 * no warranty to design.
 *
 * Both live in the URL, and each writes only its own keys, so the checkout's
 * own control can set items, state and gifting without either clobbering the
 * other.
 */
export function FlowControls({ brand, onNavigate }: FlowControlsProps) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const flow     = readFlow(searchParams)
  const warranty = readWarrantyVariant(searchParams)
  const hasWarranty = getBrandFeatures(brand).warranty

  const [menuOpen, setMenuOpen] = useState(false)
  const [anchor, setAnchor]     = useState<{ top: number; right: number } | null>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  /** Rewrites only the keys given; everything else on the URL survives. */
  const setParams = useCallback((next: Record<string, string>, path?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(next)) params.set(key, value)
    const query = params.toString()
    const target = path ?? pathname
    router.push(query ? `${target}?${query}` : target, { scroll: false })
  }, [router, pathname, searchParams])

  /**
   * Switching to a phase without a cart page while standing on one would leave
   * the shopper on a page that flow does not have, so move them on to checkout
   * — carrying the bag and the settings with them.
   */
  const selectFlow = (next: Flow) => {
    // Picking a phase is the end of the errand: close so the shopper can get on
    // with the flow they just chose. The warranty toggle stays open, since
    // flipping between its two designs is a comparison you make repeatedly.
    setMenuOpen(false)

    const leavingCartPage = pathname.endsWith('/cart') && !getFlowConfig(next).hasCartPage
    if (leavingCartPage) {
      onNavigate?.()
      setParams({ [FLOW_PARAM]: String(next) }, `/${brand}/checkout`)
      return
    }
    setParams({ [FLOW_PARAM]: String(next) })
  }

  /**
   * The panel hangs off the trigger's right edge, which is what you want until
   * the trigger sits near the left of a narrow viewport — right-aligning a
   * 280px panel to it then runs the panel off the left of the screen. So the
   * right edge is pushed rightwards far enough to keep the whole panel in
   * view. Panel width is only known once it has mounted, hence the second
   * pass below; 280 (its min-width) is the first-pass stand-in.
   */
  const measure = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect()
    if (!r) return
    const gutter = 12
    const width = panelRef.current?.getBoundingClientRect().width ?? 280
    const rightEdge = Math.max(
      r.right,
      Math.min(window.innerWidth - gutter, gutter + width),
    )
    setAnchor({ top: r.bottom + 8, right: window.innerWidth - rightEdge })
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    measure()
    // PanelPortal mounts a frame late, so the first measure has no panel to
    // read. Re-measure once it is there and the clamp uses its real width.
    const frame = requestAnimationFrame(() => requestAnimationFrame(measure))

    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return
      setMenuOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // Stop the cart's own Escape handler closing the whole panel underneath.
      e.stopPropagation()
      setMenuOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [menuOpen, measure])

  return (
    <div className={styles.controls}>
      {/* One control, not two. The trigger names the phase it is on — "P1"
          alone said nothing about what the phase actually does. */}
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(open => !open)}
      >
        {FLOW_LABELS[flow].name}
        <span className={styles.caret} aria-hidden="true" />
      </button>

      {menuOpen && anchor && (
        <PanelPortal>
          <div
            ref={panelRef}
            className={styles.menu}
            style={{ top: anchor.top, right: anchor.right }}
            role="group"
            aria-label="Prototype flow settings"
          >
            {/* The flow is the parent choice: it decides which pages exist at
                all, so it comes first and everything under it is a setting
                within whatever it selects. */}
            <span className={styles.menuLabel} id="flow-phase-label">Checkout flow</span>
            <div className={styles.phaseList} role="group" aria-labelledby="flow-phase-label">
              {FLOWS.map(f => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={flow === f}
                  className={`${styles.phase} ${flow === f ? styles.phaseActive : ''}`}
                  onClick={() => selectFlow(f)}
                >
                  <span className={styles.phaseName}>{FLOW_LABELS[f].name}</span>
                  <span className={styles.phaseSummary}>{FLOW_LABELS[f].summary}</span>
                </button>
              ))}
            </div>

            <span className={styles.menuLabel} id="flow-warranty-label">Warranty design</span>
            {hasWarranty ? (
              <div className={styles.menuRow} role="group" aria-labelledby="flow-warranty-label">
                {WARRANTY_VARIANTS.map(v => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={warranty === v}
                    onClick={() => setParams({ [WARRANTY_PARAM]: v })}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : (
              <p className={styles.menuNote}>Not available on LAL</p>
            )}
          </div>
        </PanelPortal>
      )}
    </div>
  )
}
