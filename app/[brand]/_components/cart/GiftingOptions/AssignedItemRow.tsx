'use client'

import {
  formatPrice,
  type CartItem,
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
  onEdit:     (assignment: GiftAssignment) => void
  onRemove:   (itemId: string) => void
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
  item, option, assignment, icons, onEdit, onRemove,
}: AssignedItemRowProps) {
  const { TrashCanIcon } = icons

  return (
    <li className={styles.assignedCard}>
      <span className={styles.optionCardImageWrap}>
        <img
          src={option.imageUrl}
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
        <button
          type="button"
          className={styles.itemStateEdit}
          aria-label={`Edit gifting for ${item.name}`}
          onClick={() => onEdit(assignment)}
        >
          Edit
        </button>
      </span>
    </li>
  )
}
