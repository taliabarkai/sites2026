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
 * The row itself is the edit control; "Edit" reads as an affordance only. The
 * trash button is a real button and stops propagation so it cannot open the
 * panel on its way to removing the assignment.
 */
export function AssignedItemRow({
  item, option, assignment, icons, onEdit, onRemove,
}: AssignedItemRowProps) {
  const { CheckmarkIcon, TrashCanIcon } = icons

  return (
    <li
      className={`${styles.itemStateRow} ${styles.itemStateRowClickable}`}
      role="button"
      tabIndex={0}
      aria-label={`Edit gifting for ${item.name}`}
      onClick={() => onEdit(assignment)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit(assignment) }
      }}
    >
      {/* Once wrapped, the tile shows the packaging — the product is already
          named in the row text, so the image can carry the new information. */}
      <img
        src={option.imageUrl}
        alt=""
        aria-hidden="true"
        className={styles.itemStateThumb}
      />

      <div className={styles.itemStateBody}>
        <span className={styles.itemStateName}>{item.name}</span>
        <span className={styles.itemStateAssigned}>
          <span className={styles.itemStateCheck} aria-hidden="true">
            <CheckmarkIcon size={24} />
          </span>
          {option.name} · {formatPrice(option.price)}
        </span>
      </div>

      <div className={styles.itemStateActions}>
        <button
          type="button"
          className={styles.itemStateRemove}
          aria-label={`Remove gifting from ${item.name}`}
          onClick={e => { e.stopPropagation(); onRemove(item.id) }}
        >
          <TrashCanIcon size={24} />
        </button>
        <span className={styles.itemStateEdit} aria-hidden="true">Edit</span>
      </div>
    </li>
  )
}
