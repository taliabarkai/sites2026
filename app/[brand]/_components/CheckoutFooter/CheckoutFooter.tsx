'use client'

import { BRANDS, type BrandKey } from '../../_config/brands'
import styles from './CheckoutFooter.module.css'

/** How many slots the payment placeholder draws. Matches the live footers. */
const PAYMENT_SLOTS = 10

interface CheckoutFooterProps {
  brand: BrandKey
}

/**
 * The slim footer the funnel uses instead of the site's own.
 *
 * Checkout and the bag are the two pages a shopper should be able to finish
 * without being offered somewhere else to go, so they drop the full footer for
 * its closing line alone — on the same ground the full one sits on, so the two
 * read as the same footer cut short rather than a different one.
 *
 * The payment marks are a placeholder: the brand logos are third-party assets
 * the project does not hold yet, and a row of blanks is honest about that
 * where an invented mark would not be.
 */
export function CheckoutFooter({ brand }: CheckoutFooterProps) {
  const label = BRANDS.find(b => b.key === brand)?.label ?? ''

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copyright}>&copy; 2026 {label}&nbsp; All rights reserved</p>

        <div className={styles.payments} aria-hidden="true">
          {Array.from({ length: PAYMENT_SLOTS }, (_, i) => (
            <span key={i} className={styles.paymentSlot} />
          ))}
        </div>
      </div>
    </footer>
  )
}
