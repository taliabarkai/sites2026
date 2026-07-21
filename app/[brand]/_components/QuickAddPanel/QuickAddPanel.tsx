'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { useCart } from '../../_context/CartContext'
import { getBrandFromPathname } from '../../_config/brands'
import { Button } from '../Button'
import { ProductImageCarousel } from '../ProductImageCarousel'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './QuickAddPanel.module.css'
import type { CartItem } from '../../_context/CartContext'

// Brand-scoped icons — resolved at runtime per the icon rules (never hardcode a brand).
const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

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
  /** Hide the panel's image gallery on mobile (images still show on desktop). */
  hideGalleryOnMobile?: boolean
  /** Hide the panel's image gallery entirely (all breakpoints) — options only. */
  hideGallery?: boolean
}

export interface QuickAddPanelProps {
  isOpen: boolean
  onClose: () => void
  product: QuickAddProduct | null
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>
  /** Primary CTA label. Defaults to "Add to Bag". */
  ctaLabel?: string
  /**
   * When provided, replaces the default "add to cart + open cart" behavior with
   * this callback (used by Nested Items to stage a companion product instead of
   * dropping it straight into the bag). Receives the fully configured cart item.
   */
  onAdd?: (item: CartItem) => void
  /** Show the "View Full Details" link. Hidden for nested items (bound to the main product). */
  showViewDetails?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(cents: number, currency = '$'): string {
  return `${currency}${(cents / 100).toFixed(0)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuickAddPanel({ isOpen, onClose, product, closeButtonRef, ctaLabel = 'Add to Bag', onAdd, showViewDetails = true }: QuickAddPanelProps) {
  const { addItem, openCart } = useCart()
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  // Brand icons the panel needs (star rating + select chevron).
  const { StarIcon, ChevronIcon } = BRAND_ICONS[brand as keyof typeof BRAND_ICONS] ?? BRAND_ICONS.oal

  const internalCloseRef = useRef<HTMLButtonElement>(null)
  const closeRef = closeButtonRef ?? internalCloseRef

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [imageIdx, setImageIdx] = useState(0)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  // Number-of-names selector + one engraving field per name (each independently
  // controlled). `showNameErrors` surfaces per-field "required" errors after a
  // blocked Add attempt.
  const [nameCount, setNameCount] = useState(1)
  const [names, setNames] = useState<string[]>([''])
  const [showNameErrors, setShowNameErrors] = useState(false)

  // Grow/shrink the names list live, preserving the values that remain.
  const handleNameCountChange = (n: number) => {
    setNameCount(n)
    setNames(prev => {
      const next = prev.slice(0, n)
      while (next.length < n) next.push('')
      return next
    })
    setShowNameErrors(false)
  }

  // Portal to the themed root (the [data-theme] wrapper) so the panel escapes any
  // inner stacking context that traps it under the site header, WHILE keeping the
  // brand CSS variables (typography/colors/buttons are scoped to [data-theme]).
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const themed = anchorRef.current?.closest('[data-theme]') as HTMLElement | null
    setPortalTarget(themed ?? document.body)
  }, [])

  // Focus the close button when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 50)
    }
  }, [isOpen, closeRef])

  // Lock background page scroll while the panel is open — only the panel's own
  // scroll areas (image column + content) scroll. Matches FloatingCart.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

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
    setLightboxSrc(null)
    setNameCount(1)
    setNames([''])
    setShowNameErrors(false)
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

  // Gallery layout switches on image count:
  //  • ≤ 4 images → single column with a horizontal image carousel above the options
  //  • > 4 images → the default two-column layout (image column left, options right)
  // Optionally hide the gallery entirely (options-only panel).
  const hideGallery = product?.hideGallery ?? false
  const useCarousel = product ? product.images.length <= 4 : false
  const carouselSrcs = product ? product.images.map((im) => im.src) : []
  // Optionally hide the gallery on mobile (images still render on desktop).
  const hideGalleryOnMobile = product?.hideGalleryOnMobile ?? false
  // Single-column layout whenever there's no left image column (carousel or no gallery).
  const singleColumn = useCarousel || hideGallery

  // Title + price + review — rendered above the gallery for multi-image products,
  // below the inline image for single-image products.
  const headerJsx = product && (
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
              <span key={i} className={i <= Math.round(product.rating ?? 0) ? styles.starFilled : styles.starEmpty} aria-hidden="true">
                <StarIcon size={16} />
              </span>
            ))}
          </div>
          <span className={styles.ratingValue}>{product.rating}</span>
          <span className={styles.reviewCount}>({product.reviewCount?.toLocaleString()} reviews)</span>
        </div>
      )}
    </div>
  )

  const handleAddToBag = () => {
    if (!product) return

    // Validation — every visible name field is required. Block Add and surface
    // per-field errors if any are empty.
    const trimmedNames = names.map(n => n.trim())
    if (trimmedNames.some(n => n === '')) {
      setShowNameErrors(true)
      return
    }

    // The dynamic name fields replace the product's own text-input engraving.
    const selectedOptionsList = product.options
      .filter(opt => opt.type !== 'text-input')
      .map(opt => ({ label: opt.name, value: selectedOptions[opt.name] ?? '' }))
      .filter(o => o.value)

    const nameOptions = trimmedNames.map((n, i) => ({ label: `Name ${i + 1}`, value: n }))

    const cartItem: CartItem = {
      id: `quickadd-${product.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      name: product.title,
      price: totalPrice,
      originalPrice: product.salePrice ? product.price : undefined,
      image: product.images[0]?.src ?? '',
      isPersonalized: true,
      selectedOptions: [...selectedOptionsList, ...nameOptions],
    }
    // Nested Items path: hand the configured item back to the caller to stage,
    // without touching the cart or opening the floating cart.
    if (onAdd) {
      onAdd(cartItem)
      onClose()
      return
    }
    addItem(cartItem)
    onClose()
    openCart(true)
  }

  // Renders a single product option (swatch / pills / text-input / dropdown).
  const renderOption = (opt: QuickAddOption) => (
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
            <span className={styles.selectArrow} aria-hidden="true">
              <ChevronIcon size={20} />
            </span>
          </div>
        </>
      )}
    </div>
  )

  // Number-of-names dropdown + one required engraving field per name. Placed
  // directly below the Metal (swatch) selector, above the remaining options.
  const namesSection = product && (
    <>
      <div className={styles.optionGroup}>
        <label className={styles.optionLabel} htmlFor="qa-name-count">Select number of names</label>
        <div className={styles.selectWrap}>
          <select
            id="qa-name-count"
            className={styles.select}
            value={nameCount}
            onChange={e => handleNameCountChange(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span className={styles.selectArrow} aria-hidden="true">
            <ChevronIcon size={20} />
          </span>
        </div>
      </div>

      {names.map((name, i) => {
        const err = showNameErrors && name.trim() === ''
        return (
          <div key={`name-${i}`} className={styles.optionGroup}>
            <label className={styles.optionLabel} htmlFor={`qa-name-${i}`}>Name {i + 1}</label>
            <div className={styles.inputWrap}>
              <input
                id={`qa-name-${i}`}
                type="text"
                value={name}
                maxLength={12}
                placeholder={`Name ${i + 1}`}
                className={`${styles.textInput} ${err ? styles.textInputError : ''}`}
                aria-invalid={err || undefined}
                aria-describedby={err ? `qa-name-${i}-error` : undefined}
                onChange={e => {
                  const v = e.target.value
                  setNames(prev => prev.map((val, idx) => (idx === i ? v : val)))
                }}
              />
              <span className={styles.charCount}>{name.length}/12</span>
            </div>
            {err && (
              <p id={`qa-name-${i}-error`} className={styles.errorMsg}>
                Please enter Name {i + 1}.
              </p>
            )}
          </div>
        )
      })}
    </>
  )

  const tree = (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''} ${singleColumn ? styles.panelSingle : ''} ${(hideGalleryOnMobile || hideGallery) ? styles.panelHugMobile : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Add to Bag"
      >
        {/* Close button — plain X, absolute top-right of the panel */}
        <button
          ref={closeRef}
          type="button"
          className={styles.closeBtn}
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Body — desktop left image column + right content column */}
        <div className={styles.panelBody}>
          {/* Desktop: left column — all images stacked, vertically scrollable.
              Only for products with > 4 images (the ≤4 variant uses the carousel). */}
          {product && !useCarousel && !hideGallery && (
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

          {/* Right column: scrollable content + sticky footer */}
          {product && <div className={styles.rightCol}><div className={styles.scrollArea}>
            {/* Title + price + review — always first */}
            {headerJsx}

            {/* ≤ 4 images — horizontal image carousel above the options (shared
                PDP carousel), shown at every breakpoint. */}
            {useCarousel && !hideGallery && (
              <ProductImageCarousel
                images={carouselSrcs}
                peek
                showProgress={false}
                className={`${styles.panelCarousel} ${hideGalleryOnMobile ? styles.hideOnMobile : ''}`}
              />
            )}

            {/* > 4 images — mobile thumbnail gallery (desktop uses the left column) */}
            {!useCarousel && !hideGallery && (
              <div className={`${styles.gallery} ${hideGalleryOnMobile ? styles.hideOnMobile : ''}`}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.galleryThumb} ${i === imageIdx ? styles.galleryThumbActive : ''}`}
                    onClick={() => { setImageIdx(i); setLightboxSrc(img.src) }}
                    aria-label={`View larger image of ${img.alt}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt={img.alt} className={styles.galleryImg} loading="lazy" />
                  </button>
                ))}
              </div>
            )}

          {/* Options — swatch(es) → number-of-names + name fields → the rest.
              (The product's own text-input engraving is replaced by the name fields.) */}
          <div className={styles.options}>
            {product.options.filter(o => o.type === 'swatch').map(renderOption)}
            {namesSection}
            {product.options
              .filter(o => o.type !== 'swatch' && o.type !== 'text-input')
              .map(renderOption)}
          </div>

          {/* Footer — flows inline below the last selection (not pinned to the bottom) */}
          <div className={styles.footer}>
            <Button
              variant="add-to-cart"
              className={styles.addToBagBtn}
              onClick={handleAddToBag}
            >
              {ctaLabel}
            </Button>
            {showViewDetails && (
              <a href={pdpHref} className={styles.viewDetails} onClick={onClose}>
                View Full Details
              </a>
            )}
          </div>
        </div></div>}
        </div>
      </div>

      {/* Mobile image lightbox */}
      {lightboxSrc && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightboxSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt=""
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Close image"
            onClick={() => setLightboxSrc(null)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Anchor stays in place so we can resolve the themed [data-theme] root */}
      <span ref={anchorRef} aria-hidden="true" style={{ display: 'none' }} />
      {portalTarget && createPortal(tree, portalTarget)}
    </>
  )
}
