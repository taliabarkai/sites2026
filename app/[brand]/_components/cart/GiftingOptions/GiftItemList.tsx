'use client'

import { useId, useState } from 'react'
import { AssignedItemRow } from './AssignedItemRow'
import {
  formatPrice,
  isItemEligible,
  type CartItem,
  type GiftAssignment,
  type GiftOption,
  type GiftingIcons,
} from './types'
import styles from './GiftingOptions.module.css'

interface GiftItemListProps {
  items:       CartItem[]
  options:     GiftOption[]
  assignments: GiftAssignment[]
  icons:       GiftingIcons
  /** Item and packaging are both settled here, so the panel opens ready to configure. */
  onAdd:       (itemId: string, optionId: string, trigger: HTMLElement | null) => void
  onEdit:      (assignment: GiftAssignment) => void
  onRemove:    (itemId: string) => void
}

/**
 * Multi-item flow: the bag leads, not the packaging. Every cart line shows in
 * cart order with its own state — wrapped, wrappable, or ineligible — so mixed
 * states read naturally and nothing is hidden behind a picker.
 *
 * An item with several eligible options expands an accordion of those options;
 * an item with exactly one skips it and goes straight to the panel.
 */
export function GiftItemList({
  items, options, assignments, icons, onAdd, onEdit, onRemove,
}: GiftItemListProps) {
  // One at a time: opening an item's options closes whichever was open.
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const listId = useId()

  return (
    <ul className={styles.itemStateList}>
      {items.map(item => {
        const assignment = assignments.find(a => a.itemId === item.id)
        const assigned   = assignment && options.find(o => o.id === assignment.optionId)

        if (assignment && assigned) {
          return (
            <AssignedItemRow
              key={item.id}
              item={item}
              option={assigned}
              assignment={assignment}
              icons={icons}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          )
        }

        const eligible = options.filter(o => isItemEligible(o, item.id))
        const expanded = expandedItemId === item.id
        const panelId  = `${listId}-${item.id}`

        // Nothing to offer: the row still shows, so the shopper can see the
        // piece was considered rather than silently missing.
        if (eligible.length === 0) {
          return (
            <li key={item.id} className={styles.itemStateGroup}>
              <div className={styles.itemStateRow}>
                <img src={item.imageUrl} alt="" aria-hidden="true" className={styles.itemStateThumb} />
                <div className={styles.itemStateBody}>
                  <span className={styles.itemStateName}>{item.name}</span>
                  <span className={styles.itemStateMuted}>Gift packaging not available.</span>
                </div>
              </div>
            </li>
          )
        }

        // One option is not a choice, so skip the accordion entirely.
        const solo = eligible.length === 1 ? eligible[0] : null

        const activate = (trigger: HTMLElement | null) => {
          if (solo) onAdd(item.id, solo.id, trigger)
          else setExpandedItemId(expanded ? null : item.id)
        }

        return (
          <li key={item.id} className={styles.itemStateGroup}>
            <div
              className={[
                styles.itemStateRow,
                styles.itemStateRowClickable,
                expanded ? styles.itemStateRowExpanded : '',
              ].filter(Boolean).join(' ')}
              role="button"
              tabIndex={0}
              aria-label={solo
                ? `Add gifting to ${item.name}`
                : `Choose gift packaging for ${item.name}`}
              {...(solo ? {} : { 'aria-expanded': expanded, 'aria-controls': panelId })}
              onClick={e => activate(e.currentTarget)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  activate(e.currentTarget as HTMLElement)
                }
              }}
            >
              <img src={item.imageUrl} alt="" aria-hidden="true" className={styles.itemStateThumb} />
              <div className={styles.itemStateBody}>
                <span className={styles.itemStateName}>{item.name}</span>
              </div>
              <div className={styles.itemStateActions}>
                {/* The row itself is the control; this reads as an affordance only. */}
                <span className={styles.itemStateSelect} aria-hidden="true">Select</span>
              </div>
            </div>

            {!solo && expanded && (
              <div id={panelId} className={styles.optionsAccordion}>
                {eligible.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className={styles.optionRow}
                    onClick={e => {
                      // Collapse as we hand over to the panel, so removing the
                      // assignment later cannot leave a stale row expanded.
                      setExpandedItemId(null)
                      onAdd(item.id, option.id, e.currentTarget)
                    }}
                  >
                    <img
                      src={option.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className={styles.optionRowImage}
                    />
                    <span className={styles.optionRowBody}>
                      <span className={styles.optionRowName}>{option.name}</span>
                      <span className={styles.optionRowPrice}>{formatPrice(option.price)}</span>
                    </span>
                    <span className={styles.optionRowAction} aria-hidden="true">Add</span>
                  </button>
                ))}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
