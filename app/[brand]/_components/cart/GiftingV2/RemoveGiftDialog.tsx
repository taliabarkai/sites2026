'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../Button'
import { PanelPortal } from '../../PanelPortal'
/* Copy, so V2 can fix the focus bug below without touching V1. The markup and
   copy are V1's, unchanged — only how the effects are keyed differs. */
import v1Styles from '../GiftingOptions/GiftingOptions.module.css'

interface RemoveGiftDialogProps {
  itemName: string
  /** Dismiss and keep the packaging — scrim, Escape and the Keep button. */
  onKeep:   () => void
  onRemove: () => void
}

/**
 * Guards the one destructive action in the flow. Only shown when the shopper
 * has written a gift note, so the dialog always has something real to protect.
 *
 * Deliberately a copy of the V1 dialog rather than an import. V1 keys its focus
 * effect on `[]`, which runs while PanelPortal is still returning null on its
 * first render — so `dialogRef.current` is null, the effect bails, and neither
 * the initial focus nor the Tab trap ever arms. Keying on the node itself is
 * the fix, and fixing it in place would have changed V1.
 */
export function RemoveGiftDialog({ itemName, onKeep, onRemove }: RemoveGiftDialogProps) {
  const titleId = useId()
  const bodyId  = useId()
  // State, not a ref: the portal mounts the dialog a render late, and the focus
  // effect has to wait for the node rather than run before it exists.
  const [dialogEl, setDialogEl] = useState<HTMLDivElement | null>(null)
  // Returns focus to whatever opened the dialog once it closes.
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null
    return () => restoreRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onKeep() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onKeep])

  // ── Focus trap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!dialogEl) return

    const focusables = () => Array.from(
      dialogEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(el => el.offsetParent !== null)

    // Opens on Keep, so a stray Enter cannot destroy the note.
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

    dialogEl.addEventListener('keydown', onKeyDown)
    return () => dialogEl.removeEventListener('keydown', onKeyDown)
  }, [dialogEl])

  return (
    <PanelPortal>
      <div className={v1Styles.dialogOverlay} aria-hidden="true" onClick={onKeep} />

      <div
        ref={setDialogEl}
        className={v1Styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
      >
        <h2 id={titleId} className={v1Styles.dialogTitle}>Remove gift packaging?</h2>
        <p id={bodyId} className={v1Styles.dialogBody}>
          The gift note you wrote for {itemName} will be deleted.
        </p>

        <div className={v1Styles.dialogActions}>
          <Button variant="secondary" onClick={onKeep}>Keep</Button>
          <Button variant="primary" onClick={onRemove}>Remove</Button>
        </div>
      </div>
    </PanelPortal>
  )
}
