'use client'

import { useCallback, useRef, useState } from 'react'
import { GiftOptionCard } from '../GiftingOptions/GiftOptionCard'
import {
  areOptionsItemBound,
  availabilityNote,
  excludedItemsNote,
  findOptionForItem,
  isItemEligible,
  optionsForItem,
  upsertAssignment,
  type CartItem,
  type DesignOption,
  type GiftAssignment,
  type GiftOption,
} from '../GiftingOptions/types'
/* The section shell and the option card are V1's, imported rather than rebuilt:
   V2's empty state has to be visually identical to V1's, and the surest way to
   keep it that way is for both to be the same CSS. */
import v1Styles from '../GiftingOptions/GiftingOptions.module.css'
import { GiftedItemList } from './GiftedItemList'
import { GiftPanel, type GiftItem, type GiftingV2Icons, type PanelDraft } from './GiftPanel'
import { RemoveGiftDialog } from './RemoveGiftDialog'
import styles from './GiftingV2.module.css'

interface GiftingSectionProps {
  /** The brand's shared catalog. An item carrying its own options overrides it. */
  options:     GiftOption[]
  items:       GiftItem[]
  assignments: GiftAssignment[]
  icons:       GiftingV2Icons
  /** Brand-scoped printed designs, shared by every option flagged `designs`. */
  designs:     DesignOption[]
  onChange:    (assignments: GiftAssignment[]) => void
  onGenerateNote: () => Promise<string>
}

/**
 * Gifting, variant 2: packaging first, then the item, then personalization.
 *
 * The difference from V1 is one step and where it sits. V1 asks which item
 * first and offers packaging under it; V2 leads with the packaging and asks
 * which item afterwards — but only when that question has more than one
 * answer. A one-item bag skips it, and so does a brand whose options belong to
 * the items themselves, because the card tapped already names its item.
 *
 * Assignments are lifted to the checkout page so the order total can reflect
 * them. This owns only the panel and the dialog.
 */
export function GiftingSection({
  options, items, assignments, icons, designs, onChange, onGenerateNote,
}: GiftingSectionProps) {
  const { GiftIcon, CheckmarkIcon } = icons

  const [draft, setDraft] = useState<PanelDraft | null>(null)
  // Removal is confirmed rather than immediate whenever a note would be lost.
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  // Restores focus to whatever opened the panel.
  const triggerRef = useRef<HTMLElement | null>(null)

  // Every item brings its own options, so a card already stands for one item.
  // Prompt A's rule, inherited rather than reimplemented — and the reason V2
  // and V1 are the same flow on a brand like that.
  const optionsAreItemBound = areOptionsItemBound(items)

  const optionsFor = (item: GiftItem) => optionsForItem(item, options)

  const findOption = (itemId: string, optionId: string) =>
    findOptionForItem(items, options, itemId, optionId)

  const isWrapped = (itemId: string) => assignments.some(a => a.itemId === itemId)

  /**
   * The items this packaging could still be added to — eligible, and not
   * already wrapped. Adding is always about what is left, so this is what the
   * panel offers and what decides whether it needs to ask at all.
   */
  const selectableItemsFor = (option: GiftOption) =>
    items.filter(item => isItemEligible(option, item.id) && !isWrapped(item.id))

  /** Designs are cosmetic, so the first one is a safe default and saves a click. */
  const defaultDesign = (option: GiftOption | null) =>
    option?.designs ? designs[0]?.key ?? null : null

  const closeDrawer = useCallback(() => {
    setDraft(null)
    triggerRef.current?.focus()
    triggerRef.current = null
  }, [])

  /** Seeds the draft from any existing assignment for the item, or from scratch. */
  const seed = (itemId: string | null, optionId: string, history: PanelDraft['history']): PanelDraft => {
    const option   = itemId ? findOption(itemId, optionId) : null
    const existing = itemId ? assignments.find(a => a.itemId === itemId) : undefined
    const sameOption = existing?.optionId === optionId

    return {
      optionId,
      itemId,
      history,
      // Re-wrapping an item keeps whatever note was already written for it.
      note:   existing?.note ?? '',
      design: sameOption ? existing.design : defaultDesign(option),
      pname:  sameOption ? existing.pname  : '',
      photo:  sameOption ? existing.photo  : false,
    }
  }

  /**
   * Entry one — an option card. Packaging known; the item known only when
   * there is nothing left to ask.
   */
  const handleCardSelect = (option: GiftOption, boundItemId: string | null, trigger: HTMLElement | null) => {
    if (trigger) triggerRef.current = trigger

    // The card already names its item, or only one is left to wrap — either way
    // the question has exactly one answer, so it is not worth asking. This is
    // the one-item-cart shortcut, widened to "one item still open".
    const selectable = selectableItemsFor(option)
    const settled = boundItemId ?? (selectable.length === 1 ? selectable[0].id : null)
    if (settled) {
      setDraft(seed(settled, option.id, ['config']))
      return
    }
    if (selectable.length === 0) return

    // Nothing pre-selected: which item a gift is for is the shopper's answer to
    // give, and a default here is one they could accept without reading. Next
    // stays disabled until they choose.
    setDraft(seed(null, option.id, ['item']))
  }

  /** Entry two — Edit. Both known, fields prefilled, packaging not changeable. */
  const handleEdit = (assignment: GiftAssignment) => {
    triggerRef.current = document.activeElement as HTMLElement | null
    setDraft({
      optionId: assignment.optionId,
      itemId:   assignment.itemId,
      history:  ['config'],
      note:     assignment.note,
      design:   assignment.design,
      pname:    assignment.pname,
      photo:    assignment.photo,
    })
  }

  const handleAddToBag = () => {
    if (!draft?.itemId) return
    // Lifted state must be updated from the handler, never inside a setState
    // updater — React runs updaters during render.
    onChange(upsertAssignment(assignments, {
      itemId:   draft.itemId,
      optionId: draft.optionId,
      note:     draft.note,
      design:   draft.design,
      pname:    draft.pname,
      photo:    draft.photo,
    }))
    closeDrawer()
  }

  const removeAssignment = (itemId: string) =>
    onChange(assignments.filter(a => a.itemId !== itemId))

  /**
   * A written note is real work, so it is never discarded without asking. An
   * empty note has nothing to lose, so that path stays a single click.
   */
  const handleRequestRemove = (itemId: string) => {
    const assignment = assignments.find(a => a.itemId === itemId)
    if (assignment && assignment.note.trim().length > 0) setPendingRemoveId(itemId)
    else removeAssignment(itemId)
  }

  const activeOption = draft
    ? (draft.itemId
        ? findOption(draft.itemId, draft.optionId)
        : options.find(o => o.id === draft.optionId) ?? null)
    : null

  const pendingRemoveItem = pendingRemoveId
    ? items.find(i => i.id === pendingRemoveId) ?? null
    : null

  // Wrapped above, still to do below — the same split V1 draws, except what
  // sits below is the packaging on offer rather than the products.
  const wrappedItems   = items.filter(i => isWrapped(i.id))
  const unwrappedItems = items.filter(i => !isWrapped(i.id))
  const wrappedCount   = wrappedItems.length
  const isPopulated    = wrappedCount > 0

  // ── What is still on offer: the option cards, exactly as V1 draws them ────
  // The same block serves both states. Before anything is wrapped it is the
  // whole section; afterwards it sits under the wrapped rows, so packaging is
  // chosen the same way the second time as the first.
  const optionCards = optionsAreItemBound ? (
    /* One card per remaining cart item, each carrying its item's own note —
       Prompt A's rendering, so the two variants are the same picture here. */
    <ul className={v1Styles.itemStateList}>
      {unwrappedItems.map(item => optionsFor(item).map(option => (
        <li key={`${item.id}-${option.id}`} className={v1Styles.itemStateGroup}>
          <GiftOptionCard
            option={option}
            itemName={item.name}
            icons={icons}
            onSelect={o => handleCardSelect(
              o, item.id, document.activeElement as HTMLElement | null)}
          />
        </li>
      )))}
    </ul>
  ) : (
    <div className={v1Styles.optionList}>
      {options.map(option => (
        <GiftOptionCard
          key={option.id}
          option={option}
          icons={icons}
          /* Measured against what is still unwrapped: once the piece a
             packaging excluded is already wrapped, saying so is just stale. */
          availability={availabilityNote(option, unwrappedItems, options)}
          onSelect={o => handleCardSelect(
            o, null, document.activeElement as HTMLElement | null)}
        />
      ))}
    </div>
  )

  return (
    <section className={v1Styles.section} aria-labelledby="gifting-options-heading">
      <div className={v1Styles.sectionHeader}>
        <h2 id="gifting-options-heading" className={v1Styles.heading}>
          {/* Read off the options, never the brand: item-bound options are a
              note card cut to the product, not packaging the brand stocks. */}
          {optionsAreItemBound ? '3. Add Gift Note' : '3. Add Gift Packaging'}
          <span className={v1Styles.headingIcon} aria-hidden="true"><GiftIcon size={32} /></span>
        </h2>

        {/* Only once something is actually added — a tick against zero would be
            a lie, and the cards below already cover the empty state.

            V1's line, class for class and word for word: the two variants are
            reporting the same fact, so they say it the same way. Which noun it
            uses is read off the options, never the brand. */}
        {isPopulated && (
          <p className={v1Styles.wrapCount} aria-live="polite">
            <span className={v1Styles.wrapCountCheck} aria-hidden="true">
              <CheckmarkIcon size={16} />
            </span>
            {optionsAreItemBound
              ? (items.length === 1
                  ? 'Gift note added'
                  : `Gift note added to ${wrappedCount} of ${items.length} items`)
              : (items.length === 1
                  ? 'Gift packaging added'
                  : `Gift packaging added to ${wrappedCount} of ${items.length} items`)}
          </p>
        )}
      </div>

      {/* Wrapped items rise above the rule; what is still on offer sits below
          it. Both can be absent — an empty bag, or one that is fully wrapped. */}
      {wrappedCount > 0 && (
        <GiftedItemList
          items={wrappedItems}
          options={options}
          assignments={assignments}
          icons={icons}
          designs={designs}
          onEdit={handleEdit}
          onRemove={handleRequestRemove}
        />
      )}

      {/* Only earns its place once there is something on both sides. */}
      {wrappedCount > 0 && unwrappedItems.length > 0 && (
        <hr className={v1Styles.groupDivider} />
      )}

      {unwrappedItems.length > 0 && optionCards}

      {draft && activeOption && (
        <GiftPanel
          icons={icons}
          option={activeOption}
          eligibleItems={selectableItemsFor(activeOption)}
          selectedItem={items.find(i => i.id === draft.itemId)}
          exclusionNote={excludedItemsNote(activeOption, unwrappedItems)}
          designs={designs}
          draft={draft}
          onDraftChange={setDraft}
          onAddToBag={handleAddToBag}
          onClose={closeDrawer}
          onGenerateNote={onGenerateNote}
        />
      )}

      {pendingRemoveItem && (
        <RemoveGiftDialog
          itemName={pendingRemoveItem.name}
          onKeep={() => setPendingRemoveId(null)}
          onRemove={() => { removeAssignment(pendingRemoveItem.id); setPendingRemoveId(null) }}
        />
      )}
    </section>
  )
}
