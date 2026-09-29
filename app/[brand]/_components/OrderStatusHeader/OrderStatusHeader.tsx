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
  orderNumber: string
  orderDate:   string
  /** "Oct 6, 2026" — the year is dropped in the panel, kept here in full. */
  estDeliveryDate:     string
  /** "Tuesday" */
  estDeliveryWeekday?: string
  arrivingToday?: boolean
  icons: OrderStatusHeaderIcons
  /** A quiet text link, not a button: the card states, it does not prompt. */
  link?: { label: string; href?: string; onClick?: () => void }
}

/** "Oct 6, 2026" → "Oct 6". The label above already says which date it is. */
function withoutYear(date: string): string {
  return date.split(',')[0].trim()
}

/**
 * Where an order stands, at a glance.
 *
 * Two halves either side of a rule: what the order is on the left, when it
 * arrives on the right. The date is the one thing a shopper opens this page
 * to read, so it is the largest thing on the card.
 */
export function OrderStatusHeader({
  status, headline, orderNumber, orderDate, estDeliveryDate, estDeliveryWeekday,
  arrivingToday = false, icons, link,
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
        <div className={styles.titleRow}>
          <span className={styles.badge} aria-hidden="true">
            <StatusIcon size={22} color="var(--colors-text-inverse)" />
          </span>

          <div className={styles.main}>
            <h1 id="order-status-title" className={styles.title}>{headline}</h1>
            <p className={styles.meta}>
              <span className={styles.metaLabel}>Order Number:</span>{' '}
              <span className={styles.metaValue}>{orderNumber}</span>
            </p>
            <p className={styles.meta}>
              <span className={styles.metaLabel}>Order Date:</span>{' '}
              <span className={styles.metaValue}>{orderDate}</span>
            </p>
            {link && (
              link.href ? (
                <a className={styles.link} href={link.href}>{link.label}</a>
              ) : (
                <button type="button" className={styles.link} onClick={link.onClick}>
                  {link.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className={styles.eta}>
          <p className={styles.etaLabel}>{deliveryDateLabel(status, arrivingToday)}</p>
          {estDeliveryWeekday && <p className={styles.etaDay}>{estDeliveryWeekday}</p>}
          <p className={styles.etaDate}>{withoutYear(estDeliveryDate)}</p>
        </div>
      </div>
    </section>
  )
}
