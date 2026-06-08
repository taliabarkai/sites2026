'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '../../_context/CartContext'
import { getBrandFromPathname } from '../../_config/brands'
import { Button } from '../Button'
import styles from './QuickAddPanel.module.css'
import type { CartItem } from '../../_context/CartContext'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuickAddOption {
  name: string
  type: 'swatch' | 'dropdown' | 'pills' | 'text-input'
  values?: { label: string; value: string; price?: number; color?: string }[]
  maxLength?: number
  placeholder?: string
}

export interface QuickAddProduct {
  title: string
  price: number           // base price in cents
  salePrice?: number      // original/crossed-out price in cents
  currency?: string
  rating?: number
  reviewCount?: number
  images: { src: string; alt: string }[]
  pdpUrl: string          // relative path, e.g. /product/24
  options: QuickAddOption[]
}

export interface QuickAddPanelProps {
  isOpen: boolean
  onClose: () => void
  product: QuickAddProduct | null
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(cents: number, currency = '$'): string {
  return `${currency}${(cents / 100).toFixed(0)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickAddPanel({ isOpen, onClose, product, closeButtonRef }: QuickAddPanelProps) {
  const { addItem, openCart } = useCart()
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)

  const internalCloseRef = useRef<HTMLButtonElement>(null)
  const closeRef = closeButtonRef ?? internalCloseRef

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [imageIdx, setImageIdx] = useState(0)

  // Focus the close button when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 50)
    }
  }, [isOpen, closeRef])

  // Reset state when product changes — pre-select first value of each option
  useEffect(() => {
    if (product) {
      const defaults: Record<string, string> = {}
      product.options.forEach(opt => {
        if (opt.values && opt.values.length > 0) {
          defaults[opt.name] = opt.values[0].value
        }
      })
      setSelectedOptions(defaults)
    } else {
      setSelectedOptions({})
    }
    setImageIdx(0)
  }, [product?.title])

  // Escape key closes panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Always render panel in the DOM so CSS transform transitions work.
  // (Unmounting on close = no initial transform to transition from, breaking animation.)
  // Match FloatingCart pattern: panel is always mounted, visibility driven by CSS class.

  const select = (name: string, value: string) =>
    setSelectedOptions(prev => ({ ...prev, [name]: value }))

  // Safe derived values — null-guarded so the panel can live in DOM with no product
  const totalPrice = product
    ? product.options.reduce((acc, opt) => {
        const val = opt.values?.find(v => v.value === selectedOptions[opt.name])
        return acc + (val?.price ?? 0)
      }, product.price)
    : 0

  const pdpHref = product ? `/${brand}${product.pdpUrl}` : '#'

  const handleAddToBag = () => {
    if (!product) return
    const selectedOptionsList = product.options
      .map(opt => ({ label: opt.name, value: selectedOptions[opt.name] ?? '' }))
      .filter(o => o.value)

    const cartItem: CartItem = {
      id: `quickadd-${product.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      name: product.title,
      price: totalPrice,
      originalPrice: product.salePrice ? product.price : undefined,
      image: product.images[0]?.src ?? '',
      isPersonalized: product.options.some(
        o => o.type === 'text-input' && selectedOptions[o.name]?.trim()
      ),
      selectedOptions: selectedOptionsList,
    }
    addItem(cartItem)
    onClose()
    openCart()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Quick add"
      >
        {/* Desktop: left column — all images stacked, vertically scrollable */}
        {product && product.images.length > 0 && (
          <div className={styles.desktopImage} aria-hidden="true">
            {product.images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.src}
                alt={img.alt}
                className={styles.desktopImageEl}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
        )}

        {/* Close button — absolute, top-right */}
        <button
          ref={closeRef}
          type="button"
          className={styles.closeBtn}
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Right column: scrollable content + sticky footer */}
        {product && <div className={styles.rightCol}><div className={styles.scrollArea}>
          {/* Mobile drag handle */}
          <div className={styles.dragHandle} aria-hidden="true" />

          {/* Title + price */}
          <div className={styles.header}>
            <h2 className={styles.title}>{product.title}</h2>
            <div className={styles.priceRow}>
              {product.salePrice && (
                <span className={styles.priceOriginal}>{fmt(product.salePrice, product.currency)}</span>
              )}
              <span className={styles.price}>{fmt(totalPrice, product.currency)}</span>
            </div>
            {product.rating != null && (
              <div className={styles.rating}>
                <div className={styles.stars} aria-label={`${product.rating} out of 5 stars`}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={i <= Math.round(product.rating ?? 0) ? styles.starFilled : styles.starEmpty} aria-hidden="true">★</span>
                  ))}
                </div>
                <span className={styles.ratingValue}>{product.rating}</span>
                <span className={styles.reviewCount}>({product.reviewCount?.toLocaleString()} reviews)</span>
              </div>
            )}
          </div>

          {/* Mini image gallery */}
          {product.images.length > 0 && (
            <div className={styles.gallery}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.galleryThumb} ${i === imageIdx ? styles.galleryThumbActive : ''}`}
                  onClick={() => setImageIdx(i)}
                  aria-label={img.alt}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} className={styles.galleryImg} loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* Options */}
          <div className={styles.options}>
            {product.options.map(opt => (
              <div key={opt.name} className={styles.optionGroup}>
                {opt.type === 'swatch' && (
                  <>
                    <p className={styles.optionLabel}>
                      {opt.name}
                      {selectedOptions[opt.name] && (
                        <span className={styles.optionValue}>
                          {' '}— {opt.values?.find(v => v.value === selectedOptions[opt.name])?.label}
                        </span>
                      )}
                    </p>
                    <div className={styles.swatches}>
                      {opt.values?.map(v => (
                        <button
                          key={v.value}
                          type="button"
                          aria-label={v.label}
                          aria-pressed={selectedOptions[opt.name] === v.value}
                          className={`${styles.swatch} ${selectedOptions[opt.name] === v.value ? styles.swatchSelected : ''}`}
                          style={{ background: v.color ?? 'var(--colors-surface-secondary)' }}
                          onClick={() => select(opt.name, v.value)}
                        />
                      ))}
                    </div>
                  </>
                )}

                {opt.type === 'pills' && (
                  <>
                    <p className={styles.optionLabel}>Select {opt.name}</p>
                    <div className={styles.pills}>
                      {opt.values?.map(v => (
                        <button
                          key={v.value}
                          type="button"
                          aria-pressed={selectedOptions[opt.name] === v.value}
                          className={`${styles.pill} ${selectedOptions[opt.name] === v.value ? styles.pillSelected : ''}`}
                          onClick={() => select(opt.name, v.value)}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {opt.type === 'text-input' && (
                  <>
                    <label className={styles.optionLabel} htmlFor={`qa-${opt.name}`}>
                      {opt.name}
                    </label>
                    <div className={styles.inputWrap}>
                      <input
                        id={`qa-${opt.name}`}
                        type="text"
                        value={selectedOptions[opt.name] ?? ''}
                        maxLength={opt.maxLength}
                        placeholder={opt.placeholder ?? ''}
                        className={styles.textInput}
                        onChange={e => select(opt.name, e.target.value)}
                      />
                      {opt.maxLength && (
                        <span className={styles.charCount}>
                          {(selectedOptions[opt.name] ?? '').length}/{opt.maxLength}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {opt.type === 'dropdown' && (
                  <>
                    <label className={styles.optionLabel} htmlFor={`qa-${opt.name}`}>
                      {opt.name}
                    </label>
                    <div className={styles.selectWrap}>
                      <select
                        id={`qa-${opt.name}`}
                        value={selectedOptions[opt.name] ?? ''}
                        className={styles.select}
                        onChange={e => select(opt.name, e.target.value)}
                      >
                        <option value="">Select…</option>
                        {opt.values?.map(v => (
                          <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sticky footer — ADD TO BAG + VIEW FULL DETAILS, no subtotal row */}
        <div className={styles.footer}>
          <Button
            variant="add-to-cart"
            className={styles.addToBagBtn}
            onClick={handleAddToBag}
          >
            Add to Bag
          </Button>
          <a href={pdpHref} className={styles.viewDetails} onClick={onClose}>
            View Full Details
          </a>
        </div></div>}
      </div>
    </>
  )
}
