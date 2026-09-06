'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../Button'
import { GiftOptionCard } from './GiftOptionCard'
import { PanelPortal } from './PanelPortal'
import {
  formatPrice,
  isItemEligible,
  type CartItem,
  type GiftAssignment,
  type GiftOption,
  type GiftingIcons,
} from './types'
import styles from './GiftingOptions.module.css'

const MAX_NOTE_LENGTH = 280
const COUNTER_ANNOUNCE_DELAY = 900

interface GiftingDrawerProps {
  options:      GiftOption[]
  items:        CartItem[]
  assignments:  GiftAssignment[]
  icons:        GiftingIcons
  /** null while packaging is still being chosen (entry point 2). */
  option:         GiftOption | null
  selectedItemId: string | null
  /** Entry points 2 and 3 arrive without a packaging choice, so it stays swappable. */
  packagingChangeable: boolean
  pickPackaging:  boolean
  note:           string
  onSelectItem:   (itemId: string) => void
  onPickPackaging:   (option: GiftOption) => void
  onChangePackaging: () => void
  onNoteChange:   (note: string) => void
  onAddToBag:     () => void
  onClose:        () => void
  onGenerateNote: () => Promise<string>
}

export function GiftingDrawer({
  options, items, assignments, icons, option, selectedItemId, packagingChangeable, pickPackaging, note,
  onSelectItem, onPickPackaging, onChangePackaging, onNoteChange, onAddToBag, onClose, onGenerateNote,
}: GiftingDrawerProps) {
  const { XIcon } = icons

  const panelRef  = useRef<HTMLDivElement>(null)
  const titleId   = useId()
  const groupId   = useId()
  const counterId = useId()

  const [open, setOpen]                     = useState(false)
  const [generating, setGenerating]         = useState(false)
  const [focusedIndex, setFocusedIndex]     = useState(0)
  const [announcedCount, setAnnouncedCount] = useState(note.length)

  // Selecting and advancing are separate actions: a card sets the pending choice,
  // NEXT commits it. Seeded from the committed item so Change keeps the selection.
  const [pendingItemId, setPendingItemId] = useState<string | null>(selectedItemId)
  useEffect(() => { setPendingItemId(selectedItemId) }, [selectedItemId])

  // Cart size is a line-item count; a line never carries a quantity in this model.
  const isSingleItem  = items.length === 1

  useEffect(() => {
    let inner = 0
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setOpen(true)) })
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner) }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // ── Focus trap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const focusables = () => Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(el => el.offsetParent !== null)

    focusables()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (list.length === 0) return
      const first = list[0]
      const last  = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    panel.addEventListener('keydown', onKeyDown)
    return () => panel.removeEventListener('keydown', onKeyDown)
  }, [pendingItemId])

  // Counter announces on a delay, not on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setAnnouncedCount(note.length), COUNTER_ANNOUNCE_DELAY)
    return () => clearTimeout(t)
  }, [note])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const generated = await onGenerateNote()
      onNoteChange(generated.slice(0, MAX_NOTE_LENGTH))
    } finally {
      setGenerating(false)
    }
  }

  // ── Item cards: roving tabindex, arrows move focus, Enter/Space selects ─────
  // Already-wrapped items drop out of the picker; the one being worked on stays,
  // so Edit and Change can still show and re-select it.
  const selectableItems = items.filter(i =>
    i.id === selectedItemId || !assignments.some(a => a.itemId === i.id))

  const selectableIndexes = selectableItems
    .map((item, i) => (!option || isItemEligible(option, item.id) ? i : -1))
    .filter(i => i !== -1)

  const moveFocus = (delta: number) => {
    if (selectableIndexes.length === 0) return
    const pos  = selectableIndexes.indexOf(focusedIndex)
    const next = selectableIndexes[
      (((pos === -1 ? 0 : pos) + delta) % selectableIndexes.length + selectableIndexes.length)
        % selectableIndexes.length
    ]
    setFocusedIndex(next)
    panelRef.current?.querySelectorAll<HTMLElement>('[data-item-card]')[next]?.focus()
  }

  const onCardKeyDown = (e: React.KeyboardEvent, itemId: string, eligible: boolean) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); moveFocus(1) }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(-1) }
    else if ((e.key === 'Enter' || e.key === ' ') && eligible) { e.preventDefault(); chooseItem(itemId) }
  }

  // One continuous view: choosing an item collapses the list and reveals the note.
  const resolvedItemId = isSingleItem ? (items[0]?.id ?? null) : pendingItemId
  const resolvedItem   = items.find(i => i.id === resolvedItemId) ?? null

  // Options this item can actually use — ineligible ones never reach the chooser.
  const eligibleOptions = options.filter(o => !resolvedItemId || isItemEligible(o, resolvedItemId))


  const primaryDisabled = pickPackaging || !option || !resolvedItemId || note.trim().length === 0

  const chooseItem = (itemId: string) => {
    setPendingItemId(itemId)
    onSelectItem(itemId)
  }

  const itemCard = (item: CartItem, index: number, mode: 'select' | 'chosen') => {
    const eligible = !option || isItemEligible(option, item.id)
    const existing = assignments.find(a => a.itemId === item.id)
    const existingOption = existing && options.find(o => o.id === existing.optionId)
    const chosen = item.id === pendingItemId

    const common = (
      <>
        <span className={styles.itemCardThumb}>
          <img src={item.imageUrl} alt="" aria-hidden="true" className={styles.itemCardImage} />
        </span>
        <span className={styles.itemCardBody}>
          <span className={styles.itemCardName}>{item.name}</span>
          {existingOption && mode === 'select' && (
            <span className={styles.itemCardBadge}>{existingOption.name}</span>
          )}
          {!eligible && mode === 'select' && (
            <span className={styles.itemCardReason}>Not available for this piece</span>
          )}
          {mode === 'chosen' ? (
            <span className={styles.itemCardAction}>Change</span>
          ) : eligible ? (
            <span className={styles.itemCardAction}>{chosen ? 'Selected' : 'Select'}</span>
          ) : null}
        </span>
      </>
    )

    if (mode === 'chosen') {
      return (
        <button
          type="button"
          className={`${styles.itemCard} ${styles.itemCardChosen}`}
          onClick={() => setPendingItemId(null)}
        >
          {common}
        </button>
      )
    }

    return (
      <div
        key={item.id}
        data-item-card
        role="radio"
        aria-checked={chosen}
        aria-disabled={!eligible}
        tabIndex={index === focusedIndex ? 0 : -1}
        className={[
          styles.itemCard,
          chosen ? styles.itemCardSelected : '',
          !eligible ? styles.itemCardDisabled : '',
        ].filter(Boolean).join(' ')}
        onClick={() => eligible && chooseItem(item.id)}
        onFocus={() => setFocusedIndex(index)}
        onKeyDown={e => onCardKeyDown(e, item.id, eligible)}
      >
        {common}
      </div>
    )
  }

  const noteBlock = (
    <div className={styles.noteBlock}>
      <div className={styles.noteLabelRow}>
        <span className={styles.noteLabel}>Your Gift Note:</span>
        <button type="button" className={styles.noteAssist} onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating' : 'Create Gift Note'}
        </button>
      </div>

      <div className={styles.noteFieldWrap}>
        <textarea
          className={styles.noteTextarea}
          aria-label="Gift note"
          aria-describedby={counterId}
          placeholder="Write your message or generate one with our AI gift note assistant"
          value={note}
          rows={5}
          onChange={e => onNoteChange(e.target.value.slice(0, MAX_NOTE_LENGTH))}
        />
        <span id={counterId} className={styles.noteCounter} aria-live="polite">
          {announcedCount}/{MAX_NOTE_LENGTH}
        </span>
      </div>
    </div>
  )

  return (
    <PanelPortal>
      <div
        className={`${styles.drawerOverlay} ${open ? styles.drawerOverlayVisible : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Title row — option name only, close button right */}
        <header className={styles.drawerHeader}>
          <h2 id={titleId} className={styles.drawerTitle}>
            {option && !pickPackaging ? `Add ${option.name}` : 'Add Gifting'}
          </h2>
          <button
            type="button"
            className={styles.drawerClose}
            aria-label="Close gifting options"
            onClick={onClose}
          >
            <XIcon size={24} />
          </button>
        </header>

        <div className={styles.drawerBody}>
          {/* Descriptive block — only once packaging is settled */}
          {option && !pickPackaging && (
            <>
              <div className={styles.optionBlock}>
                <span className={styles.optionBlockThumb}>
                  <img src={option.imageUrl} alt="" aria-hidden="true" className={styles.optionBlockImage} />
                </span>
                <div className={styles.optionBlockText}>
                  <p className={styles.optionBlockDescription}>
                    {option.longDescription ?? option.description}
                  </p>
                  <p className={styles.optionBlockPrice}>{formatPrice(option.price)}</p>
                  {packagingChangeable && eligibleOptions.length > 1 && (
                    <button type="button" className={styles.optionBlockChange} onClick={onChangePackaging}>
                      Change
                    </button>
                  )}
                </div>
              </div>

              <hr className={styles.drawerDivider} />
            </>
          )}

          <div className={styles.stepArea} aria-live="polite">

            {/* Item — fixed by the entry point, or chosen here */}
            {!isSingleItem && (
              <>
                <h3 className={styles.stepHeading} id={groupId}>Which item is this gift for?</h3>
                {resolvedItem ? (
                  <div className={styles.itemCardList}>{itemCard(resolvedItem, 0, 'chosen')}</div>
                ) : (
                  <div className={styles.itemCardList} role="radiogroup" aria-labelledby={groupId}>
                    {selectableItems.map((item, index) => itemCard(item, index, 'select'))}
                  </div>
                )}
              </>
            )}

            {/* Packaging chooser — entry point 2, and the reverse of Change packaging */}
            {pickPackaging || !option ? (
              <>
                <h3 className={styles.stepHeading}>Choose your gift packaging</h3>
                <div className={styles.packagingList}>
                  {eligibleOptions.map(o => (
                    <GiftOptionCard key={o.id} option={o} onSelect={onPickPackaging} />
                  ))}
                </div>
              </>
            ) : (
              resolvedItemId && (
                <>
                  {noteBlock}
                </>
              )
            )}

          </div>
        </div>

        <footer className={styles.drawerFooter}>
          <button type="button" className={styles.drawerCancel} onClick={onClose}>Cancel</button>
          <Button variant="primary" onClick={onAddToBag} disabled={primaryDisabled}>
            Add to bag
          </Button>
        </footer>
      </div>
    </PanelPortal>
  )
}
