'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '../../_context/CartContext'
import { getBrandFromPathname } from '../../_config/brands'
import { titleForMetal } from '../../_config/products'
import { Button } from '../Button'
import { PanelPortal } from '../PanelPortal'
import { ProductImageCarousel } from '../ProductImageCarousel'
import { closeAllPanels } from '../PanelStack'
import { OptionRadioGroup } from '../ProductOptions/OptionRadioGroup'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './QuickAddPanel.module.css'
import type { CartItem } from '../../_context/CartContext'
import type { QuickAddFormValues, QuickAddOption, QuickAddProduct } from './QuickAddPanel'

// Brand-scoped icons — resolved at runtime per the icon rules (never hardcode a brand).
const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

export interface QuickAddPanelContentProps {
  product: QuickAddProduct
  /** Primary CTA label. */
  ctaLabel: string
  /** Show the "View Full Details" link. */
  showViewDetails: boolean
  /**
   * When provided, replaces the default "add to cart + open cart" behavior with
   * this callback (used by Nested Items to stage a companion product instead of
   * dropping it straight into the bag). Receives the fully configured cart item,
   * and the choices that built it so the form can be reopened as it was.
   */
  onAdd?: (item: CartItem, values: QuickAddFormValues) => void
  /** Choices to open with instead of the defaults — reopening an item already added. */
  initialValues?: QuickAddFormValues
  /** Called with the form's choices whenever they change — a host mirroring them. */
  onChange?: (values: QuickAddFormValues) => void
  /** Leaves the form once the item is added: the panel closes, a host view goes back. */
  onDone: () => void
  /**
   * Rendered inside another panel rather than as the Quick Add panel itself —
   * narrower, so always one column, with every gallery as a carousel.
   */
  embedded?: boolean
  /** Drawn above the title — a host view's back button. */
  headerStart?: ReactNode
  /** Drawn after the last selection, above the CTA — e.g. a nested items offer. */
  afterOptions?: ReactNode
}

function fmt(cents: number, currency = '$'): string {
  return `${currency}${(cents / 100).toFixed(0)}`
}

// Gallery layout switches on image count:
//  • 1 image     → single column with one full-width image above the options
//  • 2–4 images  → single column with a horizontal image carousel above the options
//  • > 4 images  → the default two-column layout (image column left, options right)
// Optionally hide the gallery entirely (options-only panel). Embedded, there is
// no room for an image column, so any multi-image gallery is a carousel.
export function quickAddLayout(product: QuickAddProduct, embedded = false) {
  const hideGallery = product.hideGallery ?? false
  const isSingleImage = product.images.length === 1
  const useCarousel = product.images.length > 1 && (embedded || product.images.length <= 4)
  // Optionally hide the gallery on mobile (images still render on desktop).
  const hideGalleryOnMobile = product.hideGalleryOnMobile ?? false
  // Single-column layout whenever there's no left image column.
  const singleColumn = useCarousel || isSingleImage || hideGallery
  return { hideGallery, isSingleImage, useCarousel, hideGalleryOnMobile, singleColumn }
}

// Pre-select the first value of each option
function defaultSelections(product: QuickAddProduct): Record<string, string> {
  const defaults: Record<string, string> = {}
  product.options.forEach(opt => {
    if (opt.values && opt.values.length > 0) {
      defaults[opt.name] = opt.values[0].value
    }
  })
  return defaults
}

/**
 * The Quick Add form — title, price and rating, the gallery, the options and
 * the CTA. The Quick Add panel renders it in its own slide-in panel; the nested
 * items drawer renders it in place of its grid. Mount it per product (keyed by
 * title): it starts from `initialValues`, or the defaults.
 */
export function QuickAddPanelContent({ product, ctaLabel, showViewDetails, onAdd, initialValues, onChange, onDone, embedded = false, headerStart, afterOptions }: QuickAddPanelContentProps) {
  const { addItem, openCart } = useCart()
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  // Brand icons the form needs (star rating + select chevron).
  const { StarIcon, ChevronIcon } = BRAND_ICONS[brand as keyof typeof BRAND_ICONS] ?? BRAND_ICONS.oal

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    // A partial set (say, only the metal a host already chose) keeps the defaults for the rest
    () => ({ ...defaultSelections(product), ...initialValues?.selectedOptions })
  )
  const [imageIdx, setImageIdx] = useState(0)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  // Number-of-names selector + one engraving field per name (each independently
  // controlled). `showNameErrors` surfaces per-field "required" errors after a
  // blocked Add attempt.
  const [nameCount, setNameCount] = useState(initialValues?.names.length ?? 1)
  const [names, setNames] = useState<string[]>(initialValues?.names ?? [''])
  const [showNameErrors, setShowNameErrors] = useState(false)

  // `engraving: 'fields'` — the product's own text inputs stand in for the
  // names, each required, with the same blocked-Add errors.
  const usesNameFields = (product.engraving ?? 'names') === 'names'
  const [showFieldErrors, setShowFieldErrors] = useState(false)

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

  const select = (name: string, value: string) =>
    setSelectedOptions(prev => ({ ...prev, [name]: value }))

  // Report every change to a host that mirrors the choices (e.g. the PDP's metal)
  useEffect(() => {
    onChange?.({ selectedOptions, names })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the choices drive it
  }, [selectedOptions, names])

  const totalPrice = product.options.reduce((acc, opt) => {
    const val = opt.values?.find(v => v.value === selectedOptions[opt.name])
    return acc + (val?.price ?? 0)
  }, product.price)

  const pdpHref = `/${brand}${product.pdpUrl}`

  // The title follows the metal picked ("… in Silver Finish" → "… in Rose Gold Plating")
  const metalOption = product.options.find(o => o.type === 'swatch')
  const title = titleForMetal(product.title, metalOption && selectedOptions[metalOption.name])

  const { hideGallery, isSingleImage, useCarousel, hideGalleryOnMobile } = quickAddLayout(product, embedded)
  const carouselSrcs = product.images.map((im) => im.src)
  const modelSrcs = product.images.filter((im) => im.onModel).map((im) => im.src)
  // Packshots blend onto the tint; on-model shots are left as they are
  const imageClass = (base: string, onModel?: boolean) => (onModel ? `${base} ${styles.imageModel}` : base)

  const handleAddToBag = () => {
    // Validation — every visible name (or text) field is required. Block Add
    // and surface per-field errors if any are empty.
    const trimmedNames = usesNameFields ? names.map(n => n.trim()) : []
    if (trimmedNames.some(n => n === '')) {
      setShowNameErrors(true)
      return
    }
    const emptyField = !usesNameFields && product.options.some(
      opt => opt.type === 'text-input' && !(selectedOptions[opt.name] ?? '').trim()
    )
    if (emptyField) {
      setShowFieldErrors(true)
      return
    }

    // The dynamic name fields replace the product's own text-input engraving.
    const selectedOptionsList = product.options
      .filter(opt => !usesNameFields || opt.type !== 'text-input')
      .map(opt => ({ label: opt.name, value: (selectedOptions[opt.name] ?? '').trim() }))
      .filter(o => o.value)

    const nameOptions = trimmedNames.map((n, i) => ({ label: `Name ${i + 1}`, value: n }))

    const cartItem: CartItem = {
      id: `quickadd-${product.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      name: title,
      price: totalPrice,
      originalPrice: product.salePrice ? product.price : undefined,
      image: product.images[0]?.src ?? '',
      isPersonalized: true,
      rating: product.rating,
      reviewCount: product.reviewCount,
      selectedOptions: [...selectedOptionsList, ...nameOptions],
    }
    // Nested Items path: hand the configured item back to the caller to stage,
    // without touching the cart or opening the floating cart.
    if (onAdd) {
      onAdd(cartItem, { selectedOptions, names })
      onDone()
      return
    }
    addItem(cartItem)
    onDone()
    // Close any panel this one is stacked on (e.g. Shop The Look) so the bag
    // opens unobstructed — same end state as a Quick Add from the grid.
    closeAllPanels()
    openCart(true)
  }

  // Renders a single product option (swatch / pills / text-input / dropdown).
  const renderOption = (opt: QuickAddOption) => (
    <div key={opt.name} className={styles.optionGroup}>
      {/* The PDP's metal picker — each swatch with its full price below */}
      {opt.type === 'swatch' && opt.showPrices && (
        <>
          <p className={styles.pricedSwatchLabel}>
            {opt.name}:{' '}
            <span className={styles.pricedSwatchValue}>
              {opt.values?.find(v => v.value === selectedOptions[opt.name])?.label}
            </span>
          </p>
          <div className={styles.pricedSwatches}>
            {opt.values?.map(v => {
              const variantPrice = fmt(product.price + (v.price ?? 0), product.currency)
              const isSelected = selectedOptions[opt.name] === v.value
              return (
                <button
                  key={v.value}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${v.label}, ${variantPrice}`}
                  className={`${styles.pricedSwatch} ${isSelected ? styles.pricedSwatchSelected : ''}`}
                  onClick={() => select(opt.name, v.value)}
                >
                  <span
                    className={styles.pricedSwatchCircle}
                    style={{ background: v.color ?? 'var(--colors-surface-secondary)' }}
                    aria-hidden="true"
                  />
                  <span className={styles.pricedSwatchPrice}>{variantPrice}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {opt.type === 'swatch' && !opt.showPrices && (
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

      {/* Open grid, standard image — the PDP options' own grid, so the tiles,
          the radio group and its arrow-key focus all match the product page */}
      {opt.type === 'grid' && (
        <OptionRadioGroup
          group={{
            id: opt.name,
            label: opt.name,
            display: 'grid',
            tile: 'standard',
            values: (opt.values ?? []).map(v => ({ id: v.value, label: v.label, image: v.image, swatchColor: v.color })),
          }}
          value={selectedOptions[opt.name] ?? ''}
          onChange={id => select(opt.name, id)}
        />
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

      {opt.type === 'text-input' && (() => {
        const err = showFieldErrors && !(selectedOptions[opt.name] ?? '').trim()
        return (
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
                className={`${styles.textInput} ${err ? styles.textInputError : ''}`}
                aria-invalid={err || undefined}
                aria-describedby={err ? `qa-${opt.name}-error` : undefined}
                onChange={e => select(opt.name, e.target.value)}
              />
              {opt.maxLength && (
                <span className={styles.charCount}>
                  {(selectedOptions[opt.name] ?? '').length}/{opt.maxLength}
                </span>
              )}
            </div>
            {err && (
              <p id={`qa-${opt.name}-error`} className={styles.errorMsg}>
                Please enter {opt.name}.
              </p>
            )}
          </>
        )
      })()}

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
  const namesSection = (
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

  return (
    <>
      {/* Body — desktop left image column + right content column */}
      <div className={`${styles.panelBody} ${embedded ? styles.panelBodyEmbedded : ''}`}>
        {/* Desktop: left column — all images stacked, vertically scrollable.
            Only for products with > 4 images (1 image and the 2–4 carousel
            variant both render inline in the right column). */}
        {!useCarousel && !isSingleImage && !hideGallery && (
          <div className={styles.desktopImage} aria-hidden="true">
            {product.images.map((img, i) => (
              <div key={i} className={styles.desktopImageCell}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className={imageClass(styles.desktopImageEl, img.onModel)}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        )}

        {/* Right column: scrollable content + sticky footer */}
        <div className={styles.rightCol}>
          {/* Title + price + review — pinned at the top of the right column (outside
              the scroll area) so it stays visible while the gallery and options
              scroll under it. */}
          <div className={`${styles.header} ${headerStart ? styles.headerWithStart : ''}`}>
            {headerStart}
            <div className={styles.headerText}>
              <h2 className={styles.title}>{title}</h2>
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
          </div>

          <div className={styles.scrollArea}>
            {/* 1 image — one full-width image stacked below the title, on
                desktop and mobile alike (no carousel, no thumbnail gallery). */}
            {isSingleImage && !hideGallery && (
              <div className={`${styles.singleImage} ${hideGalleryOnMobile ? styles.hideOnMobile : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0].src}
                  alt={product.images[0].alt}
                  className={imageClass(styles.singleImageEl, product.images[0].onModel)}
                  loading="eager"
                />
              </div>
            )}

            {/* 2–4 images — horizontal image carousel above the options (shared
                PDP carousel), shown at every breakpoint. */}
            {useCarousel && !hideGallery && (
              <ProductImageCarousel
                images={carouselSrcs}
                modelImages={modelSrcs}
                peek
                showProgress={false}
                className={`${styles.panelCarousel} ${hideGalleryOnMobile ? styles.hideOnMobile : ''}`}
              />
            )}

            {/* > 4 images — mobile thumbnail gallery (desktop uses the left column) */}
            {!useCarousel && !isSingleImage && !hideGallery && (
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
                    <img src={img.src} alt={img.alt} className={imageClass(styles.galleryImg, img.onModel)} loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Options — swatch(es) → number-of-names + name fields → the rest.
                (The product's own text-input engraving is replaced by the name
                fields, unless the product asks for its own fields instead.) */}
            <div className={styles.options}>
              {product.options.filter(o => o.type === 'swatch').map(renderOption)}
              {usesNameFields && namesSection}
              {product.options
                .filter(o => o.type !== 'swatch' && (!usesNameFields || o.type !== 'text-input'))
                .map(renderOption)}
            </div>

            {afterOptions && <div className={styles.afterOptions}>{afterOptions}</div>}

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
                <a href={pdpHref} className={styles.viewDetails} onClick={onDone}>
                  View Full Details
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile image lightbox — portalled, so a transformed panel around the
          form can't contain its fixed positioning */}
      {lightboxSrc && (
        <PanelPortal>
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
        </PanelPortal>
      )}
    </>
  )
}
