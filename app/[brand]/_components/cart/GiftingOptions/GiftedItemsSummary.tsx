'use client'

import {
  formatPrice,
  isItemEligible,
  type CartItem,
  type GiftAssignment,
  type GiftOption,
  type GiftingIcons,
} from './types'
import styles from './GiftingOptions.module.css'

interface GiftedItemsSummaryProps {
  assignments:  GiftAssignment[]
  items:        CartItem[]
  options:      GiftOption[]
  icons:        GiftingIcons
  onEdit:       (assignment: GiftAssignment) => void
  onAddGifting: (itemId: string) => void
  onRemove:     (itemId: string) => void
}

/**
 * Populated state: every cart line item in cart order, each showing whether it
 * is wrapped and offering the action that moves it forward. Replaces the option
 * cards entirely, so the shopper can always see what is still unwrapped.
 */
export function GiftedItemsSummary({
  assignments, items, options, icons, onEdit, onAddGifting, onRemove,
}: GiftedItemsSummaryProps) {
  if (assignments.length === 0) return null

  const { CheckmarkIcon, TrashCanIcon } = icons
  const wrapped = items.filter(i => assignments.some(a => a.itemId === i.id)).length

  return (
    <>
      <p className={styles.statusLine} aria-live="polite">
        {wrapped} of {items.length} items wrapped
      </p>

      <ul className={styles.itemStateList}>
        {items.map(item => {
          const assignment = assignments.find(a => a.itemId === item.id)
          const option     = assignment && options.find(o => o.id === assignment.optionId)
          const eligible   = options.filter(o => isItemEligible(o, item.id))
          const cheapest   = eligible.reduce<GiftOption | null>(
            (lo, o) => (!lo || o.price < lo.price ? o : lo), null)

          return (
            <li key={item.id} className={styles.itemStateRow}>
              {/* Once wrapped, the tile shows the packaging — the product is already
                  named in the row text, so the image can carry the new information. */}
              <img
                src={option ? option.imageUrl : item.imageUrl}
                alt=""
                aria-hidden="true"
                className={styles.itemStateThumb}
              />

              <div className={styles.itemStateBody}>
                <span className={styles.itemStateName}>{item.name}</span>

                {option ? (
                  <span className={styles.itemStateAssigned}>
                    <span className={styles.itemStateCheck} aria-hidden="true">
                      <CheckmarkIcon size={24} />
                    </span>
                    {option.name} · {formatPrice(option.price)}
                  </span>
                ) : !cheapest ? (
                  <span className={styles.itemStateMuted}>Gifting not available for this piece</span>
                ) : null}
              </div>

              <div className={styles.itemStateActions}>
                {option && (
                  <button
                    type="button"
                    className={styles.itemStateRemove}
                    aria-label={`Remove gifting from ${item.name}`}
                    onClick={() => onRemove(item.id)}
                  >
                    <TrashCanIcon size={24} />
                  </button>
                )}

                {option ? (
                  <button
                    type="button"
                    className={styles.itemStateEdit}
                    onClick={() => onEdit(assignment!)}
                  >
                    Edit<span className={styles.visuallyHidden}> gifting for {item.name}</span>
                  </button>
                ) : cheapest ? (
                  <button
                    type="button"
                    className={styles.itemStateAdd}
                    onClick={() => onAddGifting(item.id)}
                  >
                    Add<span className={styles.visuallyHidden}> gifting to {item.name}</span>
                  </button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
