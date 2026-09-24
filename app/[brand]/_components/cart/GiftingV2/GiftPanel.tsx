'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type React from 'react'
import { Button } from '../../Button'
import { PanelPortal } from '../../PanelPortal'
import type { IconProps } from '@/src/components/icons/Icon'
import {
  formatPrice,
  requiredFieldsMet,
  MAX_NAME_LENGTH,
  MAX_NOTE_LENGTH,
  type CartItem,
  type DesignOption,
  type GiftOption,
  type GiftingIcons,
} from '../GiftingOptions/types'
/* The panel chrome is V1's, imported wholesale: the sheet and its breakpoint,
   the header, the option block, the divider, the fields and the footer. V2 adds
   a step in front of it — it is not a different panel. Only what V2 genuinely
   adds (Back, the item step, the Required badge, the design chips) is styled
   locally. */
import v1 from '../GiftingOptions/GiftingOptions.module.css'
import styles from './GiftingV2.module.css'

const COUNTER_ANNOUNCE_DELAY = 900

/**
 * V2 needs a back affordance that V1 has no step to go back from, so it asks
 * for one more icon than V1's set. Extending rather than widening
 * `GiftingIcons` leaves V1's contract exactly as it was.
 */
export interface GiftingV2Icons extends GiftingIcons {
  /** Rotated to read as an "i" — the panel's only informational affordance. */
  WarningIcon: React.ComponentType<IconProps>
}

/**
 * A cart line as V2 shows it. Widens V1's `CartItem` with the price, which the
 * item cards display — additive, and a subtype, so it still satisfies every V1
 * helper without V1's own type changing.
 */
export interface GiftItem extends CartItem {
  /** Minor units (cents). Omitted and the card simply shows no price. */
  price?: number
}

/** Last entry is the step on screen; length > 1 is what puts Back in the header. */
export type PanelStep = 'item' | 'config'

export interface PanelDraft {
  optionId: string
  itemId:   string | null
  history:  PanelStep[]
  note:     string
  design:   string | null
  pname:    string
  photo:    boolean
}

interface GiftPanelProps {
  icons:   GiftingV2Icons
  /** Settled on the page before the panel opens, and never changeable inside it. */
  option:  GiftOption
  /** The items still open to this packaging — what the item step offers. */
  eligibleItems: GiftItem[]
  /**
   * The chosen item. Passed in rather than looked up: when editing, the item is
   * already wrapped and so is deliberately absent from `eligibleItems`.
   */
  selectedItem?: GiftItem
  /** Names the pieces this packaging cannot go on, when there are any. */
  exclusionNote?: string
  /** Brand-scoped printed designs, shared by every option flagged `designs`. */
  designs: DesignOption[]
  draft:   PanelDraft
  onDraftChange: (next: PanelDraft) => void
  onAddToBag:    () => void
  onClose:       () => void
  onGenerateNote: () => Promise<string>
}

/**
 * Personalization for one item's packaging, and — only when the answer is
 * genuinely open — the step that asks which item it is for.
 *
 * Packaging is never chosen here. All three ways in settle it on the page
 * first, so the panel only ever collects: which item, then the fields.
 */
export function GiftPanel({
  icons, option, eligibleItems, selectedItem, exclusionNote, designs,
  draft, onDraftChange, onAddToBag, onClose, onGenerateNote,
}: GiftPanelProps) {
  const { XIcon, CheckmarkIcon, WarningIcon } = icons

  // State, not a ref: PanelPortal returns null on its first render, so a
  // `[]`-keyed effect would run before the node exists and bail. Keying on the
  // node itself is what makes the trap and the per-step focus actually arm.
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const titleId       = useId()
  const noteCounterId = useId()
  const nameCounterId = useId()
  const nameFieldId   = useId()
  const tipId         = useId()

  const [open, setOpen]                     = useState(false)
  const [generating, setGenerating]         = useState(false)
  const [announcedCount, setAnnouncedCount] = useState(draft.note.length)
  const [tipOpen, setTipOpen]               = useState(false)

  const step      = draft.history[draft.history.length - 1]
  const canGoBack = draft.history.length > 1

  const patch = (next: Partial<PanelDraft>) => onDraftChange({ ...draft, ...next })

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
    if (!panelEl) return

    const focusables = () => Array.from(
      panelEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(el => el.offsetParent !== null)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (list.length === 0) return
      const first = list[0]
      const last  = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    panelEl.addEventListener('keydown', onKeyDown)
    return () => panelEl.removeEventListener('keydown', onKeyDown)
  }, [panelEl])

  // Each step is a new screen, so focus goes to the top of its content — the
  // body, not the header. Landing on Back the instant you press Next reads as
  // having gone nowhere.
  useEffect(() => {
    if (!panelEl) return
    const body = panelEl.querySelector<HTMLElement>(`.${v1.drawerBody}`) ?? panelEl

    // The radiogroup's tab stop is the point of the item step, and the tooltip
    // beside the question is not: it precedes the cards in the DOM, and focusing
    // it would pop its bubble open every time the step appeared.
    const first =
      body.querySelector<HTMLElement>('[role="radio"][tabindex="0"]') ??
      Array.from(
        body.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([data-info-tip]), textarea, input, [tabindex="0"]',
        ),
      ).filter(el => el.offsetParent !== null)[0]

    first?.focus()
  }, [step, panelEl])

  // Counter announces on a delay, not on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setAnnouncedCount(draft.note.length), COUNTER_ANNOUNCE_DELAY)
    return () => clearTimeout(t)
  }, [draft.note])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const generated = await onGenerateNote()
      patch({ note: generated.slice(0, MAX_NOTE_LENGTH) })
    } finally {
      setGenerating(false)
    }
  }

  const selectedDesign = designs.find(d => d.key === draft.design) ?? null
  // The preview follows the chosen design, so the shopper sees what ships.
  const previewImage = selectedDesign?.image ?? option.imageUrl

  /** Shared by both radiogroups: arrows move the selection and the focus together. */
  const rovingKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    length: number,
    selector: string,
    onMove: (nextIndex: number) => void,
  ) => {
    const isNext = e.key === 'ArrowRight' || e.key === 'ArrowDown'
    const isPrev = e.key === 'ArrowLeft'  || e.key === 'ArrowUp'
    if (!isNext && !isPrev) return
    e.preventDefault()
    const next = (index + (isNext ? 1 : -1) + length) % length
    onMove(next)
    panelEl?.querySelectorAll<HTMLElement>(selector)[next]?.focus()
  }

  // ── Step: which item ────────────────────────────────────────────────────────
  const itemStep = (
    <div className={v1.stepArea}>
      <div className={styles.stepHeadingRow}>
        <h3 className={styles.stepHeading}>Which item is this gift for?</h3>

        {/* The exclusion is a footnote to the question, so it hangs off the
            question rather than sitting under the grid where it reads as a
            caption for the last card. */}
        {exclusionNote && (
          <span
            className={styles.infoWrap}
            onMouseEnter={() => setTipOpen(true)}
            onMouseLeave={() => setTipOpen(false)}
          >
            <button
              type="button"
              data-info-tip
              className={styles.infoButton}
              aria-label="Why some items are missing"
              aria-describedby={tipId}
              aria-expanded={tipOpen}
              onFocus={() => setTipOpen(true)}
              onBlur={() => setTipOpen(false)}
              onClick={() => setTipOpen(open => !open)}
            >
              {/* Upside down, so the warning glyph reads as an information "i". */}
              <span className={styles.infoIcon} aria-hidden="true">
                <WarningIcon size={16} />
              </span>
            </button>

            {/* Always in the DOM so aria-describedby resolves; only its
                visibility turns on and off. */}
            <span
              id={tipId}
              role="tooltip"
              className={`${styles.tooltip} ${tipOpen ? styles.tooltipVisible : ''}`}
            >
              {exclusionNote}
            </span>
          </span>
        )}
      </div>

      {/* Two columns at any count — the grid owns that, so there is no inline
          column maths here. */}
      <div
        className={styles.itemChoiceGroup}
        role="radiogroup"
        aria-label="Which item is this gift for?"
      >
        {eligibleItems.map((item, index) => {
          const checked = item.id === draft.itemId
          return (
            <button
              key={item.id}
              data-item-choice
              type="button"
              role="radio"
              aria-checked={checked}
              /* Nothing is chosen on open, so the first row carries the tab stop
                 until one is — otherwise the group would be unreachable. */
              tabIndex={checked || (draft.itemId === null && index === 0) ? 0 : -1}
              className={`${styles.itemChoice} ${checked ? styles.itemChoiceSelected : ''}`}
              onClick={() => patch({ itemId: item.id })}
              onKeyDown={e => rovingKeyDown(
                e, index, eligibleItems.length, '[data-item-choice]',
                next => patch({ itemId: eligibleItems[next].id }),
              )}
            >
              <span className={styles.itemChoiceThumbWrap}>
                <img src={item.imageUrl} alt="" aria-hidden="true" className={styles.itemChoiceThumb} />
              </span>
              <span className={styles.itemChoiceName}>{item.name}</span>
              {item.price != null && (
                <span className={styles.itemChoicePrice}>{formatPrice(item.price)}</span>
              )}
              {/* Top right, out of the reading path: the card is read downward
                  and the state is confirmed at its corner. */}
              <span
                className={`${styles.itemChoiceMark} ${checked ? styles.itemChoiceMarkSelected : ''}`}
                aria-hidden="true"
              >
                {checked && <CheckmarkIcon size={14} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  // ── Step: configuration ─────────────────────────────────────────────────────
  const designBlock = option.designs && designs.length > 0 && (
    <div className={v1.fieldBlock}>
      <span className={v1.fieldLabel} id={`${titleId}-designs`}>Choose a design</span>
      {/* Text chips rather than a thumbnail grid: design counts vary by brand
          and a grid stops working past about six. The preview above carries
          the artwork. */}
      <div className={styles.designChips} role="radiogroup" aria-labelledby={`${titleId}-designs`}>
        {designs.map((d, index) => {
          const checked = d.key === draft.design
          return (
            <button
              key={d.key}
              data-design-chip
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (!selectedDesign && index === 0) ? 0 : -1}
              className={`${styles.designChip} ${checked ? styles.designChipSelected : ''}`}
              onClick={() => patch({ design: d.key })}
              onKeyDown={e => rovingKeyDown(
                e, index, designs.length, '[data-design-chip]',
                next => patch({ design: designs[next].key }),
              )}
            >
              {d.label}
            </button>
          )
        })}
      </div>
    </div>
  )

  const photoBlock = option.wantsPhoto && (
    <div className={v1.fieldBlock}>
      <span className={styles.fieldLabelRow}>
        <span className={v1.fieldLabel}>Upload a photo</span>
        <span className={styles.fieldRequired}>Required</span>
      </span>
      {/* The button below is the real control, so the input stays out of the
          tab order rather than making the shopper tab past a hidden field. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className={v1.photoInput}
        tabIndex={-1}
        aria-hidden="true"
        onChange={e => patch({ photo: Boolean(e.target.files?.length) })}
      />
      <button type="button" className={v1.photoButton} onClick={() => fileRef.current?.click()}>
        {draft.photo ? 'Photo added · Replace' : 'Add photo'}
      </button>
    </div>
  )

  const nameBlock = option.wantsName && (
    <div className={v1.fieldBlock}>
      <span className={styles.fieldLabelRow}>
        <label className={v1.fieldLabel} htmlFor={nameFieldId}>Name on the box</label>
        <span className={styles.fieldRequired}>Required</span>
      </span>
      <div className={v1.nameFieldWrap}>
        <input
          id={nameFieldId}
          type="text"
          className={v1.nameInput}
          placeholder={`Up to ${MAX_NAME_LENGTH} characters`}
          value={draft.pname}
          autoComplete="off"
          required
          aria-required="true"
          aria-describedby={nameCounterId}
          onChange={e => patch({ pname: e.target.value.slice(0, MAX_NAME_LENGTH) })}
        />
        <span id={nameCounterId} className={v1.nameCounter} aria-live="polite">
          {draft.pname.length}/{MAX_NAME_LENGTH} characters
        </span>
      </div>
    </div>
  )

  const configStep = (
    <>
      {/* Which piece this is for, confirmed before the packaging it goes in —
          the shopper chose the item a screen ago and should not have to reopen
          the picker to check. Deliberately the item's own photograph: the
          packaging shot below cannot confirm which item was picked. */}
      {selectedItem && (
        <div className={`${v1.fieldBlock} ${styles.giftForBlock}`}>
          <span className={v1.fieldLabel}>Gift for</span>
          <div className={styles.giftForRow}>
            <span className={styles.giftForThumbWrap}>
              <img
                src={selectedItem.imageUrl}
                alt=""
                aria-hidden="true"
                className={styles.giftForThumb}
              />
            </span>
            <span className={styles.giftForName}>{selectedItem.name}</span>

            {/* Only when a picker was actually shown. The header's back arrow is
                the same action; this is the local one, for a mistake noticed
                mid-form. Going back keeps the draft, so anything already typed
                survives the change. */}
            {canGoBack && (
              <button
                type="button"
                className={styles.giftForChange}
                onClick={() => patch({ history: draft.history.slice(0, -1) })}
              >
                Change Item
              </button>
            )}
          </div>
        </div>
      )}

      {/* One rule closes the "Gift for" answer... */}
      {selectedItem && <hr className={v1.drawerDivider} />}

      {/* V1's option block: the preview on the left, name, contents and price
          stacked beside it. The image follows the chosen design. */}
      <div className={v1.optionBlock}>
        <span className={v1.optionBlockThumb}>
          <img src={previewImage} alt="" aria-hidden="true" className={v1.optionBlockImage} />
        </span>
        <div className={v1.optionBlockText}>
          <p className={v1.optionBlockName}>{option.name}</p>
          {/* Contents only — absent on options that are the image, the name and
              the price and nothing more. */}
          {option.description && (
            <p className={v1.optionBlockDescription}>{option.description}</p>
          )}
          <p className={v1.optionBlockPrice}>{formatPrice(option.price)}</p>
        </div>
      </div>

      {/* ...and a second rule closes the gift itself, so the fields that
          personalise it start on their own ground. LAL's note image is portrait
          and runs taller than its copy, which without this crowds the first
          label underneath. */}
      <hr className={v1.drawerDivider} />

      <div className={v1.stepArea}>
        {designBlock}
        {photoBlock}
        {nameBlock}

        <div className={v1.noteBlock}>
          <div className={v1.noteLabelRow}>
            <span className={v1.noteLabel}>Your gift note</span>
            <button
              type="button"
              className={v1.noteAssist}
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? 'Generating' : 'Create gift note'}
            </button>
          </div>

          <div className={v1.noteFieldWrap}>
            <textarea
              className={v1.noteTextarea}
              aria-label="Your gift note"
              aria-describedby={noteCounterId}
              placeholder="Write your message or generate one with our AI gift note assistant"
              value={draft.note}
              rows={5}
              onChange={e => patch({ note: e.target.value.slice(0, MAX_NOTE_LENGTH) })}
            />
            <span id={noteCounterId} className={v1.noteCounter} aria-live="polite">
              {announcedCount}/{MAX_NOTE_LENGTH}
            </span>
          </div>
        </div>
      </div>
    </>
  )

  // The note is optional by design and must never gate the primary action; only
  // the fields the option marks required can.
  const addDisabled = !requiredFieldsMet(option, { pname: draft.pname, photo: draft.photo })

  return (
    <PanelPortal>
      <div
        className={`${v1.drawerOverlay} ${open ? v1.drawerOverlayVisible : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={setPanelEl}
        className={`${v1.drawer} ${open ? v1.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={v1.drawerHeader}>
          {/* No back arrow: "Change Item" in the form below is the same action
              under the same condition, and it sits where the mistake is
              noticed. Two controls for one step was one too many. */}
          <span className={v1.drawerTitleGroup}>
            <h2 id={titleId} className={v1.drawerTitle}>Add {option.name}</h2>
          </span>

          <button
            type="button"
            className={v1.drawerClose}
            aria-label="Close gifting options"
            onClick={onClose}
          >
            <XIcon size={24} />
          </button>
        </header>

        {/* Announces the move, not the heading — the visible h3 already carries
            that, and repeating it makes the step read twice. */}
        <p className={styles.srOnly} aria-live="polite">
          {step === 'item'
            ? 'Step 1 of 2: choose an item'
            : canGoBack ? 'Step 2 of 2: personalize your gift' : 'Personalize your gift'}
        </p>

        <div className={v1.drawerBody}>
          {step === 'item' ? itemStep : configStep}
        </div>

        <footer className={v1.drawerFooter}>
          <button type="button" className={v1.drawerCancel} onClick={onClose}>Cancel</button>
          {step === 'item' ? (
            <Button
              variant="primary"
              disabled={!draft.itemId}
              onClick={() => patch({ history: [...draft.history, 'config'] })}
            >
              Next
            </Button>
          ) : (
            <Button variant="primary" disabled={addDisabled} onClick={onAddToBag}>
              Add to bag
            </Button>
          )}
        </footer>
      </div>
    </PanelPortal>
  )
}
