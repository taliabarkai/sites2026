'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type React from 'react'
import { Button } from '../../Button'
import { GiftOptionCard } from '../GiftingOptions/GiftOptionCard'
import {
  areOptionsItemBound,
  excludedItemsNote,
  findOptionForItem,
  isItemEligible,
  optionsForItem,
  requiredFieldsMet,
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
import { ItemPicker } from './ItemPicker'
import { GiftDetails } from './GiftDetails'
import styles from './GiftingV2.module.css'

interface GiftingSectionProps {
  /**
   * Where this step falls in the flow being shown. Defaults to 3, the
   * place it has always held in the full checkout.
   */
  stepNumber?: number
  /** The brand's shared catalog. An item carrying its own options overrides it. */
  options:     GiftOption[]
  items:       GiftItem[]
  assignments: GiftAssignment[]
  icons:       GiftingV2Icons
  /** Brand-scoped printed designs, shared by every option flagged `designs`. */
  designs:     DesignOption[]
  onChange:    (assignments: GiftAssignment[]) => void
  onGenerateNote: () => Promise<string>
  /**
   * `v3` asks which item inline, in place of the packaging cards, and only
   * opens the panel once an item is tapped — straight to the fields.
   * `v4` keeps everything inline — packaging, item, then the fields — and
   * never opens a panel.
   * Defaults to `v2`, where the panel asks.
   */
  variant?: 'v2' | 'v3' | 'v4'
  /** Rendered last inside the section, above its closing divider — the step's Continue. */
  footer?: React.ReactNode
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
  options, items, assignments, icons, designs, onChange, onGenerateNote, stepNumber,
  variant = 'v2', footer,
}: GiftingSectionProps) {
  const { GiftIcon, CheckmarkIcon, WarningIcon, ArrowIcon } = icons
  const isV3 = variant === 'v3'
  const isV4 = variant === 'v4'
  // Both ask "which item" on the page rather than in a panel.
  const asksInline = isV3 || isV4

  const [draft, setDraft] = useState<PanelDraft | null>(null)
  // Removal is confirmed rather than immediate whenever a note would be lost.
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  // Restores focus to whatever opened the panel.
  const triggerRef = useRef<HTMLElement | null>(null)
  // V3: the packaging whose "Which item" question has replaced the cards inline.
  const [inlineOptionId, setInlineOptionId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Every item brings its own options, so a card already stands for one item.
  // Prompt A's rule, inherited rather than reimplemented — and the reason V2
  // and V1 are the same flow on a brand like that.
  const optionsAreItemBound = areOptionsItemBound(items)
  const step = stepNumber ?? 3

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

    // V3 asks on the page instead — only when there is a real choice (the
    // one-item case settled above). Focus moves to Back: the cards it
    // replaced are gone.
    if (asksInline) {
      // V4: picking new packaging abandons an Edit still open above.
      if (isV4) setDraft(null)
      setInlineOptionId(option.id)
      requestAnimationFrame(() =>
        sectionRef.current?.querySelector<HTMLElement>('[data-inline-back]')?.focus())
      return
    }

    // Nothing pre-selected: which item a gift is for is the shopper's answer to
    // give, and a default here is one they could accept without reading. Next
    // stays disabled until they choose.
    setDraft(seed(null, option.id, ['item']))
  }

  /** Entry two — Edit. Both known, fields prefilled, packaging not changeable. */
  const handleEdit = (assignment: GiftAssignment) => {
    triggerRef.current = document.activeElement as HTMLElement | null
    setInlineOptionId(null)
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
    // Done with that packaging: the cards come back for the next item.
    setInlineOptionId(null)
    closeDrawer()
  }

  /** V3 — an item tapped in the inline step opens the panel on its fields. */
  const handleInlineItemSelect = (option: GiftOption, itemId: string) => {
    triggerRef.current = document.activeElement as HTMLElement | null
    setDraft(seed(itemId, option.id, ['config']))
  }

  /** V3 — Back: the inline question gives way to the packaging cards again. */
  const handleInlineBack = () => {
    const optionId = inlineOptionId
    setInlineOptionId(null)
    requestAnimationFrame(() =>
      sectionRef.current
        ?.querySelector<HTMLElement>(`[data-option-id="${optionId}"] button`)
        ?.focus())
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

  const inlineOption = asksInline && inlineOptionId
    ? options.find(o => o.id === inlineOptionId) ?? null
    : null

  // Wrapped above, still to do below — the same split V1 draws, except what
  // sits below is the packaging on offer rather than the products.
  const wrappedItems   = items.filter(i => isWrapped(i.id))
  const unwrappedItems = items.filter(i => !isWrapped(i.id))
  const wrappedCount   = wrappedItems.length
  const isPopulated    = wrappedCount > 0

  // ── V4: which of the inline steps is showing ────────────────────────────────
  // An Edit is a draft for an item already wrapped; it opens in that item's row,
  // and the packaging cards below stay as they were.
  const editingItemId = isV4 && draft?.itemId && isWrapped(draft.itemId) ? draft.itemId : null
  const v4Step = editingItemId ? 'edit' : draft ? 'config' : inlineOption ? 'item' : 'packaging'
  const v4MidAdd = v4Step === 'item' || v4Step === 'config'

  /** V4 — Cancel: drop the draft, back to the cards. */
  const cancelV4 = () => {
    setDraft(null)
    setInlineOptionId(null)
  }

  /** V4 — the fields' Back: to the item question if it was asked, else the cards. */
  const backFromConfig = () => {
    if (inlineOptionId) setDraft(null)
    else cancelV4()
  }

  // Each step replaces the last in place, so focus moves with it — the
  // shopper's place in the page goes too. Closing an Edit returns focus to that
  // row's Edit. Not on first render.
  const lastV4Step = useRef(v4Step)
  const lastEditedId = useRef<string | null>(null)
  useEffect(() => {
    if (!isV4 || lastV4Step.current === v4Step) return
    const leftEdit = lastV4Step.current === 'edit'
    lastV4Step.current = v4Step
    if (editingItemId) lastEditedId.current = editingItemId
    requestAnimationFrame(() => {
      const root = sectionRef.current
      if (!root) return
      if (leftEdit && lastEditedId.current) {
        const row = root.querySelector<HTMLElement>(`[data-gift-row="${lastEditedId.current}"]`)
        const edit = Array.from(row?.querySelectorAll<HTMLElement>('button') ?? [])
          .find(b => b.textContent?.trim() === 'Edit')
        if (edit) { edit.focus(); return }
      }
      root.querySelector<HTMLElement>('[data-step-focus]')?.focus()
    })
  }, [isV4, v4Step, editingItemId])

  const pendingRemoveItem = pendingRemoveId
    ? items.find(i => i.id === pendingRemoveId) ?? null
    : null


  // V1 names what the list below is for; once a first item is wrapped, the
  // packaging still on offer would otherwise read as a leftover of the card
  // above rather than the next thing to do. The noun is read off the options.
  const packagingTitle = isPopulated
    ? (optionsAreItemBound ? 'Add a gift note to another item' : 'Add gift packaging to another item')
    : (optionsAreItemBound ? 'Select a gift note' : 'Select gift packaging')

  /**
   * V3/V4's inline header: one "← Back" control, arrow and word together.
   * It is also where focus lands when a step appears.
   */
  const inlineHeader = (onBack: () => void) => (
    <div className={styles.inlineHeader}>
      <button
        type="button"
        data-inline-back
        className={styles.inlineBack}
        aria-label={v4Step === 'config' && inlineOptionId ? 'Back to item' : 'Back to gift packaging options'}
        onClick={onBack}
      >
        {ArrowIcon && (
          <span className={styles.inlineBackIcon} aria-hidden="true">
            <ArrowIcon size={24} />
          </span>
        )}
        <span className={styles.inlineBackLabel}>Back</span>
      </button>
    </div>
  )

  /**
   * V4's Edit: only the fields, opened inside the wrapped card — its image and
   * copy already say which gift it is. Edit becomes Save, a link like it.
   */
  const editFields = draft && activeOption && (
    <div data-step-focus tabIndex={-1} className={`${styles.inlineStep} ${styles.editFields}`}>
      <GiftDetails
        option={activeOption}
        designs={designs}
        draft={draft}
        onDraftChange={setDraft}
        onGenerateNote={onGenerateNote}
        fieldsOnly
      />
      {/* Save alone, right-aligned where Edit sat. */}
      <div className={`${styles.inlineActions} ${styles.inlineActionsEnd}`}>
        <button
          type="button"
          className={styles.saveLink}
          disabled={!requiredFieldsMet(activeOption, { pname: draft.pname, photo: draft.photo })}
          onClick={handleAddToBag}
        >
          Save
        </button>
      </div>
    </div>
  )

  /** V4's personalize box when adding — below the cards, with Back. */
  const detailsBox = (mode: 'add') => draft && activeOption && (
    <div
      key={mode}
      data-step-focus
      tabIndex={-1}
      className={`${styles.inlineStack} ${styles.inlineStep} ${styles.inlineBox}`}
    >
      {inlineHeader(backFromConfig)}
      <div className={styles.inlineDetails}>
        <GiftDetails
          option={activeOption}
          selectedItem={items.find(i => i.id === draft.itemId)}
          designs={designs}
          draft={draft}
          onDraftChange={setDraft}
          onGenerateNote={onGenerateNote}
          onChangeItem={inlineOptionId ? () => setDraft(null) : undefined}
        />
      </div>
      <div className={styles.inlineActions}>
        <button type="button" className={v1Styles.drawerCancel} onClick={cancelV4}>
          Cancel
        </button>
        <Button
          variant="primary"
          disabled={!requiredFieldsMet(activeOption, { pname: draft.pname, photo: draft.photo })}
          onClick={handleAddToBag}
        >
          Add
        </Button>
      </div>
    </div>
  )

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
    <div className={options.length > 1 ? v1Styles.optionRow : v1Styles.optionList}>
      {options.map(option => (
        /* display: contents keeps the row's grid intact; the wrapper only
           gives Back somewhere to return focus to. */
        <div key={option.id} data-option-id={option.id} className="contents">
          <GiftOptionCard
            option={option}
            icons={icons}
            /* No availability line on the cards: which pieces a packaging
               can't go on is explained by the info tooltip in the "Which
               item" step. */
            onSelect={o => handleCardSelect(
              o, null, document.activeElement as HTMLElement | null)}
          />
        </div>
      ))}
    </div>
  )

  return (
    <section ref={sectionRef} className={v1Styles.section} aria-labelledby="gifting-options-heading">
      <div className={v1Styles.sectionHeader}>
        <h2 id="gifting-options-heading" className={v1Styles.heading}>
          {/* Read off the options, never the brand: item-bound options are a
              note card cut to the product, not packaging the brand stocks. */}
          {`${step}. ${optionsAreItemBound ? 'Add Gift Note' : 'Add Gift Packaging'}`}
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
          editingItemId={editingItemId}
          editor={editingItemId ? editFields : null}
        />
      )}

      {/* Only earns its place once there is something on both sides. */}
      {wrappedCount > 0 && unwrappedItems.length > 0 && (
        <hr className={v1Styles.groupDivider} />
      )}

      {/* V3's inline step: the packaging chosen, now which item it is for.
          Stands in for the cards below until Back, or until an item is
          wrapped. */}
      {!isV4 && unwrappedItems.length > 0 && inlineOption && (
        <div className={`${v1Styles.itemGroup} ${styles.inlineStep}`}>
          {inlineHeader(handleInlineBack)}

          <div className={styles.inlinePicker}>
            <ItemPicker
              items={selectableItemsFor(inlineOption)}
              selectedItemId={draft?.itemId ?? null}
              exclusionNote={excludedItemsNote(inlineOption, unwrappedItems)}
              icons={{ CheckmarkIcon, WarningIcon }}
              mode="action"
              gridClassName={styles.itemChoiceGroupInline}
              onSelect={itemId => handleInlineItemSelect(inlineOption, itemId)}
            />
          </div>
        </div>
      )}

      {!isV4 && unwrappedItems.length > 0 && !inlineOption && (
        <div className={v1Styles.itemGroup}>
          <h3 className={v1Styles.itemGroupTitle}>{packagingTitle}</h3>
          {optionCards}
        </div>
      )}

      {/* V4: every step inline, one replacing the next. Shown while there is
          something left to wrap, or while an Edit is open. */}
      {isV4 && (unwrappedItems.length > 0 || v4MidAdd) && (
        <div className={v1Styles.itemGroup}>
          {(v4Step === 'packaging' || v4Step === 'edit') && (
            <div key="packaging" className={`${styles.inlineStack} ${styles.inlineStep}`}>
              <h3 data-step-focus tabIndex={-1} className={`${v1Styles.itemGroupTitle} ${styles.inlineHeading}`}>
                {packagingTitle}
              </h3>
              {optionCards}
            </div>
          )}

          {v4Step === 'item' && inlineOption && (
            <div
              key="item"
              data-step-focus
              tabIndex={-1}
              className={`${styles.inlineStack} ${styles.inlineStep} ${styles.inlineBox}`}
            >
              {inlineHeader(handleInlineBack)}
              <div className={styles.inlinePicker}>
                <ItemPicker
                  items={selectableItemsFor(inlineOption)}
                  selectedItemId={null}
                  exclusionNote={excludedItemsNote(inlineOption, unwrappedItems)}
                  icons={{ CheckmarkIcon, WarningIcon }}
                  mode="action"
                  gridClassName={styles.itemChoiceGroupInline}
                  onSelect={itemId => handleInlineItemSelect(inlineOption, itemId)}
                />
              </div>
            </div>
          )}

          {v4Step === 'config' && detailsBox('add')}
        </div>
      )}

      {!isV4 && draft && activeOption && (
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
          /* V3 asked on the page, so changing the item means going back there:
             close the panel and leave the inline question showing. */
          onChangeItem={isV3 && inlineOption ? closeDrawer : undefined}
        />
      )}

      {/* V4 mid-flow: Cancel is the way out, so a second primary button
          under Add to bag would only compete with it. */}
      {!(isV4 && v4MidAdd) && footer}

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
