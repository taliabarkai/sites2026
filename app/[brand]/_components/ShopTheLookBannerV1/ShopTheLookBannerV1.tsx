'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { getBrandFromPathname } from '../../_config/brands'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './ShopTheLookBannerV1.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

export interface ShopTheLookBannerV1Props {
  image: string
  imageAlt: string
  /** Small line above the heading — the tile's original headline (e.g. "Stack Em Up"). */
  eyebrow?: string
  /** h4 heading above the CTA; pass `null` for a CTA-only banner (V2). */
  heading?: string | null
  ctaLabel?: string
  /** Opens the Shop The Look panel. Not used when `ctaAsLabel` is set. */
  onOpen?: () => void
  /** Render the CTA as a non-interactive label (V3 desktop: hover reveals the dots). */
  ctaAsLabel?: boolean
  /** Fade the CTA out while the banner is hovered or has focus inside (V3 desktop). */
  hideCtaOnHover?: boolean
  /** Overlay layered above the image and copy (V3 desktop: hotspot dots + popovers). */
  children?: ReactNode
  className?: string
}

/**
 * V1 of the Shop The Look tile: the same banner image with no hotspots, a
 * heading overlay and a bottom-left CTA that opens the Shop The Look panel.
 * Sizes itself exactly like HotspotImage (natural height on mobile, fills the
 * grid cell with a cover crop from 1440px) so swapping variants never shifts
 * the grid.
 */
export function ShopTheLookBannerV1({
  image,
  imageAlt,
  eyebrow,
  heading = 'Shop The Look',
  ctaLabel = 'Shop The Look',
  onOpen,
  ctaAsLabel = false,
  hideCtaOnHover = false,
  children,
  className,
}: ShopTheLookBannerV1Props) {
  const { ShoppingBagIcon } = BRAND_ICONS[getBrandFromPathname(usePathname())]

  return (
    // The whole image is a mouse shortcut to the panel; the CTA is the
    // keyboard / screen-reader affordance.
    <div
      className={[styles.root, ctaAsLabel && styles.static, hideCtaOnHover && styles.hideCtaOnHover, className]
        .filter(Boolean).join(' ')}
      onClick={ctaAsLabel ? undefined : onOpen}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={imageAlt} className={styles.image} loading="lazy" />

      <div className={styles.content}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        {heading && <h4 className={styles.heading}>{heading}</h4>}
        {/* CTA — the product card's Quick-Add bag button, widened to hold the label */}
        {ctaAsLabel ? (
          <span className={styles.cta}>
            <span className={styles.ctaIcon} aria-hidden="true">
              <ShoppingBagIcon size={20} />
            </span>
            <span className={styles.ctaLabel}>{ctaLabel}</span>
          </span>
        ) : (
          <button
            type="button"
            className={styles.cta}
            aria-haspopup="dialog"
            onClick={(e) => {
              e.stopPropagation()
              onOpen?.()
            }}
          >
            <span className={styles.ctaIcon} aria-hidden="true">
              <ShoppingBagIcon size={20} />
            </span>
            <span className={styles.ctaLabel}>{ctaLabel}</span>
          </button>
        )}
      </div>

      {children}
    </div>
  )
}
