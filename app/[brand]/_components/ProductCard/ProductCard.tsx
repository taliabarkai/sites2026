'use client'

import Link from 'next/link'
import { useState, type ComponentType, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { getBrandFromPathname } from '../../_config/brands'
import { QuickAddPanel } from '../QuickAddPanel'
import type { QuickAddProduct } from '../QuickAddPanel'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './ProductCard.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

export interface ProductCardProps {
  name: string
  price: string
  originalPrice?: string
  defaultImage: string
  hoverImage?: string
  /** Material swatches shown above the product name. Each entry is a CSS
   *  color value (e.g. 'var(--sterling-silver-925)' or '#E2C385'). */
  swatches?: string[]
  href?: string
  className?: string
  /** Slot for badges/ribbons rendered on top of the image (positioned by the consumer). */
  children?: ReactNode
  /** Average rating (0–5). When provided together with `StarIcon`, a star
   *  rating row renders below the price. Half-star values are supported. */
  rating?: number
  /** Total number of reviews, shown in parentheses after the rating value. */
  reviewCount?: number
  /** Brand-scoped star icon — resolve via `BRAND_ICONS[brand].StarIcon`. */
  StarIcon?: ComponentType<{ size?: number }>
  /** When provided, a Quick-Add cart button overlays the image corner and
   *  opens the shared hotspot Quick-Add drawer with this product's data. */
  quickAddProduct?: QuickAddProduct
}

/** Renders 5 stars, supporting half (or any fractional) fill. The empty
 *  portion shows in grey (`--border-color`); the filled portion overlays it. */
function StarRating({
  rating,
  reviewCount,
  StarIcon,
}: {
  rating: number
  reviewCount?: number
  StarIcon: ComponentType<{ size?: number }>
}) {
  // Snap to the nearest half so partial ratings render as clean half stars
  const rounded = Math.round(rating * 2) / 2
  return (
    <div className={styles.rating}>
      <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const fillPx = Math.max(0, Math.min(1, rounded - i)) * 16
          return (
            <span key={i} className={styles.star}>
              <span className={styles.starEmpty}>
                <StarIcon size={16} />
              </span>
              {fillPx > 0 && (
                <span className={styles.starFilled} style={{ width: `${fillPx}px` }}>
                  <StarIcon size={16} />
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

export function ProductCard({
  name,
  price,
  originalPrice,
  defaultImage,
  hoverImage,
  swatches,
  href,
  className,
  children,
  rating,
  reviewCount,
  StarIcon,
  quickAddProduct,
}: ProductCardProps) {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  // Brand-scoped cart icon, resolved per the icon rules (never hardcode a brand).
  const { ShoppingBagIcon } = BRAND_ICONS[brand]

  // Mirrors the hotspot drawer's trigger: local open state + <QuickAddPanel>.
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  // Only enable the hover crossfade when a second image exists — otherwise the
  // single image would fade to the empty card background on hover.
  const classes = [styles.card, hoverImage && styles.hasHover, className].filter(Boolean).join(' ')

  return (
    <article className={classes}>
      <div className={styles.media}>
        <div className={styles.imageWrap}>
          <img
            src={defaultImage}
            alt={name}
            className={`${styles.image} ${styles.imageDefault}`}
            loading="lazy"
          />
          {hoverImage && (
            <img
              src={hoverImage}
              alt=""
              aria-hidden="true"
              className={`${styles.image} ${styles.imageHover}`}
              loading="lazy"
            />
          )}
          {children}
        </div>

        {quickAddProduct && (
          <button
            type="button"
            className={styles.quickAddBtn}
            aria-label="Add to cart"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setQuickAddOpen(true)
            }}
          >
            <ShoppingBagIcon size={20} />
          </button>
        )}
      </div>

      <div className={styles.info}>
        {swatches && swatches.length > 0 && (
          <ul className={styles.swatches} aria-label="Available materials">
            {swatches.map((color, i) => (
              <li
                key={i}
                className={`${styles.swatch}${i === 0 ? ` ${styles.swatchSelected}` : ''}`}
                style={{ backgroundColor: color }}
                aria-label={`Material option ${i + 1}`}
              />
            ))}
          </ul>
        )}
        <p className={styles.name}>{name}</p>
        {price && (
          <div className={styles.prices}>
            {originalPrice && (
              <span className={styles.priceOriginal}>{originalPrice}</span>
            )}
            <span className={styles.price}>{price}</span>
          </div>
        )}
        {rating != null && StarIcon && (
          <StarRating rating={rating} reviewCount={reviewCount} StarIcon={StarIcon} />
        )}
      </div>

      {/* Stretched link makes the whole card navigate to the PDP while leaving
          the Quick-Add button (higher z-index, not nested) independently clickable. */}
      {href && <Link href={href} className={styles.stretchedLink} aria-label={name} />}

      {quickAddProduct && (
        <QuickAddPanel
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          product={quickAddProduct}
        />
      )}
    </article>
  )
}
