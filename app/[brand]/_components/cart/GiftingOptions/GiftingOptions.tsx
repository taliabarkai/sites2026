'use client'

import { useCallback, useRef, useState } from 'react'
import { AssignedItemRow } from './AssignedItemRow'
import { GiftItemList } from './GiftItemList'
import { GiftOptionCard } from './GiftOptionCard'
import { GiftingDrawer } from './GiftingDrawer'
import { RemoveGiftDialog } from './RemoveGiftDialog'
import {
  areOptionsItemBound,
  availabilityNote,
  findOptionForItem,
  optionsForItem,
  upsertAssignment,
  type CartItem,
  type DesignOption,
  type GiftAssignment,
  type GiftOption,
  type GiftingIcons,
} from './types'
import styles from './GiftingOptions.module.css'

interface GiftingOptionsProps {
  /**
   * Where this step falls in the flow being shown. Defaults to 3, the
   * place it has always held in the full checkout.
   */
  stepNumber?: number
  /** The brand's shared catalog. An item carrying its own options overrides it. */
  options:     GiftOption[]
  items:       CartItem[]
  assignments: GiftAssignment[]
  icons:       GiftingIcons
  /** Brand-scoped printed designs, shared by every option flagged `designs`. */
  designs:     DesignOption[]
  onChange:    (assignments: GiftAssignment[]) => void
  onGenerateNote: () => Promise<string>
}

/**
 * Both entry paths settle the item and the packaging before the panel opens,
 * so the panel never has to ask — it goes straight to configuration.
 */
interface DrawerState {
  optionId: string
  itemId:   string
  note:     string
  /** Chosen design key. Seeded to the first design when the option has them. */
  design:   string | null
  pname:    string
  photo:    boolean
}

export function GiftingOptions({
  options, items, assignments, icons, designs, onChange, onGenerateNote, stepNumber,
}: GiftingOptionsProps) {
  const { GiftIcon, CheckmarkIcon } = icons

  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  // Removal is confirmed rather than immediate whenever a note would be lost.
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  // Restores focus to whatever opened the drawer.
  const triggerRef = useRef<HTMLElement | null>(null)

  // A one-item bag has no item to choose, so packaging leads. Two or more and
  // the bag leads instead: the shopper says which piece before anything else.
  const isMultiItem = items.length > 1

  // Every item brings its own options, so each card already stands for one item
  // and there is never a choice of item left to make — at any cart size. The
  // section reads this off the data; it never asks which brand it is rendering.
  const optionsAreItemBound = areOptionsItemBound(items)
  const step = stepNumber ?? 3

  /** The options that actually apply to an item. */
  const optionsFor = (item: CartItem) => optionsForItem(item, options)

  const findOption = (itemId: string, optionId: string) =>
    findOptionForItem(items, options, itemId, optionId)

  const noteFor = (itemId: string) => assignments.find(a => a.itemId === itemId)?.note ?? ''

  /** Designs are cosmetic, so the first one is a safe default and saves a click. */
  const defaultDesign = (option: GiftOption | null | undefined) =>
    option?.designs ? designs[0]?.key ?? null : null

  const closeDrawer = useCallback(() => {
    setDrawer(null)
    triggerRef.current?.focus()
    triggerRef.current = null
  }, [])

  const openPanel = (itemId: string, optionId: string, trigger: HTMLElement | null) => {
    if (trigger) triggerRef.current = trigger

    const option   = findOption(itemId, optionId)
    const existing = assignments.find(a => a.itemId === itemId)

    setDrawer({
      optionId,
      itemId,
      // Re-wrapping an item keeps whatever note was already written for it.
      note:   existing?.note ?? noteFor(itemId),
      design: existing?.optionId === optionId ? existing.design : defaultDesign(option),
      pname:  existing?.optionId === optionId ? existing.pname  : '',
      photo:  existing?.optionId === optionId ? existing.photo  : false,
    })
  }

  /** Single-item flow: packaging is picked first, and the item is the only one. */
  const handleSelectOption = (option: GiftOption, trigger: HTMLElement | null) => {
    const only = items[0]
    if (!only) return
    openPanel(only.id, option.id, trigger)
  }

  const handleEdit = (assignment: GiftAssignment) => {
    triggerRef.current = document.activeElement as HTMLElement | null
    setDrawer({
      optionId: assignment.optionId,
      itemId:   assignment.itemId,
      note:     assignment.note,
      design:   assignment.design,
      pname:    assignment.pname,
      photo:    assignment.photo,
    })
  }

  const handleAddToBag = () => {
    if (!drawer) return
    // Lifted state must be updated from the handler, never inside a setState
    // updater — React runs updaters during render.
    onChange(upsertAssignment(assignments, {
      itemId:   drawer.itemId,
      optionId: drawer.optionId,
      note:     drawer.note,
      design:   drawer.design,
      pname:    drawer.pname,
      photo:    drawer.photo,
    }))
    // Adding closes the panel; the list is where the result is seen, and Edit
    // reopens the panel for changes.
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

  const activeOption = drawer
    ? findOption(drawer.itemId, drawer.optionId)
    : null
  const activeItem = drawer
    ? items.find(i => i.id === drawer.itemId) ?? null
    : null

  const wrappedCount = items.filter(i => assignments.some(a => a.itemId === i.id)).length

  const pendingRemoveItem = pendingRemoveId
    ? items.find(i => i.id === pendingRemoveId) ?? null
    : null

  // ── Single-item body: packaging cards, or the wrapped row once assigned ────
  const soleItem       = items[0] ?? null
  const soleAssignment = soleItem
    ? assignments.find(a => a.itemId === soleItem.id) ?? null
    : null
  const soleOption = soleAssignment
    ? findOption(soleAssignment.itemId, soleAssignment.optionId)
    : null


  return (
    <section className={styles.section} aria-labelledby="gifting-options-heading">
      {/* Heading and count are one block, so the section's own gap sets the
          distance to the content rather than sitting between the two. */}
      <div className={styles.sectionHeader}>
        <h2 id="gifting-options-heading" className={styles.heading}>
          {/* What is on offer, read off the options themselves: item-bound
              options are a note card cut to that product, not packaging the
              brand stocks. Any brand whose options move that way gets this
              heading without a change here. */}
          {`${step}. ${optionsAreItemBound ? 'Add Gift Note' : 'Add Gift Packaging'}`}
          <span className={styles.headingIcon} aria-hidden="true"><GiftIcon size={32} /></span>
        </h2>

        {/* Only once something is actually added — a tick against zero would be
            a lie, and the prompt below already covers the empty state. */}
        {wrappedCount > 0 && (
          <p className={styles.wrapCount} aria-live="polite">
            <span className={styles.wrapCountCheck} aria-hidden="true">
              <CheckmarkIcon size={16} />
            </span>
            {/* Names what was actually added. Read off the options, like the
                heading above it — a brand whose options are notes rather than
                packaging says so here too. */}
            {optionsAreItemBound
              ? (isMultiItem
                  ? `Gift note added to ${wrappedCount} of ${items.length} items`
                  : 'Gift note added')
              : (isMultiItem
                  ? `Gift packaging added to ${wrappedCount} of ${items.length} items`
                  : 'Gift packaging added')}
          </p>
        )}
      </div>

      {optionsAreItemBound ? (
        /* One card per cart item, in cart order — each card is its item, so
           there is nothing to pick between and no item step to render. A card
           becomes the assigned row in place once its note is added. */
        <ul className={styles.itemStateList}>
          {items.map(item => {
            const assignment = assignments.find(a => a.itemId === item.id)
            const assigned   = assignment
              ? findOption(item.id, assignment.optionId)
              : null

            if (assignment && assigned) {
              return (
                <AssignedItemRow
                  key={item.id}
                  item={item}
                  option={assigned}
                  assignment={assignment}
                  icons={icons}
                  designs={designs}
                  onEdit={handleEdit}
                  onRemove={handleRequestRemove}
                />
              )
            }

            return optionsFor(item).map(option => (
              <li key={`${item.id}-${option.id}`} className={styles.itemStateGroup}>
                <GiftOptionCard
                  option={option}
                  itemName={item.name}
                  icons={icons}
                  onSelect={o => openPanel(
                    item.id, o.id, document.activeElement as HTMLElement | null)}
                />
              </li>
            ))
          })}
        </ul>
      ) : isMultiItem ? (
        <GiftItemList
          items={items}
          options={options}
          assignments={assignments}
          icons={icons}
          designs={designs}
          activeItemId={drawer?.itemId ?? null}
          onAdd={openPanel}
          onEdit={handleEdit}
          onRemove={handleRequestRemove}
        />
      ) : soleItem && soleAssignment && soleOption ? (
        <ul className={styles.itemStateList}>
          <AssignedItemRow
            item={soleItem}
            option={soleOption}
            assignment={soleAssignment}
            icons={icons}
            designs={designs}
            onEdit={handleEdit}
            onRemove={handleRequestRemove}
          />
        </ul>
      ) : (
        <div className={options.length > 1 ? styles.optionRow : styles.optionList}>
          {options.map(option => (
            <GiftOptionCard
              key={option.id}
              option={option}
              icons={icons}
              availability={availabilityNote(option, items, options)}
              onSelect={o => handleSelectOption(o, document.activeElement as HTMLElement | null)}
            />
          ))}
        </div>
      )}

      {drawer && activeOption && (
        <GiftingDrawer
          icons={icons}
          designs={designs}
          option={activeOption}
          item={activeItem}
          note={drawer.note}
          design={drawer.design}
          pname={drawer.pname}
          photo={drawer.photo}
          onNoteChange={note => setDrawer(prev => prev && ({ ...prev, note }))}
          onDesignChange={design => setDrawer(prev => prev && ({ ...prev, design }))}
          onNameChange={pname => setDrawer(prev => prev && ({ ...prev, pname }))}
          onPhotoChange={photo => setDrawer(prev => prev && ({ ...prev, photo }))}
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
