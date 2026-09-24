'use client'

import { forwardRef } from 'react'
import { formatPrice, type GiftOption, type GiftingIcons } from './types'
import styles from './GiftingOptions.module.css'

interface GiftOptionCardProps {
  option:   GiftOption
  icons:    GiftingIcons
  /**
   * The item this card belongs to. Passed only when the options are the item's
   * own: several of them can read near-identically — three canvases, three
   * notes named after them — and without this the section looks like the same
   * card rendered three times, with no way to tell which Add is which.
   *
   * Left off for a shared catalog, where a card belongs to no one item.
   */
  itemName?: string
  /**
   * Which cart items this packaging can go on, in the caller's words. Takes the
   * place the contents line used to hold: once there is more than one item and
   * more than one packaging, what the shopper needs from a card is whether it
   * applies to their bag, not what is inside the box — the panel says that.
   *
   * Omitted when the question does not arise (one item, or one option).
   */
  availability?: string
  onSelect: (option: GiftOption) => void
}

/**
 * One packaging option, as a horizontal row: image, then the item it is for,
 * the name, the availability and the price stacked, with Add right-aligned.
 * Rows stack vertically at any count.
 *
 * The whole row is the click target; Add is a visual affordance and is not
 * separately focusable.
 */
export const GiftOptionCard = forwardRef<HTMLButtonElement, GiftOptionCardProps>(
  function GiftOptionCard({ option, icons, itemName, availability, onSelect }, ref) {
    const { PlusMinusIcon } = icons
    return (
      <button
        ref={ref}
        type="button"
        className={styles.optionCard}
        onClick={() => onSelect(option)}
      >
        <span className={styles.optionCardImageWrap}>
          <img src={option.imageUrl} alt="" aria-hidden="true" className={styles.optionCardImage} />
        </span>

        <span className={styles.optionCardBody}>
          {itemName && <span className={styles.optionCardItemName}>For {itemName}</span>}
          <span className={styles.optionCardName}>{option.name}</span>
          {availability && (
            <span className={styles.optionCardDescription}>{availability}</span>
          )}
          <span className={styles.optionCardPrice}>
            {option.originalPrice != null && option.originalPrice > option.price && (
              <span className={styles.optionCardPriceWas}>{formatPrice(option.originalPrice)}</span>
            )}
            {formatPrice(option.price)}
          </span>
        </span>

        <span className={styles.optionCardAside}>
          <span className={styles.optionCardAction} aria-hidden="true">
            Add
            <PlusMinusIcon size={20} />
          </span>
        </span>
      </button>
    )
  },
)
