'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { getBrandFromPathname, getBrandGiftAssets } from '../../_config/brands'
import type { GiftPackaging } from '../../_context/CartContext'
import { Button } from '../Button'
import styles from './GiftPackagingPanel.module.css'

const BRAND_ICONS = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib: ibIcons,
} as const

const CLASSIC_PRICE = 500
const CLASSIC_ORIGINAL_PRICE = 1000
const PERSONALIZED_PRICE = 1200
const PERSONALIZED_ORIGINAL_PRICE = 2000
const MAX_NOTE_LENGTH = 280
const MAX_NAME_LENGTH = 16

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export interface GiftPackagingPanelProps {
  onClose: () => void
  onAddToCart: (gift: GiftPackaging) => void
  initialGift?: GiftPackaging
  productName?: string
}

type Step = 'picker' | 'classic' | 'personalized'

export function GiftPackagingPanel({ onClose, onAddToCart, initialGift, productName }: GiftPackagingPanelProps) {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const { XIcon, ChevronIcon } = BRAND_ICONS[brand]
  const assets = getBrandGiftAssets(brand)

  const initialStep: Step = initialGift?.type === 'classic' ? 'classic'
    : initialGift?.type === 'personalized' ? 'personalized'
    : 'picker'

  const [step, setStep] = useState<Step>(initialStep)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Classic state
  const [classicNote, setClassicNote] = useState(initialGift?.type === 'classic' ? (initialGift.giftNote ?? '') : '')

  // Personalized state
  const [selectedDesign, setSelectedDesign] = useState(
    initialGift?.type === 'personalized' ? (initialGift.selectedDesign ?? 'birthday') : 'birthday'
  )
  const [recipientName, setRecipientName] = useState(
    initialGift?.type === 'personalized' ? (initialGift.recipientName ?? '') : ''
  )
  const [personalizedNote, setPersonalizedNote] = useState(
    initialGift?.type === 'personalized' ? (initialGift.giftNote ?? '') : ''
  )

  // Slide-in on mount
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
  }, [step])

  const handleClose = () => {
    setOpen(false)
    setTimeout(onClose, 250)
  }

  const handleAddClassic = () => {
    onAddToCart({
      type: 'classic',
      giftNote: classicNote,
      price: CLASSIC_PRICE,
      originalPrice: CLASSIC_ORIGINAL_PRICE,
    })
  }

  const handleAddPersonalized = () => {
    onAddToCart({
      type: 'personalized',
      selectedDesign,
      recipientName,
      giftNote: personalizedNote,
      price: PERSONALIZED_PRICE,
      originalPrice: PERSONALIZED_ORIGINAL_PRICE,
    })
  }

  const canAddPersonalized = recipientName.trim().length > 0

  const title = step === 'picker' ? 'Add Gift Packaging'
    : step === 'classic' ? 'Classic Gift Set'
    : 'Personalized Gift Box'

  const content = (
    <div data-theme={brand}>
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
        aria-label={title}
      >
        <div className={styles.panelHeader}>
          {step !== 'picker' && (
            <button
              type="button"
              className={styles.backBtn}
              aria-label="Back to gift options"
              onClick={() => setStep('picker')}
            >
              <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}>
                <ChevronIcon size={24} />
              </span>
            </button>
          )}
          <span className={styles.panelTitle}>{title}</span>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close gift options"
            onClick={handleClose}
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* ── Step: Picker ── */}
        {step === 'picker' && (
          <>
            <div className={styles.scrollBody}>
              <div className={styles.pickerGrid}>
                {productName && (
                  <p className={styles.pickerSubtitle}>
                    Choose gift packaging option for {productName}:
                  </p>
                )}
                {/* Classic option */}
                <button type="button" className={styles.optionCard} onClick={() => setStep('classic')}>
                  {assets?.classicGiftImage && (
                    <div className={styles.optionCardImageWrap}>
                      <img
                        src={assets.classicGiftImage}
                        alt="Classic Gift Set"
                        className={styles.optionCardImage}
                      />
                    </div>
                  )}
                  <div className={styles.optionCardBody}>
                    <p className={styles.optionCardName}>Classic Gift Set</p>
                    <div className={styles.optionCardPriceRow}>
                      <span className={styles.optionCardOriginalPrice}>{formatPrice(CLASSIC_ORIGINAL_PRICE)}</span>
                      <span className={styles.optionCardPrice}>{formatPrice(CLASSIC_PRICE)}</span>
                    </div>
                    <span className={styles.optionCardSelectBtn}>Select</span>
                  </div>
                </button>

                {/* Personalized option */}
                <button type="button" className={styles.optionCard} onClick={() => setStep('personalized')}>
                  {assets?.personalizedGiftImage && (
                    <div className={styles.optionCardImageWrap}>
                      <img
                        src={assets.personalizedGiftImage}
                        alt="Personalized Gift Box"
                        className={styles.optionCardImage}
                      />
                    </div>
                  )}
                  <div className={styles.optionCardBody}>
                    <p className={styles.optionCardName}>Personalized Gift Box</p>
                    <div className={styles.optionCardPriceRow}>
                      <span className={styles.optionCardOriginalPrice}>{formatPrice(PERSONALIZED_ORIGINAL_PRICE)}</span>
                      <span className={styles.optionCardPrice}>{formatPrice(PERSONALIZED_PRICE)}</span>
                    </div>
                    <span className={styles.optionCardSelectBtn}>Select</span>
                  </div>
                </button>
              </div>
            </div>
            <div className={styles.panelFooter}>
              <button type="button" className={styles.cancelLink} onClick={handleClose}>
                Cancel
              </button>
            </div>
          </>
        )}

        {/* ── Step: Classic ── */}
        {step === 'classic' && (
          <>
            <div className={styles.scrollBody}>
              {assets?.classicGiftImage && (
                <div className={styles.productImageWrap}>
                  <div className={styles.productImageInner}>
                    <img
                      src={assets.classicGiftImage}
                      alt="Classic Gift Set"
                      className={styles.productImage}
                    />
                  </div>
                </div>
              )}
              <div className={styles.dotsRow} aria-hidden="true">
                <span className={`${styles.dot} ${styles.dotActive}`} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
              <div className={styles.detailBody}>
                <p className={styles.productName}>Classic Gift Set</p>
                <div className={styles.priceRow}>
                  <span className={styles.originalPrice}>{formatPrice(CLASSIC_ORIGINAL_PRICE)}</span>
                  <span className={styles.sellingPrice}>{formatPrice(CLASSIC_PRICE)}</span>
                </div>
                <p className={styles.kitContents}>This kit contains: One gift box, one personal note and a gift bag</p>
                <div className={styles.noteSection}>
                  <div className={styles.noteRow}>
                    <span className={styles.noteLabel}>Your gift note:</span>
                    <button type="button" className={styles.generateLink} tabIndex={-1}>
                      Create Gift Note
                    </button>
                  </div>
                  <div className={styles.textareaWrapper}>
                    <textarea
                      className={styles.textarea}
                      placeholder="Write your message here"
                      value={classicNote}
                      onChange={e => setClassicNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
                      rows={4}
                      aria-label="Gift note"
                    />
                    <span className={styles.counter}>{classicNote.length} / {MAX_NOTE_LENGTH}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.panelFooter}>
              <button type="button" className={styles.cancelLink} onClick={handleClose}>
                Cancel
              </button>
              <Button variant="primary" className={styles.addToBagBtn} onClick={handleAddClassic}>
                Add To Bag
              </Button>
            </div>
          </>
        )}

        {/* ── Step: Personalized ── */}
        {step === 'personalized' && (
          <>
            <div className={styles.scrollBody}>
              {assets?.personalizedGiftImage && (
                <div className={styles.productImageWrap}>
                  <div className={styles.productImageInner}>
                    <img
                      src={assets.personalizedGiftImage}
                      alt="Personalized Gift Box"
                      className={styles.productImage}
                    />
                  </div>
                </div>
              )}
              <div className={styles.dotsRow} aria-hidden="true">
                <span className={styles.dot} />
                <span className={`${styles.dot} ${styles.dotActive}`} />
                <span className={styles.dot} />
              </div>
              <div className={styles.detailBody}>
                <p className={styles.productName}>Personalized Gift Box</p>
                <div className={styles.priceRow}>
                  <span className={styles.originalPrice}>{formatPrice(PERSONALIZED_ORIGINAL_PRICE)}</span>
                  <span className={styles.sellingPrice}>{formatPrice(PERSONALIZED_PRICE)}</span>
                </div>
                <p className={styles.kitContents}>This kit contains: Gift Bag, Gift Box &amp; a Custom Note</p>

                {/* Design picker */}
                {assets?.designOptions && assets.designOptions.length > 0 && (
                  <div className={styles.designGrid} role="group" aria-label="Choose a design">
                    {assets.designOptions.map(option => (
                      <button
                        key={option.key}
                        type="button"
                        className={`${styles.designTile} ${selectedDesign === option.key ? styles.designTileSelected : ''}`}
                        onClick={() => setSelectedDesign(option.key)}
                        aria-pressed={selectedDesign === option.key}
                      >
                        {option.image ? (
                          <div className={styles.designTileImageWrap}>
                            <img
                              src={option.image}
                              alt={option.label}
                              className={styles.designTileImage}
                            />
                          </div>
                        ) : (
                          <div className={styles.designTilePlaceholder} aria-hidden="true" />
                        )}
                        <span className={styles.designTileLabel}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Recipient name */}
                <div>
                  <label className={styles.fieldLabel} htmlFor="recipient-name">
                    Recipient name
                  </label>
                  <div className={styles.fieldWrap} style={{ marginTop: 'var(--spacing-xxxs)' }}>
                    <input
                      id="recipient-name"
                      type="text"
                      className={styles.input}
                      placeholder="Enter name"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                      autoComplete="off"
                    />
                    <span className={styles.inputCounter}>{recipientName.length} / {MAX_NAME_LENGTH}</span>
                  </div>
                </div>

                {/* Gift note */}
                <div className={styles.noteSection}>
                  <div className={styles.noteRow}>
                    <span className={styles.noteLabel}>Your gift note:</span>
                    <button type="button" className={styles.generateLink} tabIndex={-1}>
                      Create Gift Note
                    </button>
                  </div>
                  <div className={styles.textareaWrapper}>
                    <textarea
                      className={styles.textarea}
                      placeholder="Write your message here"
                      value={personalizedNote}
                      onChange={e => setPersonalizedNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
                      rows={4}
                      aria-label="Gift note"
                    />
                    <span className={styles.counter}>{personalizedNote.length} / {MAX_NOTE_LENGTH}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.panelFooter}>
              <button type="button" className={styles.cancelLink} onClick={handleClose}>
                Cancel
              </button>
              <Button
                variant="primary"
                className={styles.addToBagBtn}
                onClick={handleAddPersonalized}
                disabled={!canAddPersonalized}
              >
                Add To Bag
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
