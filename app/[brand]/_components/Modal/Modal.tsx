'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { PanelPortal } from '../PanelPortal'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  /** Id of the element naming the dialog, for aria-labelledby. */
  labelledBy: string
  children: ReactNode
  /** Close button's accessible name. */
  closeLabel?: string
  className?: string
  /** Rendered inside the panel, before the children — the close button sits over it. */
  closeIcon: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A dialog with a scrim, built from the pattern GiftOptionsModal already uses:
 * Escape to close, the page behind locked, focus trapped inside and handed back
 * to whatever opened it.
 *
 * Portalled to the theme wrapper rather than the body — the tokens are scoped
 * there, and a modal mounted outside it loses every colour and radius.
 */
export function Modal({
  open, onClose, labelledBy, children, closeLabel = 'Close', className, closeIcon,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  /* Whatever had focus when the modal opened, so it can be given back. */
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    openerRef.current = document.activeElement as HTMLElement | null
    return () => {
      /* Returning focus is what makes the modal usable by keyboard: without it
         the caret restarts at the top of the document. */
      openerRef.current?.focus?.()
    }
  }, [open])

  /* The page behind must not scroll under the scrim. */
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter(el => el.offsetParent !== null)
      if (focusables.length === 0) return

      const first = focusables[0]
      const last  = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (!open) return null

  return (
    <PanelPortal>
      {/* The scrim closes on click; the panel stops the click reaching it. */}
      <div className={styles.overlay} onMouseDown={onClose}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          className={[styles.panel, className].filter(Boolean).join(' ')}
          onMouseDown={event => event.stopPropagation()}
        >
          <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
            {closeIcon}
          </button>
          {children}
        </div>
      </div>
    </PanelPortal>
  )
}
