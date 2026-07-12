'use client'

import { useEffect, useRef } from 'react'
import styles from './CustomizerPanel.module.css'

interface CustomizerPanelProps {
  open: boolean
  onClose: () => void
  /** Rendered in the fixed preview area at the top of the sheet. */
  preview?: React.ReactNode
  /** Sticky primary CTA(s) pinned to the bottom of the sheet. */
  footer?: React.ReactNode
  /** Close-button glyph — pass the brand's XIcon so the shell stays brand-scoped. */
  closeIcon?: React.ReactNode
  ariaLabel?: string
  /** When this value changes, the scrollable body resets to the top (e.g. step change). */
  scrollResetKey?: string | number
  /** When true, the sheet hugs its content instead of filling the viewport. */
  fitContent?: boolean
  /** When true, the close button is a plain white X (no circular background) for dark content. */
  closeOnDark?: boolean
  /** When false, clicking the backdrop / pressing Escape won't close the sheet (default true). */
  dismissible?: boolean
  children: React.ReactNode
}

/**
 * Shared mobile customizer shell: a full-height bottom-sheet that slides up over
 * the PDP. Preview area on top, X close top-right, scrollable body, sticky CTA
 * footer. Body scroll is locked while open and state is preserved by the caller
 * (this component never unmounts its children — visibility is CSS-driven).
 *
 * Desktop hides the panel entirely (see .root display:none); callers keep their
 * side-by-side layout and simply never set `open` on desktop.
 */
export function CustomizerPanel({
  open, onClose, preview, footer, closeIcon, ariaLabel = 'Customize', scrollResetKey, fitContent, closeOnDark, dismissible = true, children,
}: CustomizerPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  // Lock background scroll while the sheet is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Reset the inner scroll to the top when the step/phase changes
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [scrollResetKey])

  // Escape to close (only when dismissible)
  useEffect(() => {
    if (!open || !dismissible) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, dismissible, onClose])

  return (
    <div className={`${styles.root} ${open ? styles.rootOpen : ''}`} aria-hidden={!open}>
      <div className={styles.backdrop} onClick={dismissible ? onClose : undefined} />
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''} ${fitContent ? styles.panelFit : ''}`} role="dialog" aria-modal="true" aria-label={ariaLabel}>
        <button type="button" className={`${styles.close} ${closeOnDark ? styles.closeOnDark : ''}`} aria-label="Close" onClick={onClose}>
          {closeIcon ?? (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {preview !== undefined && <div className={styles.previewArea}>{preview}</div>}

        <div className={styles.body} ref={bodyRef}>{children}</div>

        {footer !== undefined && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  )
}
