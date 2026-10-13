'use client'

import type { CSSProperties } from 'react'
import { Button } from '../Button'
import type { QuickAddProduct } from '../QuickAddPanel'
import styles from './HotspotPopover.module.css'

export interface HotspotPopoverProps {
  id: string
  product: QuickAddProduct
  isOpen: boolean
  /** Which side of the dot the popover sits on. */
  side?: 'left' | 'right'
  /** Dot position (% of the image) — the popover anchors beside it. */
  x: number
  y: number
  /** "Shop Now" — opens the Shop The Look panel. */
  onShopNow?: () => void
  /** Makes "Shop Now" a link to this page instead (V4: the product's PDP). */
  shopNowHref?: string
}

function formatCents(cents: number, currency = '$'): string {
  return `${currency}${(cents / 100).toFixed(0)}`
}

/**
 * Hover / focus popover for a hotspot dot: 180px product image, then title,
 * price and a "Shop Now" link that opens the Shop The Look panel. Always
 * mounted so it can fade; hidden popovers are `visibility: hidden`, so they're
 * out of the tab order.
 */
export function HotspotPopover({ id, product, isOpen, side = 'right', x, y, onShopNow, shopNowHref }: HotspotPopoverProps) {
  return (
    <div
      id={id}
      role="group"
      aria-label={product.title}
      className={`${styles.popover} ${side === 'left' ? styles.left : styles.right} ${isOpen ? styles.open : ''}`}
      // --pin-x lets the CSS cap the width to the room beside the dot
      style={{ left: `${x}%`, top: `${y}%`, '--pin-x': `${x}%` } as CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.images[0]?.src} alt="" className={styles.thumb} loading="lazy" />

      <div className={styles.info}>
        <p className={styles.name}>{product.title}</p>
        <div className={styles.prices}>
          {product.salePrice && (
            <span className={styles.priceOriginal}>{formatCents(product.salePrice, product.currency)}</span>
          )}
          <span className={styles.price}>{formatCents(product.price, product.currency)}</span>
        </div>
        {shopNowHref ? (
          <Button variant="link" className={styles.shopNow} href={shopNowHref}>
            Shop Now
          </Button>
        ) : (
          <Button variant="link" className={styles.shopNow} aria-haspopup="dialog" onClick={onShopNow}>
            Shop Now
          </Button>
        )}
      </div>
    </div>
  )
}
