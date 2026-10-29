'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import { PanelPortal } from '../PanelPortal'
import { useScrollRange } from '../../_lib/useScrollRange'
import styles from './StickyProductBar.module.css'

export interface StickyProductBarProps {
  /**
   * The bar comes up once this has scrolled out above the viewport — the PDP's
   * desktop gallery.
   */
  watch: React.RefObject<HTMLElement | null>
  /**
   * A stretch of the page the bar stays down for while it's on screen, from
   * the top of `from` to the bottom of `to` — say, the selections through the
   * inline CTA, which already does the bar's job there.
   */
  hideOver?: { from: React.RefObject<HTMLElement | null>; to: React.RefObject<HTMLElement | null> }
  title: string
  /** Display price, already formatted. */
  price: string
  label: string
  onClick: () => void
}

/**
 * Desktop's sticky CTA: a bottom bar with the product's title and price stacked
 * on the left and the CTA on the right. Hidden on landing; slides up once the
 * shopper has scrolled past the gallery, and back down when they return to it.
 */
export function StickyProductBar({ watch, hideOver, title, price, label, onClick }: StickyProductBarProps) {
  const [pastWatch, setPastWatch] = useState(false)
  const range = useScrollRange(hideOver?.from, hideOver?.to ?? watch)
  const visible = pastWatch && range !== 'in'
  const barRef = useRef<HTMLDivElement>(null)
  // The bar's own height, held after the footer so it never covers the page's
  // last lines. Measured rather than derived: the title and price can wrap.
  const [spacerHeight, setSpacerHeight] = useState(0)

  useEffect(() => {
    const el = watch.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      setPastWatch(!entry.isIntersecting && entry.boundingClientRect.top < 0)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [watch])

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    // Zero below desktop, where the bar is display: none
    const observer = new ResizeObserver(() => setSpacerHeight(bar.offsetHeight))
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  return (
    <PanelPortal>
      <div aria-hidden="true" style={{ height: spacerHeight }} />
      <div
        ref={barRef}
        className={`${styles.bar} ${visible ? styles.barVisible : ''}`}
        inert={!visible}
      >
        <div className={styles.inner}>
          <div className={styles.info}>
            <p className={styles.title}>{title}</p>
            <p className={styles.price}>{price}</p>
          </div>
          <Button variant="add-to-cart" className={styles.button} onClick={onClick}>
            {label}
          </Button>
        </div>
      </div>
    </PanelPortal>
  )
}
