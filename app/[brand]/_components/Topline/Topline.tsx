'use client'

import Link from 'next/link'
import styles from './Topline.module.css'

export interface ToplineProps {
  promoLeft?: string
  promoCenter?: string
  helpLabel?: string
  trackLabel?: string
  contactLabel?: string
  helpHref?: string
  trackHref?: string
  contactHref?: string
}

export function Topline({
  promoLeft = 'Subscribe & Get 10% Off',
  promoCenter = 'Free Shipping on All Orders',
  helpLabel = 'Need help?',
  trackLabel = 'Track My Order',
  contactLabel = 'Contact Us',
  helpHref = '/help',
  trackHref = '/track-order',
  contactHref = '/contact-us',
}: ToplineProps) {
  return (
    <div className={styles.bar} role="region" aria-label="Announcement">
      <div className={styles.inner}>
        <p className={styles.promo}>{promoLeft}</p>
        <p className={styles.center}>{promoCenter}</p>
        <div className={styles.utilities}>
          <Link href={helpHref} className={styles.utilityLink}>
            {helpLabel}
          </Link>
          <span className={styles.divider} aria-hidden />
          <Link href={trackHref} className={styles.utilityLink}>
            {trackLabel}
          </Link>
          <span className={styles.divider} aria-hidden />
          <Link href={contactHref} className={styles.utilityLink}>
            {contactLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
