'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useOptionIcons } from './useOptionIcons'
import styles from './ProductOptions.module.css'

export interface ScrollRowProps {
  /** The group label, with the arrows beside it. */
  label: ReactNode
  /** Props for the scrolling row itself — role, aria-labelledby. */
  rowProps?: React.HTMLAttributes<HTMLDivElement>
  /** Extra class for the row (per-tile slide widths). */
  rowClassName?: string
  children: ReactNode
}

/**
 * One horizontal row that scrolls with CSS scroll-snap (swipe on touch).
 * ← → arrows appear only when the row overflows, and disable at either end.
 */
export function ScrollRow({ label, rowProps, rowClassName, children }: ScrollRowProps) {
  const { ArrowIcon } = useOptionIcons()
  const rowRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ overflows: false, atStart: true, atEnd: true })

  const measure = useCallback(() => {
    const el = rowRef.current
    if (!el) return
    const overflows = el.scrollWidth > el.clientWidth + 1
    setEdges({
      overflows,
      atStart: el.scrollLeft <= 1,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
    })
  }, [])

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    el.addEventListener('scroll', measure, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', measure)
    }
  }, [measure])

  const scroll = (direction: 1 | -1) => {
    const el = rowRef.current
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className={styles.group}>
      <div className={styles.labelRow}>
        {label}
        {edges.overflows && (
          <div className={styles.arrows}>
            <button
              type="button"
              className={`${styles.arrow} ${styles.arrowPrev}`}
              aria-label="Scroll back"
              disabled={edges.atStart}
              onClick={() => scroll(-1)}
            >
              <ArrowIcon size={24} />
            </button>
            <button
              type="button"
              className={styles.arrow}
              aria-label="Scroll forward"
              disabled={edges.atEnd}
              onClick={() => scroll(1)}
            >
              <ArrowIcon size={24} />
            </button>
          </div>
        )}
      </div>
      <div ref={rowRef} {...rowProps} className={`${styles.scrollRow} ${rowClassName ?? ''}`}>
        {children}
      </div>
    </div>
  )
}
