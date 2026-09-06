'use client'

import { useCallback, useRef, useState } from 'react'
import { GiftOptionCard } from './GiftOptionCard'
import { GiftedItemsSummary } from './GiftedItemsSummary'
import { GiftingDrawer } from './GiftingDrawer'
import {
  isItemEligible,
  upsertAssignment,
  type CartItem,
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
  onChange:    (assignments: GiftAssignment[]) => void
  onGenerateNote: () => Promise<string>
}

interface DrawerState {
  /** null until packaging is chosen (entry point 2). */
  optionId:      string | null
  itemId:        string | null
  /** Entry points 2 and 3 fix the item, so it is shown resolved with no Change. */
  itemFixed:     boolean
  note:          string
  /** Showing the packaging chooser rather than the note. */
  pickPackaging: boolean
}

export function GiftingOptions({
  options, items, assignments, icons, onChange, onGenerateNote,
}: GiftingOptionsProps) {
  const { GiftIcon } = icons

  const [drawer, setDrawer] = useState<DrawerState | null>(null)
  // Soft default for the second pass.
  const lastOptionIdRef = useRef<string | null>(null)
  // Restores focus to whatever opened the drawer.
  const triggerRef = useRef<HTMLElement | null>(null)

  const noteFor = (itemId: string) => assignments.find(a => a.itemId === itemId)?.note ?? ''

  const closeDrawer = useCallback(() => {
    setDrawer(null)
    triggerRef.current?.focus()
    triggerRef.current = null
  }, [])

  const openForOption = (option: GiftOption, trigger?: HTMLElement | null) => {
    if (trigger) triggerRef.current = trigger
    lastOptionIdRef.current = option.id

    // Resolve the item when there is no real choice to make: a one-item bag, or a
    // bag where every other item is already wrapped. With two or more unwrapped,
    // the shopper picks.
    const unassigned = items.filter(i =>
      !assignments.some(a => a.itemId === i.id) && isItemEligible(option, i.id))
    const onlyItem = items.length === 1
      ? items[0]
      : unassigned.length === 1 ? unassigned[0] : null
    setDrawer({
      optionId:      option.id,
      itemId:        onlyItem?.id ?? null,
      itemFixed:     false,
      note:          onlyItem ? noteFor(onlyItem.id) : '',
      pickPackaging: false,
    })
  }

  const handleEdit = (assignment: GiftAssignment) => {
    lastOptionIdRef.current = assignment.optionId
    setDrawer({
      optionId:      assignment.optionId,
      itemId:        assignment.itemId,
      itemFixed:     true,
      note:          assignment.note,
      pickPackaging: false,
    })
  }

  /** Entry point 2: the item is fixed, packaging is not yet chosen. */
  const handleAddGifting = (itemId: string, trigger?: HTMLElement | null) => {
    if (trigger) triggerRef.current = trigger
    setDrawer({
      optionId:      null,
      itemId,
      itemFixed:     true,
      note:          '',
      pickPackaging: true,
    })
  }

  /** Chooses packaging inside the drawer and moves on to the note. */
  const handlePickPackaging = (option: GiftOption) => {
    lastOptionIdRef.current = option.id
    setDrawer(prev => prev && ({ ...prev, optionId: option.id, pickPackaging: false }))
  }

  const handleSelectItem = (itemId: string) => {
    // Reassigning an already-wrapped item prefills its existing note.
    const note = noteFor(itemId)
    setDrawer(prev => prev && ({ ...prev, itemId, note }))
  }

  const handleAddToBag = () => {
    if (!drawer?.itemId || !drawer.optionId) return
    // Lifted state must be updated from the handler, never inside a setState
    // updater — React runs updaters during render.
    onChange(upsertAssignment(assignments, {
      itemId:   drawer.itemId,
      optionId: drawer.optionId,
      note:     drawer.note,
    }))
    // Adding closes the drawer; the summary list is where the result is seen,
    // and Edit reopens the drawer for changes.
    closeDrawer()
  }

  const activeOption = drawer?.optionId
    ? options.find(o => o.id === drawer.optionId) ?? null
    : null

  const hasAssignments = assignments.length > 0
  const isSingle       = options.length === 1
  const preselectId = lastOptionIdRef.current

  return (
    <section className={styles.section} aria-labelledby="gifting-options-heading">
      <h2 id="gifting-options-heading" className={styles.heading}>
        3. Add Gifting Options
        <span className={styles.headingIcon} aria-hidden="true"><GiftIcon size={32} /></span>
      </h2>

      {hasAssignments ? (
        <GiftedItemsSummary
          assignments={assignments}
          items={items}
          options={options}
          icons={icons}
          onEdit={handleEdit}
          onAddGifting={itemId => handleAddGifting(itemId, document.activeElement as HTMLElement | null)}
          onRemove={itemId => onChange(assignments.filter(a => a.itemId !== itemId))}
        />
      ) : (
        <div className={styles.optionList}>
          {options.map(option => (
            <GiftOptionCard
              key={option.id}
              option={option}
              preselected={!isSingle && option.id === preselectId}
              onSelect={o => openForOption(o, document.activeElement as HTMLElement | null)}
            />
          ))}
        </div>
      )}


      {drawer && (
        <GiftingDrawer
          options={options}
          items={items}
          assignments={assignments}
          icons={icons}
          option={activeOption}
          selectedItemId={drawer.itemId}
          itemFixed={drawer.itemFixed}
          pickPackaging={drawer.pickPackaging}
          note={drawer.note}
          onSelectItem={handleSelectItem}
          onPickPackaging={handlePickPackaging}
          onChangePackaging={() => setDrawer(prev => prev && ({ ...prev, pickPackaging: true }))}
          onNoteChange={note => setDrawer(prev => prev && ({ ...prev, note }))}
          onAddToBag={handleAddToBag}
          onClose={closeDrawer}
          onGenerateNote={onGenerateNote}
        />
      )}
    </section>
  )
}
