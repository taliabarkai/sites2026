'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Button } from '../../../_components/Button'
import tokens from '../proposed-tokens.module.css'
import { useBrandIcons } from '../useBrandIcons'
import styles from './nav.module.css'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// ─── Modal ─────────────────────────────────────────────────────────────────

/**
 * Native <dialog> opened with showModal(): the browser makes the rest of the
 * page inert (focus can't leave), closes on Escape, and sets aria-modal.
 * We add: focus to the heading on open, focus back to the trigger on close,
 * aria-labelledby, and a close button named "Close".
 */
export function Modal({
  triggerLabel,
  title,
  children,
  footer,
}: {
  triggerLabel: string
  title: string
  children: ReactNode
  footer?: (close: () => void) => ReactNode
}) {
  const id = useId()
  const { XIcon } = useBrandIcons()
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Button doesn't forward refs; keep one on a wrapper and focus the button in it
  const triggerRef = useRef<HTMLSpanElement>(null)
  const focusTrigger = () => triggerRef.current?.querySelector('button')?.focus()
  const titleRef = useRef<HTMLHeadingElement>(null)

  const open = () => {
    dialogRef.current?.showModal()
    titleRef.current?.focus()
  }
  const close = () => dialogRef.current?.close()

  return (
    <>
      <span ref={triggerRef} className={styles.triggerWrap}>
        <Button variant="secondary" onClick={open}>
          {triggerLabel}
        </Button>
      </span>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${id}-title`}
        className={`${styles.modal} ${tokens.after}`}
        // Escape and close() both land here: return focus to what opened it
        onClose={focusTrigger}
        // A click on the backdrop is a click on the dialog element itself
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <div className={styles.modalBody}>
          <div className={styles.overlayHeader}>
            <h4 id={`${id}-title`} ref={titleRef} tabIndex={-1} className={styles.overlayTitle}>
              {title}
            </h4>
            <button type="button" aria-label="Close" onClick={close} className={styles.closeButton}>
              <XIcon className={styles.icon} />
            </button>
          </div>
          <div className={styles.overlayContent}>{children}</div>
          {footer && <div className={styles.overlayFooter}>{footer(close)}</div>}
        </div>
      </dialog>
    </>
  )
}

// ─── Drawer ────────────────────────────────────────────────────────────────

/**
 * The FloatingCart pattern — always in the DOM, slid in and out with a
 * transform (from the right; from the bottom on mobile) — plus what it needs
 * to be a modal: role="dialog" and aria-modal, focus moved in on open and
 * kept inside with Tab / Shift+Tab, Escape to close, focus returned to the
 * trigger, and the closed panel inert so it can't be tabbed into or read.
 */
export function Drawer({
  triggerLabel,
  title,
  children,
  footer,
}: {
  triggerLabel: string
  title: string
  children: ReactNode
  footer?: (close: () => void) => ReactNode
}) {
  const id = useId()
  const { XIcon } = useBrandIcons()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  // Button doesn't forward refs; keep one on a wrapper and focus the button in it
  const triggerRef = useRef<HTMLSpanElement>(null)
  const focusTrigger = () => triggerRef.current?.querySelector('button')?.focus()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (open) {
      wasOpen.current = true
      titleRef.current?.focus()
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }
    if (wasOpen.current) focusTrigger()
  }, [open])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setOpen(false)
      return
    }
    if (event.key !== 'Tab' || !panelRef.current) return
    // Keep Tab inside the panel: wrap from last to first, and back
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === titleRef.current)) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  return (
    <>
      <span ref={triggerRef} className={styles.triggerWrap}>
        <Button variant="secondary" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
          {triggerLabel}
        </Button>
      </span>
      <div className={`${styles.backdrop} ${open ? styles.backdropOpen : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        inert={!open}
        onKeyDown={onKeyDown}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''} ${tokens.after}`}
      >
        <div className={styles.overlayHeader}>
          <h4 id={`${id}-title`} ref={titleRef} tabIndex={-1} className={styles.overlayTitle}>
            {title}
          </h4>
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className={styles.closeButton}>
            <XIcon className={styles.icon} />
          </button>
        </div>
        <div className={styles.overlayContent}>{children}</div>
        {footer && <div className={styles.overlayFooter}>{footer(() => setOpen(false))}</div>}
      </div>
    </>
  )
}
