'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type React from 'react'
import {
  formatPrice,
  MAX_NAME_LENGTH,
  MAX_NOTE_LENGTH,
  type DesignOption,
  type GiftOption,
} from '../GiftingOptions/types'
import v1 from '../GiftingOptions/GiftingOptions.module.css'
import type { GiftItem, PanelDraft } from './GiftPanel'
import styles from './GiftingV2.module.css'

const COUNTER_ANNOUNCE_DELAY = 900

interface GiftDetailsProps {
  option:  GiftOption
  /** Shown as "Gift for" above the packaging. */
  selectedItem?: GiftItem
  /** Brand-scoped printed designs, shared by every option flagged `designs`. */
  designs: DesignOption[]
  draft:   PanelDraft
  onDraftChange: (next: PanelDraft) => void
  onGenerateNote: () => Promise<string>
  /** When given, "Change Item" shows beside the item and calls this. */
  onChangeItem?: () => void
  /**
   * Only the personalization fields — no "Gift for", no packaging block. For
   * V4's Edit, where the wrapped card above already shows both.
   */
  fieldsOnly?: boolean
}

/**
 * The personalization form — "Gift for", the packaging, then design, photo,
 * name and note. The V2/V3 panel's second step, and V4's inline third step:
 * one form, so the two are the same fields in the same order.
 */
export function GiftDetails({
  option, selectedItem, designs, draft, onDraftChange, onGenerateNote, onChangeItem, fieldsOnly,
}: GiftDetailsProps) {
  const fileRef  = useRef<HTMLInputElement>(null)
  const chipsRef = useRef<HTMLDivElement>(null)
  const titleId       = useId()
  const noteCounterId = useId()
  const nameCounterId = useId()
  const nameFieldId   = useId()

  const [generating, setGenerating]         = useState(false)
  const [announcedCount, setAnnouncedCount] = useState(draft.note.length)

  const patch = (next: Partial<PanelDraft>) => onDraftChange({ ...draft, ...next })

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

  /** Arrows move the design selection and the focus together. */
  const onChipKeyDown = (e: React.KeyboardEvent, index: number) => {
    const isNext = e.key === 'ArrowRight' || e.key === 'ArrowDown'
    const isPrev = e.key === 'ArrowLeft'  || e.key === 'ArrowUp'
    if (!isNext && !isPrev) return
    e.preventDefault()
    const next = (index + (isNext ? 1 : -1) + designs.length) % designs.length
    patch({ design: designs[next].key })
    chipsRef.current?.querySelectorAll<HTMLElement>('[data-design-chip]')[next]?.focus()
  }

  const designBlock = option.designs && designs.length > 0 && (
    <div className={v1.fieldBlock}>
      <span className={v1.fieldLabel} id={`${titleId}-designs`}>Choose a design</span>
      {/* Text chips rather than a thumbnail grid: design counts vary by brand
          and a grid stops working past about six. The preview above carries
          the artwork. */}
      <div ref={chipsRef} className={styles.designChips} role="radiogroup" aria-labelledby={`${titleId}-designs`}>
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
              onKeyDown={e => onChipKeyDown(e, index)}
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

  const fields = (
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
  )

  if (fieldsOnly) return fields

  return (
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
            {onChangeItem && (
              <button
                type="button"
                className={styles.giftForChange}
                onClick={onChangeItem}
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

      {fields}
    </>
  )
}
