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

  /** A wrapped line keeps its full-width row: it is a receipt, not a choice. */
  const renderAssigned = (item: CartItem) => {
    const assignment = assignments.find(a => a.itemId === item.id)!
    const assigned   = options.find(o => o.id === assignment.optionId)!
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

  /**
   * A still-to-wrap line, as a card: image on top with the selector over its
   * top-right corner, name and price beneath. Cards sit side by side so three
   * and a half fit the column and the rest scroll, which keeps a three-item bag
   * on one screen instead of a stack the shopper has to scroll past.
   */
  /** One packaging in the whole section: there is no list worth opening. */
  const singleOptionCatalogue = options.length === 1

  const renderCard = (item: CartItem) => {
    const eligible = options.filter(o => isItemEligible(o, item.id))
    const panelId  = `${listId}-${item.id}`

    // Nothing to offer: the card still shows, so the shopper can see the piece
    // was considered rather than silently missing.
    if (eligible.length === 0) {
      return (
        <li key={item.id} className={styles.itemCardCell}>
          <div className={styles.itemCard}>
            <div className={styles.itemCardMedia}>
              <img src={item.imageUrl} alt="" aria-hidden="true" className={styles.itemCardImage} />
            </div>
            <div className={styles.itemCardBody}>
              <span className={styles.itemStateName}>{item.name}</span>
              <span className={styles.itemStateMuted}>Gift packaging not available.</span>
            </div>
          </div>
        </li>
      )
    }

    const cheapest = Math.min(...eligible.map(o => o.price))
    const expanded = expandedItemId === item.id
    // The panel being open is also a signal that this is the card being
    // configured, so it stays ticked behind the scrim.
    const selected = expanded || activeItemId === item.id

    /*
     * A section that stocks one packaging has nothing to choose between, so
     * picking an item goes straight to the panel — a list of one asks the
     * shopper to make a choice that has already been made for them.
     *
     * The test is what the section offers, not what this item is eligible for.
     * Where there are several and one item happens to qualify for a single one,
     * that card still expands like its neighbours: one card behaving unlike the
     * others in the same row reads as a different control, not a shortcut.
     */
    const activate = singleOptionCatalogue
      ? () => onAdd(item.id, options[0].id, document.activeElement as HTMLElement | null)
      : () => setExpandedItemId(expanded ? null : item.id)

    return (
      <li key={item.id} className={styles.itemCardCell}>
        {/* The whole card stays clickable for mouse users, but keyboard focus
            lives on the selector, so the card is not a tab stop and never draws
            a focus ring of its own. */}
        <div
          className={[
            styles.itemCard,
            styles.itemCardClickable,
            selected ? styles.itemCardSelected : '',
          ].filter(Boolean).join(' ')}
          onClick={activate}
        >
          <div className={styles.itemCardMedia}>
            <img src={item.imageUrl} alt="" aria-hidden="true" className={styles.itemCardImage} />
            <button
              type="button"
              {...(singleOptionCatalogue
                ? { 'aria-haspopup': 'dialog' as const,
                    'aria-expanded': selected,
                    'aria-label': `Add gift packaging to ${item.name}` }
                : { role: 'checkbox',
                    'aria-checked': selected,
                    'aria-controls': panelId,
                    'aria-label': `Gift wrap ${item.name}` })}
              className={styles.itemCardCheckbox}
              onClick={e => { e.stopPropagation(); activate() }}
            >
              <span
                className={`${styles.itemStateCheckboxCircle} ${selected ? styles.itemStateCheckboxChecked : ''}`}
                aria-hidden="true"
              >
                {selected && <CheckmarkIcon size={12} />}
              </span>
            </button>
          </div>

          <div className={styles.itemCardBody}>
            <span className={styles.itemStateName}>{item.name}</span>
            {/* What is eligible differs per item, so this is that item's own
                cheapest — and "From" only when there is actually a range. */}
            <span className={styles.itemStatePrice}>
              {eligible.length > 1 ? `From ${formatPrice(cheapest)}` : formatPrice(cheapest)}
            </span>
          </div>
        </div>
      </li>
    )
  }

  // Wrapped items rise above the rule; what is still to do sits below it. Cart
  // order is preserved inside each group.
  const wrapped   = items.filter(i => assignments.some(a => a.itemId === i.id))
  const unwrapped = items.filter(i => !assignments.some(a => a.itemId === i.id))

  /** The card whose options are open, and what they are. */
  const expandedItem = unwrapped.find(i => i.id === expandedItemId) ?? null
  const expandedOptions = expandedItem
    ? options.filter(o => isItemEligible(o, expandedItem.id))
    : []

  return (
    // Owns its own spacing so the rule between the groups can breathe wider
    // than the gap between rows inside them.
    <div className={styles.itemGroups}>
      {wrapped.length > 0 && (
        <ul className={styles.itemStateList}>{wrapped.map(renderAssigned)}</ul>
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
          <ul className={styles.itemCardRow}>{unwrapped.map(renderCard)}</ul>

          {/* The options belong to one card, but a card in a scroller has no
              room beneath it — so they open across the full width under the
              whole row instead, where they can be read without scrolling. */}
          {expandedItem && expandedOptions.length > 0 && (
            <div id={`${listId}-${expandedItem.id}`} className={styles.optionsForItem}>
              {/* Same scale as the prompt above the item cards: the two are
                  the same instruction, one step apart. */}
              <p className={styles.itemGroupTitle}>
                Select gift packaging for {expandedItem.name}
              </p>
              <div className={expandedOptions.length > 1 ? styles.optionRow : styles.optionList}>
                {expandedOptions.map(option => (
                  <GiftOptionCard
                    key={option.id}
                    option={option}
                    icons={icons}
                    onSelect={o => onAdd(
                      expandedItem.id, o.id, document.activeElement as HTMLElement | null)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
