'use client'

import { useId, useState } from 'react'
import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'
import type { TrackedOrderItem } from '../../_lib/getTrackedOrder'
import styles from './OrderSummary.module.css'

interface OrderSummaryProps {
  items: TrackedOrderItem[]
  /** All minor units (cents). */
  subtotal: number
  shipping: number
  tax:      number
  total:    number
  /** Omitted or zero and the line is left out, as on the confirmation page. */
  promoDiscount?: number
  /**
   * Folds the item list behind the title. The confirmation page shows the
   * order it has just taken in full; the tracker is a page you come back to,
   * where the totals are the answer and the items are the detail.
   */
  collapsible?: boolean
  defaultOpen?: boolean
  /** Required when collapsible, for the chevron and the discount tag. */
  icons?: {
    ChevronIcon?: React.ComponentType<IconProps>
    CouponIcon?:  React.ComponentType<IconProps>
  }
  className?: string
}

function formatPrice(cents: number): string {
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}

/** What was bought and what it cost — the thank-you page's summary card. */
export function OrderSummary({
  items, subtotal, shipping, tax, total, promoDiscount = 0,
  collapsible = false, defaultOpen = false, icons, className,
}: OrderSummaryProps) {
  const listId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const ChevronIcon = icons?.ChevronIcon
  const CouponIcon  = icons?.CouponIcon
  const showItems   = !collapsible || open

  return (
    <section
      className={[styles.card, className].filter(Boolean).join(' ')}
      aria-labelledby="order-summary-title"
    >
      <div className={styles.head}>
        {collapsible && ChevronIcon ? (
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen(o => !o)}
          >
            <h2 id="order-summary-title" className={styles.sectionTitle}>Order Summary</h2>
            <span className={open ? styles.chevronOpen : styles.chevronClosed} aria-hidden="true">
              <ChevronIcon size={24} />
            </span>
          </button>
        ) : (
          <h2 id="order-summary-title" className={styles.sectionTitle}>Order Summary</h2>
        )}
        <p className={styles.itemCount}>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
      </div>

      <ul id={listId} className={styles.itemList} hidden={!showItems}>
        {items.map((item, index) => (
          /* Keyed by position — the same product can appear twice with
             different personalisation. */
          <li key={`${item.name}-${index}`} className={styles.item}>
            <div className={styles.itemTop}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name} className={styles.itemImage} loading="lazy" />
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
              </div>
            </div>

            {item.attributes.length > 0 && (
              <dl className={styles.attributes}>
                {item.attributes.map(attribute => (
                  <div key={attribute.label} className={styles.attributeRow}>
                    <dt className={styles.attributeLabel}>{attribute.label}:</dt>
                    <dd className={styles.attributeValue}>{attribute.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>

      <dl className={styles.totals}>
        <div className={styles.totalRow}>
          <dt>Subtotal:</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className={styles.totalRow}>
          <dt>Shipping:</dt>
          <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
        </div>
        {promoDiscount > 0 && (
          <div className={styles.totalRow}>
            <dt>Promotional Discounts:</dt>
            <dd className={styles.discount}>
              {CouponIcon && <CouponIcon size={16} />}
              −{formatPrice(promoDiscount)}
            </dd>
          </div>
        )}
        <div className={styles.totalRow}>
          <dt>Tax:</dt>
          <dd>{formatPrice(tax)}</dd>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <dt>Order Total:</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </section>
  )
}
