'use client'

import styles from './Topline.module.css'

export interface ToplineProps {
  promoLeft?: string
  promoCenter?: string
  helpLabel?: string
  trackLabel?: string
  helpHref?: string
  trackHref?: string
}

export function Topline({
  promoLeft = 'Subscribe & Get 10% Off',
  promoCenter = 'Free Shipping on All Orders',
  helpLabel = 'Need help?',
  trackLabel = 'Track My Order',
  helpHref = '/help',
  trackHref = '/track-order',
}: ToplineProps) {
  return (
    <div className={styles.bar} role="region" aria-label="Announcement">
      <div className={styles.inner}>
        <p className={styles.promo}>{promoLeft}</p>
        <p className={styles.center}>{promoCenter}</p>
        <div className={styles.utilities}>
          <a href={helpHref} className={styles.utilityLink}>
            {helpLabel}
          </a>
          <span className={styles.divider} aria-hidden />
          <a href={trackHref} className={styles.utilityLink}>
            {trackLabel}
          </a>
        </div>
      </div>
    </div>
  )
}
