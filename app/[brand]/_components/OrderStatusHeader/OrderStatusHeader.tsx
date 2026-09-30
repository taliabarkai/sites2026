'use client'

import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'
import { deliveryDateLabel, type OrderStatus } from '../../_lib/orderStatus'
import styles from './OrderStatusHeader.module.css'

export interface OrderStatusHeaderIcons {
  CheckmarkIcon:   React.ComponentType<IconProps>
  GiftIcon:        React.ComponentType<IconProps>
  DeliveryBoxIcon: React.ComponentType<IconProps>
  ShippingIcon:    React.ComponentType<IconProps>
}

interface OrderStatusHeaderProps {
  status:      OrderStatus
  headline:    string
  /** The quiet line under the headline, e.g. "It's on its way to you, Dana." */
  subhead?:    string
  orderNumber: string
  orderDate:   string
  /** "Oct 6, 2026" — the year is dropped in the panel, kept here in full. */
  estDeliveryDate:     string
  /** "Tuesday" */
  estDeliveryWeekday?: string
  arrivingToday?: boolean
  icons: OrderStatusHeaderIcons
}

/** "Oct 6, 2026" → "Oct 6". The year is set on its own line beneath it. */
function withoutYear(date: string): string {
  return date.split(',')[0].trim()
}

/** "Oct 6, 2026" → "2026", or nothing when the date carries no year. */
function yearOf(date: string): string | null {
  const parts = date.split(',')
  return parts.length > 1 ? parts[parts.length - 1].trim() : null
}

/**
 * Where an order stands, at a glance.
 *
 * Two halves either side of a rule: what the order is on the left, when it
 * arrives on the right — or, on a phone, stacked and centred with the rule
 * running between them. The date is the one thing a shopper opens this page
 * to read, so it is the largest thing on the card either way.
 */
export function OrderStatusHeader({
  status, headline, subhead, orderNumber, orderDate, estDeliveryDate, estDeliveryWeekday,
  arrivingToday = false, icons,
}: OrderStatusHeaderProps) {
  /* Chosen from the status rather than passed in, so every surface showing a
     given status shows the same mark. Only icons that exist in all five brand
     sets are used. */
  const StatusIcon = {
    placed:           icons.CheckmarkIcon,
    creation:         icons.GiftIcon,
    packing:          icons.DeliveryBoxIcon,
    shipped:          icons.DeliveryBoxIcon,
    out_for_delivery: icons.ShippingIcon,
    delivered:        icons.CheckmarkIcon,
  }[status]

  return (
    <section className={styles.card} aria-labelledby="order-status-title">
      <div className={styles.split}>
        {/* Badge above the headline at every width; only the alignment and
            the arrival panel's position change between them. */}
        <div className={styles.titleRow}>
          <span className={styles.badge} aria-hidden="true">
            <StatusIcon size={22} color="var(--colors-text-inverse)" />
          </span>
          <h1 id="order-status-title" className={styles.title}>{headline}</h1>
        </div>

        <div className={styles.main}>
          {subhead && <p className={styles.subhead}>{subhead}</p>}
          <p className={styles.meta}>
            <span className={styles.metaLabel}>Order Number:</span>{' '}
            <span className={styles.metaValue}>#{orderNumber}</span>
          </p>
          <p className={styles.meta}>
            <span className={styles.metaLabel}>Order Date:</span>{' '}
            <span className={styles.metaValue}>{orderDate}</span>
          </p>
        </div>

        <div className={styles.eta}>
          <p className={styles.etaLabel}>{deliveryDateLabel(status, arrivingToday)}</p>
          {estDeliveryWeekday && <p className={styles.etaDay}>{estDeliveryWeekday}</p>}
          <p className={styles.etaDate}>{withoutYear(estDeliveryDate)}</p>
          {yearOf(estDeliveryDate) && (
            <p className={styles.etaYear}>{yearOf(estDeliveryDate)}</p>
          )}
        </div>
      </div>
    </section>
  )
}
