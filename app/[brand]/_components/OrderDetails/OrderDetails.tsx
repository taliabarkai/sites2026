'use client'

import type { ReactNode } from 'react'
import styles from './OrderDetails.module.css'

interface OrderDetailsProps {
  contact:         { email: string; phone: string }
  shippingAddress: { name: string; line1: string; cityStateZip: string }
  /** Already parsed upstream — never a raw backend string. */
  shippingMethod:  { name: string; estimate: string }
  paymentMethod:   { label: string }
  /**
   * Masks the middle of the phone number. On a page anyone can reach with an
   * order number and an email, the full number is more than the reader needs
   * to recognise their own order.
   */
  maskPhone?: boolean
  /**
   * Keeps the four groups in one column. The two-column grid needs room the
   * narrow side column does not have.
   */
  stacked?: boolean
  /** Optional line under the grid, e.g. a link to Contact Us. */
  footer?: ReactNode
  className?: string
}

/**
 * Keeps the last four digits and the area code, hides the rest:
 * "(516) 555-9476" becomes "(516) •••-9476". Anything that does not look like
 * a phone number is left alone rather than mangled.
 */
export function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return phone
  const area = digits.slice(0, 3)
  const last = digits.slice(-4)
  return `(${area}) •••-${last}`
}

/** Contact, address, shipping and payment — the thank-you page's details card. */
export function OrderDetails({
  contact, shippingAddress, shippingMethod, paymentMethod,
  maskPhone = false, stacked = false, footer, className,
}: OrderDetailsProps) {
  const phone = maskPhone ? maskPhoneNumber(contact.phone) : contact.phone

  return (
    <section
      className={[styles.card, className].filter(Boolean).join(' ')}
      aria-labelledby="order-details-title"
    >
      <h2 id="order-details-title" className={styles.sectionTitle}>Order Details</h2>

      <div className={`${styles.grid} ${stacked ? styles.gridStacked : ''}`}>
        <div className={styles.col}>
          <div className={styles.group}>
            <h3 className={styles.heading}>Contact Information</h3>
            <p className={styles.line}>{contact.email}</p>
            <p className={styles.line}>{phone}</p>
          </div>
          <div className={styles.group}>
            <h3 className={styles.heading}>Shipping Address</h3>
            <p className={styles.line}>{shippingAddress.name}</p>
            <p className={styles.line}>{shippingAddress.line1}</p>
            <p className={styles.line}>{shippingAddress.cityStateZip}</p>
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.group}>
            <h3 className={styles.heading}>Shipping Method</h3>
            <p className={styles.line}>{shippingMethod.name}</p>
            <p className={styles.line}>{shippingMethod.estimate}</p>
          </div>
          <div className={styles.group}>
            <h3 className={styles.heading}>Payment Method</h3>
            <p className={styles.line}>{paymentMethod.label}</p>
          </div>
        </div>
      </div>

      {footer && <p className={styles.footer}>{footer}</p>}
    </section>
  )
}
