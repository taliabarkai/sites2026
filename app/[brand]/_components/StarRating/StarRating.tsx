'use client'

import type { ComponentType } from 'react'
import { usePathname } from 'next/navigation'
import { getBrandFromPathname } from '../../_config/brands'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './StarRating.module.css'

// Brand-scoped icons — resolved at runtime per the icon rules (never hardcode a brand).
const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

export interface StarRatingProps {
  /** Average rating (0–5). Fractional values render as partially filled stars. */
  rating: number
  /** Total number of reviews, shown in parentheses after the stars. */
  reviewCount?: number
  /**
   * Brand-scoped star icon. Optional — when omitted the component resolves
   * `BRAND_ICONS[brand].StarIcon` from the current route itself.
   */
  StarIcon?: ComponentType<{ size?: number }>
  /** Extra class merged onto the root (spacing tweaks per consumer). */
  className?: string
}

/**
 * Shared 5-star rating row — used by the category product card, the floating
 * cart item row, and anywhere else a compact rating is needed.
 *
 * Supports half (or any fractional) fill: the empty portion shows in grey
 * (`--border-color`); the filled portion overlays it, clipped to the fill width.
 */
export function StarRating({ rating, reviewCount, StarIcon, className }: StarRatingProps) {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const Star = StarIcon ?? BRAND_ICONS[brand].StarIcon

  // Snap to the nearest half so partial ratings render as clean half stars
  const rounded = Math.round(rating * 2) / 2

  return (
    <div className={[styles.rating, className].filter(Boolean).join(' ')}>
      <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fillPx = Math.max(0, Math.min(1, rounded - i)) * 16
          return (
            <span key={i} className={styles.star}>
              <span className={styles.starEmpty}>
                <Star size={16} />
              </span>
              {fillPx > 0 && (
                <span className={styles.starFilled} style={{ width: `${fillPx}px` }}>
                  <Star size={16} />
                </span>
              )}
            </span>
          )
        })}
      </span>
      {reviewCount != null && (
        <span className={styles.ratingCount}>({reviewCount.toLocaleString()})</span>
      )}
    </div>
  )
}
