'use client'

import { useEffect, useId, useRef } from 'react'
import { Button } from '../../Button'
import { PanelPortal } from '../../PanelPortal'
import styles from './GiftingOptions.module.css'

interface RemoveGiftDialogProps {
  itemName: string
  /** Dismiss and keep the packaging — scrim, Escape and the Keep button. */
  onKeep:   () => void
  onRemove: () => void
}

/**
 * Guards the one destructive action in the flow. Only shown when the shopper
 * has written a gift note, so the dialog always has something real to protect.
 */
export function RemoveGiftDialog({ itemName, onKeep, onRemove }: RemoveGiftDialogProps) {
  const titleId  = useId()
  const bodyId   = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
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
    const dialog = dialogRef.current
    if (!dialog) return

    const focusables = () => Array.from(
      dialog.querySelectorAll<HTMLElement>(
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

    dialog.addEventListener('keydown', onKeyDown)
    return () => dialog.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <PanelPortal>
      <div className={styles.dialogOverlay} aria-hidden="true" onClick={onKeep} />

      <div
        ref={dialogRef}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
      >
        <h2 id={titleId} className={styles.dialogTitle}>Remove gift packaging?</h2>
        <p id={bodyId} className={styles.dialogBody}>
          The gift note you wrote for {itemName} will be deleted.
        </p>

        <div className={styles.dialogActions}>
          <Button variant="secondary" onClick={onKeep}>Keep</Button>
          <Button variant="primary" onClick={onRemove}>Remove</Button>
        </div>
      </div>
    </PanelPortal>
  )
}
