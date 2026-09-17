'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { PanelPortal } from '../../PanelPortal'
import { formatPrice, type GiftOption } from './types'
import styles from './GiftingOptions.module.css'

interface GiftOptionsInfoPanelProps {
  options: GiftOption[]
  onClose: () => void
}

/**
 * Read-only companion to the checkout drawer: shows what gift packaging is
 * available, with no way to add it. Used from the product page USP list.
 */
export function GiftOptionsInfoPanel({ options, onClose }: GiftOptionsInfoPanelProps) {
  const titleId  = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  // Double rAF: the portal must commit with the closed transform before we flip,
  // otherwise the panel renders already-open and the slide-in never plays.
  useEffect(() => {
    let inner = 0
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setOpen(true)) })
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Focus trap
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const focusables = () => Array.from(
      panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
    ).filter(el => el.offsetParent !== null)

    focusables()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (list.length === 0) return
      const first = list[0]
      const last  = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    panel.addEventListener('keydown', onKeyDown)
    return () => panel.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <PanelPortal>
      <div
        className={`${styles.drawerOverlay} ${open ? styles.drawerOverlayVisible : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`${styles.infoPanel} ${open ? styles.infoPanelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className={styles.infoClose}
          aria-label="Close gift options"
          onClick={onClose}
        >
          ✕
        </button>

        <div className={styles.infoHeader}>
          <h2 id={titleId} className={styles.infoTitle}>Gift options available at checkout</h2>
        </div>

        <div className={styles.infoScroll}>
          <div className={styles.infoContent}>
            <ul className={styles.infoList}>
              {options.map(option => (
                <li key={option.id} className={styles.infoRow}>
                  <span className={styles.infoImageWrap}>
                    <img src={option.imageUrl} alt="" aria-hidden="true" className={styles.infoImage} />
                  </span>
                  <span className={styles.infoBody}>
                    <span className={styles.infoName}>{option.name}</span>
                    <span className={styles.infoPrice}>{formatPrice(option.price)}</span>
                    <span className={styles.infoDescription}>{option.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PanelPortal>
  )
}
