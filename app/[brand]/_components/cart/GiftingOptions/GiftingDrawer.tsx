'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../Button'
import { PanelPortal } from '../../PanelPortal'
import {
  formatPrice,
  requiredFieldsMet,
  MAX_NAME_LENGTH,
  MAX_NOTE_LENGTH,
  type CartItem,
  type DesignOption,
  type GiftOption,
  type GiftingIcons,
} from './types'
import styles from './GiftingOptions.module.css'

const COUNTER_ANNOUNCE_DELAY = 900

interface GiftingDrawerProps {
  icons:   GiftingIcons
  designs: DesignOption[]
  /** Settled before the panel opens and never swappable from inside it. */
  option:  GiftOption
  item:    CartItem | null
  note:    string
  design:  string | null
  pname:   string
  photo:   boolean
  onNoteChange:   (note: string) => void
  onDesignChange: (design: string) => void
  onNameChange:   (pname: string) => void
  onPhotoChange:  (photo: boolean) => void
  onAddToBag:     () => void
  onClose:        () => void
  onGenerateNote: () => Promise<string>
}

/**
 * Configuration for one item's packaging. Both entry paths settle the item and
 * the option first, so this panel only ever collects fields — to use different
 * packaging the shopper closes it and picks again.
 */
export function GiftingDrawer({
  icons, designs, option, item, note, design, pname, photo,
  onNoteChange, onDesignChange, onNameChange, onPhotoChange,
  onAddToBag, onClose, onGenerateNote,
}: GiftingDrawerProps) {
  const { XIcon } = icons

  const panelRef  = useRef<HTMLDivElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)
  const titleId   = useId()
  const counterId = useId()
  const nameCounterId = useId()

  const [open, setOpen]                     = useState(false)
  const [generating, setGenerating]         = useState(false)
  const [announcedCount, setAnnouncedCount] = useState(note.length)

  // Double rAF: the portal must commit with the closed transform before we flip,
  // otherwise the panel renders already-open and the slide-in never plays.
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
  }, [])

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

  // The note is optional by design and must never gate the primary action; only
  // the fields the option marks required can.
  const primaryDisabled = !requiredFieldsMet(option, { pname, photo })

  // ── Design tiles: roving tabindex across the grid ───────────────────────────
  const onDesignKeyDown = (e: React.KeyboardEvent, index: number) => {
    const isNext = e.key === 'ArrowRight' || e.key === 'ArrowDown'
    const isPrev = e.key === 'ArrowLeft'  || e.key === 'ArrowUp'
    if (!isNext && !isPrev) return
    e.preventDefault()
    const next = (index + (isNext ? 1 : -1) + designs.length) % designs.length
    onDesignChange(designs[next].key)
    panelRef.current?.querySelectorAll<HTMLElement>('[data-design-tile]')[next]?.focus()
  }

  const selectedDesign = designs.find(d => d.key === design) ?? null

  // The preview follows the chosen design so the shopper sees what ships.
  const previewImage = selectedDesign?.image ?? option.imageUrl

  const designBlock = option.designs && designs.length > 0 && (
    <div className={styles.fieldBlock}>
      <span className={styles.fieldLabel}>Choose a design</span>
      <div className={styles.designGrid} role="radiogroup" aria-label="Choose a design">
        {designs.map((d, index) => (
          <button
            key={d.key}
            data-design-tile
            type="button"
            role="radio"
            aria-checked={d.key === design}
            tabIndex={d.key === design || (!selectedDesign && index === 0) ? 0 : -1}
            className={`${styles.designTile} ${d.key === design ? styles.designTileSelected : ''}`}
            onClick={() => onDesignChange(d.key)}
            onKeyDown={e => onDesignKeyDown(e, index)}
          >
            {d.image ? (
              <span className={styles.designTileImageWrap}>
                <img src={d.image} alt="" aria-hidden="true" className={styles.designTileImage} />
              </span>
            ) : (
              <span className={styles.designTilePlaceholder} aria-hidden="true" />
            )}
            <span className={styles.designTileLabel}>{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  const nameBlock = option.wantsName && (
    <div className={styles.fieldBlock}>
      <label className={styles.fieldLabel} htmlFor={`${titleId}-name`}>Name on the box</label>
      <div className={styles.nameFieldWrap}>
        <input
          id={`${titleId}-name`}
          type="text"
          className={styles.nameInput}
          placeholder="Enter name"
          value={pname}
          autoComplete="off"
          /* No visible badge, but the field is still announced as required. */
          required
          aria-required="true"
          aria-describedby={pname ? nameCounterId : undefined}
          onChange={e => onNameChange(e.target.value.slice(0, MAX_NAME_LENGTH))}
        />
        {/* Only once there is something to count. */}
        {pname.length > 0 && (
          <span id={nameCounterId} className={styles.nameCounter} aria-live="polite">
            {pname.length}/{MAX_NAME_LENGTH}
          </span>
        )}
      </div>
    </div>
  )

  const photoBlock = option.wantsPhoto && (
    <div className={styles.fieldBlock}>
      <span className={styles.fieldLabel}>Upload a photo</span>
      {/* The button below is the real control, so the input stays out of the
          tab order rather than making the shopper tab past a hidden field. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className={styles.photoInput}
        tabIndex={-1}
        aria-hidden="true"
        onChange={e => onPhotoChange(Boolean(e.target.files?.length))}
      />
      <button
        type="button"
        className={styles.photoButton}
        onClick={() => fileRef.current?.click()}
      >
        {photo ? 'Photo added · Replace' : 'Add photo'}
      </button>
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
        {/* Title row — option name, item name beneath, close button right */}
        <header className={styles.drawerHeader}>
          <span className={styles.drawerTitleGroup}>
            <h2 id={titleId} className={styles.drawerTitle}>Add {option.name}</h2>
            {item && <span className={styles.drawerCaption}>{item.name}</span>}
          </span>
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
          <div className={styles.optionBlock}>
            <span className={styles.optionBlockThumb}>
              <img
                src={previewImage}
                alt=""
                aria-hidden="true"
                className={styles.optionBlockImage}
              />
            </span>
            <div className={styles.optionBlockText}>
              {/* Name + short description, matching how the option reads in the
                  list — not the long single-sentence form. An option without
                  one is the image, the name and the price, and nothing more. */}
              <p className={styles.optionBlockName}>{option.name}</p>
              {option.description && (
                <p className={styles.optionBlockDescription}>{option.description}</p>
              )}
              <p className={styles.optionBlockPrice}>{formatPrice(option.price)}</p>
            </div>
          </div>

          <hr className={styles.drawerDivider} />

          <div className={styles.stepArea}>
            {designBlock}
            {nameBlock}
            {photoBlock}

            <div className={styles.noteBlock}>
              <div className={styles.noteLabelRow}>
                <span className={styles.noteLabel}>Your Gift Note:</span>
                <button
                  type="button"
                  className={styles.noteAssist}
                  onClick={handleGenerate}
                  disabled={generating}
                >
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
