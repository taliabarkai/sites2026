'use client'

import Link from 'next/link'
import styles from './HighlightsBar.module.css'

export interface HighlightItem {
  label: string
  href: string
  image: string
}

export interface HighlightsBarProps {
  items: HighlightItem[]
  /** Labels the scroll region for assistive tech. Defaults to "Shop by highlight". */
  ariaLabel?: string
  className?: string
}

/**
 * Mobile-only highlights bar — a horizontally scrolling row of circular
 * category shortcuts in the shape of Instagram story highlights. Hidden from
 * the `md` breakpoint up, where the homepage's category grid covers the same
 * ground. Each circle is a plain link to a category page.
 */
export function HighlightsBar({ items, ariaLabel = 'Shop by highlight', className }: HighlightsBarProps) {
  if (items.length === 0) return null

  return (
    <nav className={[styles.bar, className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
      <ul className={styles.track}>
        {/* Keyed by position — a brand may repeat a label across two entries */}
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className={styles.item}>
            <Link href={item.href} className={styles.link}>
              <span className={styles.ring}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className={styles.image} loading="lazy" />
              </span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
