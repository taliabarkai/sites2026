'use client'

import { useEffect, useId, useState } from 'react'
import type React from 'react'
import { Button } from '../../Button'
import { PanelPortal } from '../../PanelPortal'
import type { IconProps } from '@/src/components/icons/Icon'
import {
  requiredFieldsMet,
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
import { GiftDetails } from './GiftDetails'
import { ItemPicker } from './ItemPicker'

/**
 * V2 needs a back affordance that V1 has no step to go back from, so it asks
 * for one more icon than V1's set. Extending rather than widening
 * `GiftingIcons` leaves V1's contract exactly as it was.
 */
export interface GiftingV2Icons extends GiftingIcons {
  /** Rotated to read as an "i" — the panel's only informational affordance. */
  WarningIcon: React.ComponentType<IconProps>
  /** V3 only — the inline step's Back. Points right; rotated where used. */
  ArrowIcon?:  React.ComponentType<IconProps>
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
  /**
   * V3 asks which item on the page, before the panel opens, so the panel's own
   * item step never shows. When given, "Change Item" appears and hands the
   * question back to the page instead of stepping back inside the panel.
   */
  onChangeItem?: () => void
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
  draft, onDraftChange, onAddToBag, onClose, onGenerateNote, onChangeItem,
}: GiftPanelProps) {
  const { XIcon, CheckmarkIcon, WarningIcon } = icons

  // State, not a ref: PanelPortal returns null on its first render, so a
  // `[]`-keyed effect would run before the node exists and bail. Keying on the
  // node itself is what makes the trap and the per-step focus actually arm.
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null)
  const titleId       = useId()

  const [open, setOpen]                     = useState(false)

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

  // ── Step: which item ────────────────────────────────────────────────────────
  const itemStep = (
    <div className={v1.stepArea}>
      <ItemPicker
        items={eligibleItems}
        selectedItemId={draft.itemId}
        exclusionNote={exclusionNote}
        icons={{ CheckmarkIcon, WarningIcon }}
        mode="radio"
        onSelect={itemId => patch({ itemId })}
      />
    </div>
  )

  // ── Step: configuration ─────────────────────────────────────────────────────
  const configStep = (
    <GiftDetails
      option={option}
      selectedItem={selectedItem}
      designs={designs}
      draft={draft}
      onDraftChange={onDraftChange}
      onGenerateNote={onGenerateNote}
      /* Only when a picker was actually shown — in the panel (a step back) or,
         in V3, on the page. Going back keeps the draft, so anything already
         typed survives the change. */
      onChangeItem={onChangeItem ?? (canGoBack
        ? () => patch({ history: draft.history.slice(0, -1) })
        : undefined)}
    />
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
