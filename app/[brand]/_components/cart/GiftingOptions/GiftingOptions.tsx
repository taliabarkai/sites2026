'use client'

import { useCallback, useRef, useState } from 'react'
import { AssignedItemRow } from './AssignedItemRow'
import { GiftItemList } from './GiftItemList'
import { GiftOptionCard } from './GiftOptionCard'
import { GiftingDrawer } from './GiftingDrawer'
import { RemoveGiftDialog } from './RemoveGiftDialog'
import {
  upsertAssignment,
  type CartItem,
  type DesignOption,
  type GiftAssignment,
  type GiftOption,
  type GiftingIcons,
} from './types'
import styles from './GiftingOptions.module.css'

interface GiftingOptionsProps {
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
  options, items, assignments, icons, designs, onChange, onGenerateNote,
}: GiftingOptionsProps) {
  const { GiftIcon } = icons

  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  // Removal is confirmed rather than immediate whenever a note would be lost.
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  // Restores focus to whatever opened the drawer.
  const triggerRef = useRef<HTMLElement | null>(null)

  // A one-item bag has no item to choose, so packaging leads. Two or more and
  // the bag leads instead: the shopper says which piece before anything else.
  const isMultiItem = items.length > 1

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

    const option   = options.find(o => o.id === optionId) ?? null
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
    ? options.find(o => o.id === drawer.optionId) ?? null
    : null
  const activeItem = drawer
    ? items.find(i => i.id === drawer.itemId) ?? null
    : null

  const pendingRemoveItem = pendingRemoveId
    ? items.find(i => i.id === pendingRemoveId) ?? null
    : null

  // ── Single-item body: packaging cards, or the wrapped row once assigned ────
  const soleItem       = items[0] ?? null
  const soleAssignment = soleItem
    ? assignments.find(a => a.itemId === soleItem.id) ?? null
    : null
  const soleOption = soleAssignment
    ? options.find(o => o.id === soleAssignment.optionId) ?? null
    : null


  return (
    <section className={styles.section} aria-labelledby="gifting-options-heading">
      <h2 id="gifting-options-heading" className={styles.heading}>
        3. Add Gifting Options
        <span className={styles.headingIcon} aria-hidden="true"><GiftIcon size={32} /></span>
      </h2>

      {isMultiItem ? (
        <>
          <h3 className={styles.itemsPrompt}>Which items would you like to gift wrap?</h3>
          <GiftItemList
            items={items}
            options={options}
            assignments={assignments}
            icons={icons}
            onAdd={openPanel}
            onEdit={handleEdit}
            onRemove={handleRequestRemove}
          />
        </>
      ) : soleItem && soleAssignment && soleOption ? (
        <ul className={styles.itemStateList}>
          <AssignedItemRow
            item={soleItem}
            option={soleOption}
            assignment={soleAssignment}
            icons={icons}
            onEdit={handleEdit}
            onRemove={handleRequestRemove}
          />
        </ul>
      ) : (
        <div className={styles.optionList}>
          {options.map(option => (
            <GiftOptionCard
              key={option.id}
              option={option}
              icons={icons}
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
