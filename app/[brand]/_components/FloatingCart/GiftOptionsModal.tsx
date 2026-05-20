'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import styles from './GiftOptionsModal.module.css'

interface GiftOptionsModalProps {
  onClose: () => void
  onAddToCart: (note: string) => void
  onGenerateGiftNote: () => Promise<string>
}

const MAX_NOTE_LENGTH = 280

export function GiftOptionsModal({ onClose, onAddToCart, onGenerateGiftNote }: GiftOptionsModalProps) {
  const [note, setNote] = useState('')
  const [generating, setGenerating] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  useEffect(() => {
    const el = panelRef.current
    if (!el) return
    const focusables = Array.from(
      el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])')
    )
    focusables[0]?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    el.addEventListener('keydown', handleTab)
    return () => el.removeEventListener('keydown', handleTab)
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const generated = await onGenerateGiftNote()
      setNote(generated.slice(0, MAX_NOTE_LENGTH))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose} aria-modal="true" role="dialog" aria-label="Gift options">
      <div
        className={styles.modal}
        ref={panelRef}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.title}>Add to Bag</span>
          <button type="button" className={styles.closeBtn} aria-label="Close gift options" onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.productImage}>
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        </div>

        <div className={styles.body}>
          <p className={styles.productHeading}>Gift Packaging — Gift Bag, Gift Box, Fabric Pouch and a Custom Note</p>
          <p className={styles.price}>$7</p>

          <div className={styles.noteRow}>
            <span className={styles.noteLabel}>Your gift note:</span>
            <button
              type="button"
              className={styles.generateLink}
              onClick={handleGenerate}
              disabled={generating}
            >
              ✦ {generating ? 'Generating…' : 'Create Gift Note'}
            </button>
          </div>

          <p className={styles.subtext}>
            P.S. Gifts are sent without any price tag. Your receipt will be emailed to you.
          </p>

          <div className={styles.textareaWrapper}>
            <textarea
              className={styles.textarea}
              placeholder="Write your message or generate one with our AI gift note assistant"
              value={note}
              onChange={e => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
              rows={4}
            />
            <span className={styles.counter}>{note.length} / {MAX_NOTE_LENGTH}</span>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelLink} onClick={onClose}>
            Cancel
          </button>
          <Button variant="primary" onClick={() => onAddToCart(note)}>
            Add to Bag
          </Button>
        </div>
      </div>
    </div>
  )
}
