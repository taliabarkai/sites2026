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

          const action = option
            ? () => onEdit(assignment!)
            : cheapest ? () => onAddGifting(item.id) : null

          return (
            <li
              key={item.id}
              className={`${styles.itemStateRow} ${action ? styles.itemStateRowClickable : ''}`}
              {...(action ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': option
                  ? `Edit gifting for ${item.name}`
                  : `Add gifting to ${item.name}`,
                onClick: action,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action() }
                },
              } : {})}
            >
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
                    onClick={e => { e.stopPropagation(); onRemove(item.id) }}
                  >
                    <TrashCanIcon size={24} />
                  </button>
                )}

                {/* The row itself is the control; these read as affordances only. */}
                {option ? (
                  <span className={styles.itemStateEdit} aria-hidden="true">Edit</span>
                ) : cheapest ? (
                  <span className={styles.itemStateAdd} aria-hidden="true">Add</span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
