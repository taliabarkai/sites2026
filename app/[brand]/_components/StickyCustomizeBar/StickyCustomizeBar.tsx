'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import { PanelPortal } from '../PanelPortal'
import { useScrollRange } from '../../_lib/useScrollRange'
import styles from './StickyCustomizeBar.module.css'

export interface StickyCustomizeBarProps {
  /** The element whose visibility drives the bar — normally the add-to-bag CTA. */
  watch: React.RefObject<HTMLElement | null>
  /**
   * Step aside for the whole stretch from this element down to `watch` (say,
   * the selections after the metal, through the CTA), not just the CTA.
   */
  watchFrom?: React.RefObject<HTMLElement | null>
  /** Scrolled into view when the bar is used. */
  target?: React.RefObject<HTMLElement | null>
  /** Replaces the scroll back to `target` — e.g. opening a panel. */
  onClick?: () => void
  /**
   * Also show the bar while the CTA is still below the fold, so it is up from
   * the moment the page lands and only steps aside while the CTA is on screen.
   */
  showBelowFold?: boolean
  label?: string
}

/**
 * Slides in once the add-to-bag CTA has scrolled out of view above the fold, and
 * back out when the shopper reaches it again. Tapping it returns them to the
 * personalisation form. With `showBelowFold` it is up whenever the CTA is off
 * screen, either side.
 */
export function StickyCustomizeBar({
  watch,
  watchFrom,
  target,
  onClick,
  showBelowFold = false,
  label = 'Continue customization',
}: StickyCustomizeBarProps) {
  // Below-the-fold mode starts up, so the bar is there on landing rather than
  // sliding in a beat later
  const [visible, setVisible] = useState(showBelowFold)
  const barRef = useRef<HTMLDivElement>(null)

  // With a stretch to watch, its position drives the bar instead of the CTA's.
  // The 80px inset matches the CTA observer's below.
  const range = useScrollRange(watchFrom, watch, 80)
  useEffect(() => {
    if (range) setVisible(range === 'above' || (showBelowFold && range === 'below'))
  }, [range, showBelowFold])

  useEffect(() => {
    const el = watch.current
    if (!el || watchFrom) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // By default only show once the CTA has passed above the viewport, not
        // when it is still below the fold on first load.
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0
        setVisible(showBelowFold ? !entry.isIntersecting : scrolledPast)
      },
      // Treat the CTA as "reached" a little before it is flush with the bar.
      { threshold: 0, rootMargin: '0px 0px -80px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [watch, watchFrom, showBelowFold])

  const handleClick = () => {
    if (onClick) onClick()
    else target?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PanelPortal>
      {/* Up below the fold means up at the very end too: hold the bar's height
          after the footer (the portal lands at the end of the themed root) so
          it never covers the page's last lines */}
      {showBelowFold && <div className={styles.spacer} aria-hidden="true" />}
      <div
        ref={barRef}
        className={`${styles.bar} ${visible ? styles.barVisible : ''}`}
        inert={!visible}
      >
        <Button variant="add-to-cart" className={styles.button} onClick={handleClick}>
          {label}
        </Button>
      </div>
    </PanelPortal>
  )
}
