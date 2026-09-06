'use client'

import { forwardRef } from 'react'
import { formatPrice, type GiftOption } from './types'
import styles from './GiftingOptions.module.css'

interface GiftOptionCardProps {
  option:   GiftOption
  /** Marks the soft default when returning for a second pass. */
  preselected?: boolean
  onSelect: (option: GiftOption) => void
}

/**
 * One packaging option, as a horizontal row: image, then name, description and
 * price stacked, with Add right-aligned. Rows stack vertically at any count.
 *
 * The whole row is the click target; Add is a visual affordance and is not
 * separately focusable.
 */
export const GiftOptionCard = forwardRef<HTMLButtonElement, GiftOptionCardProps>(
  function GiftOptionCard({ option, preselected = false, onSelect }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.optionCard} ${preselected ? styles.optionCardPreselected : ''}`}
        onClick={() => onSelect(option)}
      >
        <img src={option.imageUrl} alt="" aria-hidden="true" className={styles.optionCardImage} />

        <span className={styles.optionCardBody}>
          <span className={styles.optionCardName}>{option.name}</span>
          <span className={styles.optionCardDescription}>{option.description}</span>
          <span className={styles.optionCardPrice}>{formatPrice(option.price)}</span>
        </span>

        <span className={styles.optionCardAside}>
          <span className={styles.optionCardAction} aria-hidden="true">Add</span>
        </span>
      </button>
    )
  },
)
