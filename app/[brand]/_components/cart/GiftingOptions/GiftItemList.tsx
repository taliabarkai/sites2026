'use client'

import { useEffect, useId, useState } from 'react'
import { AssignedItemRow } from './AssignedItemRow'
import { GiftOptionCard } from './GiftOptionCard'
import {
  formatPrice,
  isItemEligible,
  type CartItem,
  type DesignOption,
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
  designs:     DesignOption[]
  /** The item whose panel is currently open, if any. */
  activeItemId: string | null
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
  items, options, assignments, icons, designs, activeItemId, onAdd, onEdit, onRemove,
}: GiftItemListProps) {
  const { CheckmarkIcon } = icons
  // One at a time: opening an item's options closes whichever was open.
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)

  // The expansion deliberately survives the panel opening, so the shopper keeps
  // sight of which item and packaging they are configuring behind the scrim.
  // It is only stale once the item is wrapped, because the row is replaced by
  // the assigned card at that point.
  useEffect(() => {
    if (expandedItemId && assignments.some(a => a.itemId === expandedItemId)) {
      setExpandedItemId(null)
    }
  }, [assignments, expandedItemId])
  const listId = useId()

  const renderItem = (item: CartItem) => {
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
              designs={designs}
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
              <div className={`${styles.itemStateRow} ${styles.itemStateRowCentered}`}>
                <img src={item.imageUrl} alt="" aria-hidden="true" className={styles.itemStateThumb} />
                <div className={styles.itemStateBody}>
                  <span className={styles.itemStateName}>{item.name}</span>
                  <span className={styles.itemStateMuted}>Gift packaging not available.</span>
                </div>
              </div>
            </li>
          )
        }

        // With a single eligible option there is nothing to choose between, so
        // the control opens the panel directly rather than expanding a list of
        // one. Only the multi-option case behaves as a checkbox.
        const solo = eligible.length === 1 ? eligible[0] : null
        const cheapest = Math.min(...eligible.map(o => o.price))

        const activate = () => {
          if (solo) onAdd(item.id, solo.id, document.activeElement as HTMLElement | null)
          else setExpandedItemId(expanded ? null : item.id)
        }

        // A solo item has no options to expand, so its panel being open is the
        // only signal that it is the one being configured — tick it too.
        const selected = expanded || activeItemId === item.id

        return (
          <li key={item.id} className={styles.itemStateGroup}>
            {/* The whole card stays clickable for mouse users, but keyboard
                focus lives on the checkbox, so the row is not a tab stop and
                never draws a focus ring of its own. */}
            <div
              className={[
                styles.itemStateRow,
                styles.itemStateRowClickable,
                styles.itemStateRowCentered,
                expanded ? styles.itemStateRowExpanded : '',
              ].filter(Boolean).join(' ')}
              onClick={activate}
            >
              <img src={item.imageUrl} alt="" aria-hidden="true" className={styles.itemStateThumb} />
              <div className={styles.itemStateBody}>
                <span className={styles.itemStateName}>{item.name}</span>
                {/* Prices are otherwise hidden until the row is expanded, and
                    what is eligible differs per item, so this is that item's
                    own cheapest. The heading and prompt above already name what
                    is on offer, so the row only carries the missing fact — and
                    "From" only when there is actually a range. */}
                <span className={styles.itemStatePrice}>
                  {eligible.length > 1
                    ? `From ${formatPrice(cheapest)}`
                    : formatPrice(cheapest)}
                </span>
              </div>
              <div className={`${styles.itemStateActions} ${styles.itemStateActionsCheckbox}`}>
                <button
                  type="button"
                  {...(solo
                    // A single option is a direct route to the panel, not a
                    // toggle, so it must not announce itself as a checkbox.
                    ? { 'aria-haspopup': 'dialog' as const,
                        'aria-expanded': selected,
                        'aria-label': `Add gift packaging to ${item.name}` }
                    : { role: 'checkbox',
                        'aria-checked': selected,
                        'aria-controls': panelId,
                        'aria-label': `Gift wrap ${item.name}` })}
                  className={styles.itemStateCheckbox}
                  onClick={e => { e.stopPropagation(); activate() }}
                >
                  {/* The button is a 24px hit frame; the circle inside reads as
                      20px, so the control lines up optically without shrinking
                      the target. */}
                  <span
                    className={`${styles.itemStateCheckboxCircle} ${selected ? styles.itemStateCheckboxChecked : ''}`}
                    aria-hidden="true"
                  >
                    {selected && <CheckmarkIcon size={12} />}
                  </span>
                </button>
              </div>
            </div>

            {!solo && expanded && (
              <div id={panelId} className={styles.optionsAccordion}>
                {/* The same card the single-item flow uses — here it is nested
                    under its parent item rather than leading the section. */}
                <div className={styles.optionList}>
                  {eligible.map(option => (
                    <GiftOptionCard
                      key={option.id}
                      option={option}
                      icons={icons}
                      onSelect={o => onAdd(
                        item.id, o.id, document.activeElement as HTMLElement | null)}
                    />
                  ))}
                </div>
              </div>
            )}
          </li>
        )
  }

  // Wrapped items rise above the rule; what is still to do sits below it. Cart
  // order is preserved inside each group.
  const wrapped   = items.filter(i => assignments.some(a => a.itemId === i.id))
  const unwrapped = items.filter(i => !assignments.some(a => a.itemId === i.id))

  return (
    // Owns its own spacing so the rule between the groups can breathe wider
    // than the gap between rows inside them.
    <div className={styles.itemGroups}>
      {wrapped.length > 0 && (
        <ul className={styles.itemStateList}>{wrapped.map(renderItem)}</ul>
      )}

      {/* Only earns its place once there is something on both sides. */}
      {wrapped.length > 0 && unwrapped.length > 0 && (
        <hr className={styles.groupDivider} />
      )}

      {/* The prompt sits with the unwrapped group, so once some items are
          wrapped it travels below the rule with the ones still to do. */}
      {unwrapped.length > 0 && (
        <div className={styles.itemGroup}>
          <h3 className={styles.itemGroupTitle}>Select an item to add gift packaging</h3>
          <ul className={styles.itemStateList}>{unwrapped.map(renderItem)}</ul>
        </div>
      )}
    </div>
  )
}
