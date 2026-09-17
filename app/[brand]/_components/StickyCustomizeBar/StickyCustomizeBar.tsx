'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import { PanelPortal } from '../PanelPortal'
import styles from './StickyCustomizeBar.module.css'

export interface StickyCustomizeBarProps {
  /** The element whose visibility drives the bar — normally the add-to-bag CTA. */
  watch: React.RefObject<HTMLElement | null>
  /** Scrolled into view when the bar is used. */
  target: React.RefObject<HTMLElement | null>
  label?: string
}

/**
 * Slides in once the add-to-bag CTA has scrolled out of view above the fold, and
 * back out when the shopper reaches it again. Tapping it returns them to the
 * personalisation form.
 */
export function StickyCustomizeBar({
  watch,
  target,
  label = 'Continue customization',
}: StickyCustomizeBarProps) {
  const [visible, setVisible] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = watch.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only show once the CTA has passed above the viewport, not when it is
        // still below the fold on first load.
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0
        setVisible(scrolledPast)
      },
      // Treat the CTA as "reached" a little before it is flush with the bar.
      { threshold: 0, rootMargin: '0px 0px -80px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [watch])

  const handleClick = () => {
    target.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PanelPortal>
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
