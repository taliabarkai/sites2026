'use client'

import { useId, useRef, useState } from 'react'
import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'
import { formatPrice } from '../GiftingOptions/types'
import type { GiftItem } from './GiftPanel'
import styles from './GiftingV2.module.css'

interface ItemPickerProps {
  items:          GiftItem[]
  selectedItemId: string | null
  /** Names the pieces this packaging cannot go on, when there are any. */
  exclusionNote?: string
  icons: {
    CheckmarkIcon: React.ComponentType<IconProps>
    WarningIcon:   React.ComponentType<IconProps>
  }
  /**
   * `radio` — the panel's step: a tap chooses, and Next moves on.
   * `action` — V3's inline step: a tap is the move itself (it opens the panel),
   * so the cards are plain buttons rather than a radiogroup that would promise
   * a choice still to be confirmed.
   */
  mode:     'radio' | 'action'
  onSelect: (itemId: string) => void
  /** Extra class for the card grid, e.g. the page's narrower measure. */
  gridClassName?: string
}

/**
 * "Which item is this gift for?" — the question, the exclusion tooltip beside
 * it, and the item cards. Shared by the V2 panel's first step and V3's inline
 * step so the two are the same picture, card for card.
 */
export function ItemPicker({
  items, selectedItemId, exclusionNote, icons, mode, onSelect, gridClassName,
}: ItemPickerProps) {
  const { CheckmarkIcon, WarningIcon } = icons
  const tipId   = useId()
  const groupRef = useRef<HTMLDivElement>(null)
  const [tipOpen, setTipOpen] = useState(false)
  const isRadio = mode === 'radio'

  /** Radio mode only: arrows move the selection and the focus together. */
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const isNext = e.key === 'ArrowRight' || e.key === 'ArrowDown'
    const isPrev = e.key === 'ArrowLeft'  || e.key === 'ArrowUp'
    if (!isNext && !isPrev) return
    e.preventDefault()
    const next = (index + (isNext ? 1 : -1) + items.length) % items.length
    onSelect(items[next].id)
    groupRef.current?.querySelectorAll<HTMLElement>('[data-item-choice]')[next]?.focus()
  }

  return (
    <>
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
                <WarningIcon size={24} />
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

      <div
        ref={groupRef}
        className={`${styles.itemChoiceGroup} ${gridClassName ?? ''}`}
        role={isRadio ? 'radiogroup' : 'group'}
        aria-label="Which item is this gift for?"
      >
        {items.map((item, index) => {
          const checked = item.id === selectedItemId
          return (
            <button
              key={item.id}
              data-item-choice
              type="button"
              role={isRadio ? 'radio' : undefined}
              aria-checked={isRadio ? checked : undefined}
              aria-haspopup={isRadio ? undefined : 'dialog'}
              /* Nothing is chosen on open, so the first card carries the tab
                 stop until one is — otherwise the group would be unreachable.
                 Action cards are ordinary buttons, each its own tab stop. */
              tabIndex={isRadio
                ? (checked || (selectedItemId === null && index === 0) ? 0 : -1)
                : undefined}
              className={`${styles.itemChoice} ${checked ? styles.itemChoiceSelected : ''}`}
              onClick={() => onSelect(item.id)}
              onKeyDown={isRadio ? e => onKeyDown(e, index) : undefined}
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
    </>
  )
}
