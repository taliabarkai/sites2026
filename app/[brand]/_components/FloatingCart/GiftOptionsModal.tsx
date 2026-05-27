'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { getBrandFromPathname } from '../../_config/brands'
import { Button } from '../Button'
import styles from './GiftOptionsModal.module.css'

const BRAND_ICONS = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib: ibIcons,
} as const

const GIFT_IMAGE = 'https://cdn.oakandluna.com/digital-asset/product/gift-box-25.jpg'

export interface SavedGift {
  image: string
  name: string
  price: string
  note: string
}

interface GiftOptionsModalProps {
  onClose: () => void
  onAddToCart: (gift: SavedGift) => void
  onGenerateGiftNote: () => Promise<string>
}

const MAX_NOTE_LENGTH = 280

export function GiftOptionsModal({ onClose, onAddToCart, onGenerateGiftNote }: GiftOptionsModalProps) {
  const [note, setNote] = useState('')
  const [generating, setGenerating] = useState(false)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const { XIcon, AiMagicIcon } = BRAND_ICONS[brand]

  // Trigger slide-in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

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

  const handleClose = () => {
    setOpen(false)
    setTimeout(onClose, 250)
  }

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
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        aria-hidden="true"
        onClick={handleClose}
      />

      <div
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Gift options"
      >
        <div className={styles.header}>
          <span className={styles.title}>Add Gifting Options</span>
          <button type="button" className={styles.closeBtn} aria-label="Close gift options" onClick={handleClose}>
            <XIcon size={24} />
          </button>
        </div>

        <div className={styles.scrollBody}>
          <div className={styles.productImage}>
            <img
              src={GIFT_IMAGE}
              alt="Gift packaging — gift bag, gift box, fabric pouch and a custom note"
              className={styles.image}
            />
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
                <span className={styles.generateLinkText}>
                  {generating ? 'Generating…' : 'Create Gift Note'}
                </span>
                <AiMagicIcon size={24} />
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
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelLink} onClick={handleClose}>
            Cancel
          </button>
          <Button
            variant="primary"
            onClick={() => onAddToCart({
              image: GIFT_IMAGE,
              name: 'Gift Packaging — Gift Bag, Gift Box, Fabric Pouch and a Custom Note',
              price: '$7',
              note,
            })}
          >
            Add To Bag
          </Button>
        </div>
      </div>
    </>
  )
}
