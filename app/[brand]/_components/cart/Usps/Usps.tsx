'use client'

import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'
import styles from './Usps.module.css'

export interface UspsIcons {
  ShippingIcon: React.ComponentType<IconProps>
  ReturnIcon:   React.ComponentType<IconProps>
  WarrantyIcon: React.ComponentType<IconProps>
}

interface UspsProps {
  icons: UspsIcons
  /** Drop the warranty line on brands whose products have no plan. */
  showWarranty?: boolean
  className?: string
}

/**
 * The three promises, in one component so the wording and the icons cannot
 * drift between the pages that show them.
 *
 * Which page that is belongs to the flow, not to this list: it appears exactly
 * once per journey, on the cart page where there is one and on checkout where
 * there is not.
 */
export function Usps({ icons, showWarranty = true, className }: UspsProps) {
  const { ShippingIcon, ReturnIcon, WarrantyIcon } = icons

  return (
    <ul className={className ? `${styles.usps} ${className}` : styles.usps}>
      <li className={styles.usp}>
        <span className={styles.uspIcon} aria-hidden="true"><ShippingIcon size={24} /></span>
        Free shipping on all orders
      </li>
      <li className={styles.usp}>
        <span className={styles.uspIcon} aria-hidden="true"><ReturnIcon size={24} /></span>
        60-day extended returns
      </li>
      {showWarranty && (
        <li className={styles.usp}>
          <span className={styles.uspIcon} aria-hidden="true"><WarrantyIcon size={24} /></span>
          2-year warranty
        </li>
      )}
    </ul>
  )
}
