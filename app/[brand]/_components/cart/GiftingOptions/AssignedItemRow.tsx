'use client'

import type React from 'react'
import {
  formatPrice,
  type CartItem,
  type DesignOption,
  type GiftAssignment,
  type GiftOption,
  type GiftingIcons,
} from './types'
import styles from './GiftingOptions.module.css'

interface AssignedItemRowProps {
  item:       CartItem
  option:     GiftOption
  assignment: GiftAssignment
  icons:      GiftingIcons
  /** Needed to turn the stored design key back into its label. */
  designs:    DesignOption[]
  onEdit:     (assignment: GiftAssignment) => void
  onRemove:   (itemId: string) => void
  /**
   * Opened for editing in place (V4): rendered inside the card, under the row,
   * which keeps its image and copy. Edit is hidden while it is open — the
   * content brings its own Save.
   */
  expanded?: React.ReactNode
}

/**
 * A wrapped item, in the state both flows share. Single-item and multi-item
 * render the identical row so the two can never drift apart.
 *
 * Deliberately reuses the option card's own classes — image sizing, blend
 * overlay, colours and type are the same as the card the shopper just chose,
 * so adding packaging changes what the row says rather than how it looks. The
 * only additions are the remove and edit controls down the right-hand edge.
 *
 * Once packaging is added the card is inert: Edit and the trash icon are the
 * only controls, so there is no whole-card hover to imply otherwise.
 */
export function AssignedItemRow({
  item, option, assignment, icons, designs, onEdit, onRemove, expanded,
}: AssignedItemRowProps) {
  const { TrashCanIcon } = icons

  // The saved card shows the design the shopper actually picked, not the
  // option's generic packshot — that is the thing being posted.
  const design = designs.find(d => d.key === assignment.design)
  const imageUrl = (option.designs && design?.image) || option.imageUrl

  const row = (
    <>
      <span className={styles.optionCardImageWrap}>
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className={styles.optionCardImage}
        />
      </span>

      <span className={styles.optionCardBody}>
        {/* The packaging leads now that it is chosen; the piece it wraps is the
            supporting line. */}
        <span className={styles.optionCardName}>{option.name}</span>
        <span className={styles.optionCardDescription}>Added for {item.name}</span>
        <span className={styles.optionCardPrice}>{formatPrice(option.price)}</span>
      </span>

      <span className={styles.assignedActions}>
        <button
          type="button"
          className={styles.itemStateRemove}
          aria-label={`Remove gifting from ${item.name}`}
          onClick={() => onRemove(item.id)}
        >
          <TrashCanIcon size={24} />
        </button>
        {!expanded && (
          <button
            type="button"
            className={styles.itemStateEdit}
            aria-label={`Edit gifting for ${item.name}`}
            onClick={() => onEdit(assignment)}
          >
            Edit
          </button>
        )}
      </span>
    </>
  )

  if (expanded) {
    return (
      <li className={`${styles.assignedCard} ${styles.assignedCardExpanded}`} data-gift-row={item.id}>
        <div className={styles.assignedCardRow}>{row}</div>
        <div className={styles.assignedCardExpandedBody}>{expanded}</div>
      </li>
    )
  }

  return (
    <li className={styles.assignedCard} data-gift-row={item.id}>
      {row}
    </li>
  )
}
