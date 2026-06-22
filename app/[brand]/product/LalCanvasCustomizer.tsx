'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { CartItem } from '../_context/CartContext'
import type { ProductItem } from '../../../data/products'
import pdp from './ProductDetailPage.module.css'
import styles from './LalCanvasCustomizer.module.css'

// ─── Types ──────────────────────────────────────────────────────────────────
type IconCmp = React.ComponentType<{ size?: number; color?: string; className?: string }>

interface CustomizerIcons {
  ChevronIcon: IconCmp
  StarIcon: IconCmp
  FileUploadIcon: IconCmp
  CheckmarkIcon: IconCmp
  XIcon: IconCmp
  ShippingIcon: IconCmp
  GiftIcon: IconCmp
  MapPinIcon: IconCmp
  PersonIcon: IconCmp
  ClipboardCopyIcon: IconCmp
  RevisionsIcon?: IconCmp   // LAL-only icon; optional so the shared BRAND_ICONS type still satisfies
  AiSparkleIcon?: IconCmp   // LAL-only icon; optional for the same reason
}

interface LalCanvasCustomizerProps {
  brand: string
  product: ProductItem
  icons: CustomizerIcons
  addItem: (item: CartItem) => void
  openCart: () => void
}

// ─── Data ───────────────────────────────────────────────────────────────────
interface FrameColor { key: string; label: string; color: string; hasBorder?: boolean }

const FRAME_COLORS: FrameColor[] = [
  { key: 'black',  label: 'Black',  color: 'var(--frame-color-black)'  },
  { key: 'white',  label: 'White',  color: 'var(--frame-color-white)', hasBorder: true },
  { key: 'walnut', label: 'Walnut', color: 'var(--frame-color-walnut)' },
  { key: 'gold',   label: 'Gold',   color: 'var(--frame-color-gold)'   },
]

interface SizeOption { key: string; priceInCents: number }

const SIZES: SizeOption[] = [
  { key: 'XS', priceInCents: 7500  },
  { key: 'S',  priceInCents: 9500  },
  { key: 'M',  priceInCents: 12000 },
  { key: 'L',  priceInCents: 15000 },
  { key: 'XL', priceInCents: 19000 },
]

const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.webp'

// LAL products carry no rating data — show a consistent canvas rating.
const LAL_RATING = 4.8
const LAL_REVIEW_COUNT = 27

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

function truncate(name: string, max = 22): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

// ─── Cart thumbnail compositing ───────────────────────────────────────────────
// Renders the full framed canvas (grey square + frame + textured mat + photo +
// watermark + personalization) to a PNG data URL for the cart line item.
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawImageCover(
  ctx: CanvasRenderingContext2D, img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const ir = img.width / img.height
  const dr = dw / dh
  let sx = 0, sy = 0, sw = img.width, sh = img.height
  if (ir > dr) { sw = img.height * dr; sx = (img.width - sw) / 2 }
  else         { sh = img.width / dr;  sy = (img.height - sh) / 2 }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

interface ComposeOpts {
  photoUrl: string
  frameColor: string
  matColor: string
  bgColor: string
  line1: string
  line2: string
}

async function composeFramedImage(opts: ComposeOpts): Promise<string> {
  const SIZE = 800
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return opts.photoUrl

  // Grey canvas background (square)
  ctx.fillStyle = opts.bgColor || '#f5f5f5'
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Frame (portrait, centered)
  const outerW = 500, outerH = 640, border = 22
  const fx = (SIZE - outerW) / 2
  const fy = (SIZE - outerH) / 2
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.18)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 12
  ctx.fillStyle = opts.frameColor || '#111111'
  ctx.fillRect(fx, fy, outerW, outerH)
  ctx.restore()

  // White mat + subtle canvas texture
  const mx = fx + border, my = fy + border
  const mw = outerW - border * 2, mh = outerH - border * 2
  ctx.fillStyle = opts.matColor || '#ffffff'
  ctx.fillRect(mx, my, mw, mh)
  ctx.save()
  ctx.strokeStyle = 'rgba(0,0,0,0.025)'
  ctx.lineWidth = 1
  for (let gx = mx; gx < mx + mw; gx += 3) { ctx.beginPath(); ctx.moveTo(gx, my); ctx.lineTo(gx, my + mh); ctx.stroke() }
  for (let gy = my; gy < my + mh; gy += 3) { ctx.beginPath(); ctx.moveTo(mx, gy); ctx.lineTo(mx + mw, gy); ctx.stroke() }
  ctx.restore()

  // Photo (3:4, cover)
  const pad = 26
  const ibx = mx + pad, iby = my + pad
  const ibw = mw - pad * 2, ibh = ibw * 4 / 3
  try {
    const img = await loadImage(opts.photoUrl)
    drawImageCover(ctx, img, ibx, iby, ibw, ibh)
  } catch { /* leave mat blank if the image fails to load */ }

  // Watermark over the photo
  ctx.save()
  ctx.beginPath(); ctx.rect(ibx, iby, ibw, ibh); ctx.clip()
  ctx.translate(ibx + ibw / 2, iby + ibh / 2)
  ctx.rotate((-35 * Math.PI) / 180)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.font = '700 15px Poppins, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let gy = -ibh; gy <= ibh; gy += 90) {
    for (let gx = -ibw; gx <= ibw; gx += 210) {
      ctx.fillText('© LIME & LOU PREVIEW', gx, gy)
    }
  }
  ctx.restore()

  // Personalization lines below the photo
  let ty = iby + ibh + 38
  ctx.textAlign = 'center'
  if (opts.line1) {
    ctx.fillStyle = '#111111'
    ctx.font = '600 17px Poppins, system-ui, sans-serif'
    ctx.fillText(opts.line1.toUpperCase(), mx + mw / 2, ty)
    ty += 26
  }
  if (opts.line2) {
    ctx.fillStyle = '#888888'
    ctx.font = '400 13px Poppins, system-ui, sans-serif'
    ctx.fillText(opts.line2, mx + mw / 2, ty)
  }

  return canvas.toDataURL('image/png')
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LalCanvasCustomizer({ brand, product, icons, addItem, openCart }: LalCanvasCustomizerProps) {
  const {
    ChevronIcon, StarIcon, FileUploadIcon, XIcon, ShippingIcon, GiftIcon,
    MapPinIcon, PersonIcon, ClipboardCopyIcon, RevisionsIcon, AiSparkleIcon,
  } = icons
  const RevisionsGlyph = RevisionsIcon ?? ClipboardCopyIcon

  const [photoUrl, setPhotoUrl]   = useState<string | null>(null)
  const [photoName, setPhotoName] = useState<string>('')
  const [frameKey, setFrameKey]   = useState<string>('black')
  const [sizeKey, setSizeKey]     = useState<string>('XS')
  const [persOn, setPersOn]       = useState(false)
  const [line1, setLine1]         = useState('')
  const [line2, setLine2]         = useState('')
  const [photoError, setPhotoError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [previewGenerated, setPreviewGenerated] = useState(false)
  const [previewExpanded, setPreviewExpanded]   = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const sectionRef   = useRef<HTMLElement>(null)

  // Revoke object URLs to avoid leaks
  useEffect(() => {
    return () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }
  }, [photoUrl])

  const selectedSize  = SIZES.find(s => s.key === sizeKey) ?? SIZES[0]
  const selectedFrame = FRAME_COLORS.find(f => f.key === frameKey) ?? FRAME_COLORS[0]
  const currentPrice  = selectedSize.priceInCents

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(URL.createObjectURL(file))
    setPhotoName(file.name)
    setPhotoError(false)
    setPreviewGenerated(false) // new photo → previous preview is stale
  }

  const handleRemovePhoto = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl)
    setPhotoUrl(null)
    setPhotoName('')
    setPreviewGenerated(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCustomize = () => {
    if (!photoUrl) {
      setPhotoError(true)
      return
    }
    setModalOpen(true)
  }

  const handleAddToBag = async () => {
    const l1 = persOn ? line1.trim() : ''
    const l2 = persOn ? line2.trim() : ''
    const selectedOptions = [
      { label: 'Frame', value: selectedFrame.label },
      { label: 'Size', value: selectedSize.key },
      ...(l1 ? [{ label: 'First Line', value: l1 }] : []),
      ...(l2 ? [{ label: 'Second Line', value: l2 }] : []),
      ...(photoName ? [{ label: 'Photo', value: photoName }] : []),
    ]

    // Composite the full framed canvas for the cart thumbnail (fall back to raw photo)
    let image = photoUrl ?? product.image
    if (photoUrl) {
      try {
        const cs = sectionRef.current ? getComputedStyle(sectionRef.current) : null
        image = await composeFramedImage({
          photoUrl,
          frameColor: cs?.getPropertyValue(`--frame-color-${frameKey}`).trim() || '#111111',
          matColor:   cs?.getPropertyValue('--colors-background').trim() || '#ffffff',
          bgColor:    cs?.getPropertyValue('--colors-surface-primary').trim() || '#f5f5f5',
          line1: l1,
          line2: l2,
        })
      } catch { /* keep the raw photo on failure */ }
    }

    addItem({
      id: `${product.id}-${frameKey}-${sizeKey}-${Date.now()}`,
      name: product.name,
      price: currentPrice,
      originalPrice: undefined,
      image,
      isPersonalized: l1.length > 0 || l2.length > 0,
      selectedOptions,
    })
    setModalOpen(false)
    openCart()
  }

  const handleContinueShopping = () => {
    setModalOpen(false)
    setPreviewGenerated(true)  // persist the generated preview on the PDP
    setPreviewExpanded(false)  // collapsed by default
  }

  const filledStars = Math.round(LAL_RATING)

  return (
    <section ref={sectionRef} className={pdp.formPanel} aria-label="Product options">
      {/* Header */}
      <div className={pdp.productHeader}>
        <nav className={pdp.breadcrumb} aria-label="Breadcrumb">
          <ol className={pdp.breadcrumbList}>
            <li><Link href={`/${brand}`} className={pdp.breadcrumbLink}>Home</Link></li>
            <li aria-hidden="true" className={pdp.breadcrumbSep}><ChevronIcon size={20} /></li>
            <li><Link href={`/${brand}/category`} className={pdp.breadcrumbLink}>Best Sellers</Link></li>
          </ol>
        </nav>

        <div className={pdp.productTitlePriceGroup}>
          <h1 className={pdp.productTitle}>{product.name}</h1>
          <div className={pdp.priceRow}>
            <span className={pdp.priceCurrent}>{formatPrice(currentPrice)}</span>
          </div>
        </div>

        <div className={pdp.ratingRow}>
          <div className={pdp.stars} aria-label={`${LAL_RATING} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={i <= filledStars ? pdp.starFilled : pdp.starEmpty}>
                <StarIcon size={20} />
              </span>
            ))}
          </div>
          <span className={pdp.ratingValue}>{LAL_RATING}</span>
          <a
            href="#reviews"
            className={pdp.ratingCount}
            onClick={e => { e.preventDefault(); document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
          >{LAL_REVIEW_COUNT} Reviews</a>
        </div>
      </div>

      {/* Unlimited Revisions info card */}
      <div className={styles.revisionsCard}>
        <span className={styles.revisionsIcon} aria-hidden="true"><RevisionsGlyph size={24} /></span>
        <div className={styles.revisionsBody}>
          <p className={styles.revisionsTitle}>Unlimited Revisions Included</p>
          <p className={styles.revisionsText}>
            Receive your personalized preview by email within 48 hours and enjoy unlimited revisions until it&apos;s just right.
          </p>
        </div>
      </div>

      {/* Step 1 — Add photo */}
      <div className={styles.step}>
        <p className={styles.stepLabel}>1. Add photo</p>
        <div className={`${styles.uploadCard} ${photoError ? styles.uploadCardError : ''}`}>
          <button
            type="button"
            className={styles.uploadTrigger}
            onClick={() => fileInputRef.current?.click()}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="" className={styles.uploadThumb} />
            ) : (
              <span className={styles.uploadIcon} aria-hidden="true"><FileUploadIcon size={24} /></span>
            )}
            <span className={styles.uploadCopy}>
              <span className={styles.uploadTitle}>Upload your photo</span>
              <span className={styles.uploadSub}>
                {photoUrl ? truncate(photoName) : 'Select 1 image from your device'}
              </span>
            </span>
          </button>
          {photoUrl && (
            <button
              type="button"
              className={styles.uploadRemove}
              aria-label="Remove photo"
              onClick={handleRemovePhoto}
            >
              <XIcon size={20} />
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className={styles.hiddenInput}
          onChange={handleFile}
        />
        {photoError && <p className={styles.fieldError}>Please upload a photo to continue.</p>}
      </div>

      {/* Step 2 — Select frame */}
      <div className={styles.step}>
        <p className={styles.stepLabel}>
          2. Select frame &ndash; <span className={styles.stepValue}>{selectedFrame.label}</span>
        </p>
        <div className={styles.frameSwatchRow}>
          {FRAME_COLORS.map(f => {
            const isSel = f.key === frameKey
            return (
              <button
                key={f.key}
                type="button"
                className={`${styles.frameSwatch} ${isSel ? styles.frameSwatchActive : ''}`}
                aria-pressed={isSel}
                aria-label={f.label}
                onClick={() => setFrameKey(f.key)}
              >
                <span
                  className={`${styles.frameSwatchCircle} ${f.hasBorder ? styles.frameSwatchCircleBordered : ''}`}
                  style={{ backgroundColor: f.color }}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 3 — Choose size */}
      <div className={styles.step}>
        <div className={styles.stepHeaderRow}>
          <p className={styles.stepLabel}>3. Choose size</p>
          <button type="button" className={styles.sizeGuideLink}>Size guide</button>
        </div>
        <div className={styles.sizeRow}>
          {SIZES.map(s => {
            const isSel = s.key === sizeKey
            return (
              <button
                key={s.key}
                type="button"
                className={`${styles.sizePill} ${isSel ? styles.sizePillActive : ''}`}
                aria-pressed={isSel}
                onClick={() => setSizeKey(s.key)}
              >
                {s.key}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 4 — Personalization */}
      <div className={`${styles.step} ${styles.stepLast}`}>
        <button
          type="button"
          className={styles.persToggle}
          aria-pressed={persOn}
          onClick={() => { setPersOn(v => !v); setPreviewGenerated(false) }}
        >
          <span className={`${styles.persCheckbox} ${persOn ? styles.persCheckboxOn : ''}`} aria-hidden="true">
            {persOn && <icons.CheckmarkIcon size={20} />}
          </span>
          <span className={styles.persLabel}>Add free personalization</span>
        </button>

        {persOn && (
          <div className={styles.persFields}>
            <div className={styles.persField}>
              <label className={styles.persFieldLabel} htmlFor="lal-line1">
                First Line <span className={styles.persOptional}>(optional)</span>
              </label>
              <input
                id="lal-line1"
                type="text"
                value={line1}
                onChange={e => { setLine1(e.target.value); setPreviewGenerated(false) }}
                placeholder="e.g. Claudia & Johnny"
                autoComplete="off"
                className={styles.persInput}
              />
            </div>
            <div className={styles.persField}>
              <label className={styles.persFieldLabel} htmlFor="lal-line2">
                Second Line <span className={styles.persOptional}>(optional)</span>
              </label>
              <input
                id="lal-line2"
                type="text"
                value={line2}
                onChange={e => { setLine2(e.target.value); setPreviewGenerated(false) }}
                placeholder="e.g. Luckiest kids on earth right now"
                autoComplete="off"
                className={styles.persInput}
              />
            </div>
          </div>
        )}
      </div>

      {/* Saved AI preview — appears after generation, expand/collapse */}
      {previewGenerated && photoUrl && (
        <div className={styles.savedPreview}>
          <button
            type="button"
            className={styles.savedPreviewHeader}
            aria-expanded={previewExpanded}
            onClick={() => setPreviewExpanded(v => !v)}
          >
            <span className={styles.savedPreviewTitle}>Your Preview</span>
            <span
              className={`${styles.savedPreviewChevron} ${previewExpanded ? styles.savedPreviewChevronOpen : ''}`}
              aria-hidden="true"
            >
              <ChevronIcon size={24} />
            </span>
          </button>
          {previewExpanded && (
            <div className={styles.savedPreviewBody}>
              <button
                type="button"
                className={styles.savedPreviewFrame}
                aria-label="Open preview"
                onClick={() => setModalOpen(true)}
              >
                <FramePreview
                  photoUrl={photoUrl}
                  frameColor={selectedFrame.color}
                  frameHasBorder={!!selectedFrame.hasBorder}
                  line1={persOn ? line1.trim() : ''}
                  line2={persOn ? line2.trim() : ''}
                  blurred={false}
                />
              </button>
              {AiSparkleIcon && (
                <span className={styles.savedPreviewSparkle} aria-hidden="true">
                  <AiSparkleIcon size={32} />
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subtotal + CTA */}
      <div className={styles.subtotalRow}>
        <span className={styles.subtotalLabel}>Subtotal:</span>
        <span className={styles.subtotalValue}>{formatPrice(currentPrice)}</span>
      </div>
      <button
        type="button"
        className={styles.customizeBtn}
        onClick={previewGenerated ? handleAddToBag : handleCustomize}
      >
        {previewGenerated ? 'Add to Bag' : 'Customize Now'}
      </button>

      {/* Trust badges */}
      <ul className={styles.trustBadges} aria-label="Trust badges">
        {[
          { Icon: MapPinIcon,   text: 'American-Made' },
          { Icon: ShippingIcon, text: 'Free Shipping on all orders' },
          { Icon: GiftIcon,     text: 'Gift note available in cart' },
          { Icon: PersonIcon,   text: 'Made by real artists' },
        ].map(({ Icon, text }) => (
          <li key={text} className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true"><Icon size={24} /></span>
            <span className={styles.trustText}>{text}</span>
          </li>
        ))}
      </ul>

      {modalOpen && (
        <CanvasPreviewModal
          photoUrl={photoUrl!}
          frameColor={selectedFrame.color}
          frameHasBorder={!!selectedFrame.hasBorder}
          line1={persOn ? line1.trim() : ''}
          line2={persOn ? line2.trim() : ''}
          icons={icons}
          initialReady={previewGenerated}
          onClose={() => setModalOpen(false)}
          onAddToBag={handleAddToBag}
          onContinueShopping={handleContinueShopping}
        />
      )}
    </section>
  )
}

// ─── Framed canvas preview (shared by modal + saved PDP section) ───────────────
interface FramePreviewProps {
  photoUrl: string
  frameColor: string
  frameHasBorder: boolean
  line1: string
  line2: string
  blurred: boolean
}

function FramePreview({ photoUrl, frameColor, frameHasBorder, line1, line2, blurred }: FramePreviewProps) {
  return (
    <div
      className={`${styles.frameMock} ${frameHasBorder ? styles.frameMockBordered : ''}`}
      style={{ backgroundColor: frameColor }}
    >
      <div className={styles.frameMat}>
        <div className={styles.frameImageBox}>
          <img
            src={photoUrl}
            alt="Your custom canvas preview"
            className={`${styles.frameImage} ${blurred ? styles.frameImageLoading : styles.frameImageReady}`}
          />
          {!blurred && (
            <div className={styles.watermark} aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className={styles.watermarkText}>© LIME &amp; LOU PREVIEW</span>
              ))}
            </div>
          )}
        </div>
        {!blurred && (line1 || line2) && (
          <div className={styles.framePersonalization}>
            {line1 && <span className={styles.framePersLine1}>{line1}</span>}
            {line2 && <span className={styles.framePersLine2}>{line2}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Generation modal ─────────────────────────────────────────────────────────
const GENERATION_MS = 20000

const PROGRESS_MESSAGES = [
  { until: 25,  text: 'Analyzing your image…' },
  { until: 50,  text: 'Applying watercolor style…' },
  { until: 75,  text: 'Adding artistic details…' },
  { until: 100, text: 'Finalizing your preview…' },
]

function messageForProgress(pct: number): string {
  return (PROGRESS_MESSAGES.find(m => pct < m.until) ?? PROGRESS_MESSAGES[PROGRESS_MESSAGES.length - 1]).text
}

interface CanvasPreviewModalProps {
  photoUrl: string
  frameColor: string
  frameHasBorder: boolean
  line1: string
  line2: string
  icons: CustomizerIcons
  initialReady?: boolean
  onClose: () => void
  onAddToBag: () => void
  onContinueShopping: () => void
}

function CanvasPreviewModal({
  photoUrl, frameColor, frameHasBorder, line1, line2, icons, initialReady = false,
  onClose, onAddToBag, onContinueShopping,
}: CanvasPreviewModalProps) {
  const { XIcon, CheckmarkIcon } = icons
  const [phase, setPhase]       = useState<'loading' | 'ready'>(initialReady ? 'ready' : 'loading')
  const [progress, setProgress] = useState(initialReady ? 100 : 0)
  const [runId, setRunId]       = useState(0)
  const [regenUsed, setRegenUsed] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  // Progress timer — drives loading phase, then flips to ready
  useEffect(() => {
    if (phase !== 'loading') return
    const start = Date.now()
    let raf = 0
    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, Math.round((elapsed / GENERATION_MS) * 100))
      setProgress(pct)
      if (elapsed < GENERATION_MS) {
        raf = requestAnimationFrame(tick)
      } else {
        setPhase('ready')
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, runId])

  // Lock background scroll while the modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Focus management + Escape + basic focus trap
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last  = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleRegenerate = () => {
    if (regenUsed || phase !== 'ready') return
    setRegenUsed(true)
    setProgress(0)
    setPhase('loading')
    setRunId(n => n + 1)
  }

  // Prototype-only: skip the 20s generation by clicking the percentage / progress bar
  const handleSkip = () => {
    if (phase !== 'loading') return
    setProgress(100)
    setPhase('ready')
  }

  const isReady = phase === 'ready'

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Watercolor preview"
      onClick={e => { if (isReady && e.target === e.currentTarget) onClose() }}
    >
      <div className={styles.modalPanel} ref={panelRef}>
        <button
          type="button"
          ref={closeRef}
          className={styles.modalClose}
          aria-label="Close preview"
          onClick={onClose}
        >
          <XIcon size={24} />
        </button>

        {/* Top / left — framed canvas preview */}
        <div className={styles.previewSection}>
          <div className={styles.previewWrap}>
            <FramePreview
              photoUrl={photoUrl}
              frameColor={frameColor}
              frameHasBorder={frameHasBorder}
              line1={line1}
              line2={line2}
              blurred={!isReady}
            />
          </div>
        </div>

        {/* Bottom / right — badge, heading, progress, CTAs */}
        <div className={styles.contentSection}>
        {/* Status badge */}
        <div className={styles.statusRow}>
          {isReady ? (
            <span className={styles.statusBadge}>
              <CheckmarkIcon size={14} /> Unlimited Revisions Included
            </span>
          ) : (
            <span className={`${styles.statusBadge} ${styles.statusBadgeLoading}`}>Generating…</span>
          )}
        </div>

        {/* Heading */}
        {isReady ? (
          <h2 className={styles.modalHeading}>Your Watercolor Preview Is Ready!</h2>
        ) : (
          <h2 key={messageForProgress(progress)} className={`${styles.modalHeading} ${styles.modalHeadingFade}`}>
            {messageForProgress(progress)}
          </h2>
        )}

        {/* Progress (loading only) */}
        {!isReady && (
          <>
            <p
              className={styles.progressPct}
              onClick={handleSkip}
              style={{ cursor: 'pointer' }}
              title="Skip generation (prototype)"
            >{progress}%</p>
            <div
              className={styles.progressTrack}
              onClick={handleSkip}
              style={{ cursor: 'pointer' }}
              title="Skip generation (prototype)"
            >
              <div
                className={styles.progressFill}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {/* Disclaimer */}
        <p className={styles.disclaimer}>
          {regenUsed ? (
            <>Note: The final artwork may differ slightly from the AI-generated preview. <span className={styles.regenUsed}>Regeneration used.</span></>
          ) : (
            <>
              Note: The final artwork may differ slightly from the AI-generated preview. If needed, you may{' '}
              <button
                type="button"
                className={styles.regenLink}
                disabled={!isReady}
                onClick={handleRegenerate}
              >
                regenerate
              </button>{' '}
              your preview once.
            </>
          )}
        </p>

        {/* Ready CTAs */}
        {isReady && (
          <>
            <button type="button" className={styles.customizeBtn} onClick={onAddToBag}>
              Add to Bag
            </button>
            <button type="button" className={styles.continueLink} onClick={onContinueShopping}>
              Continue Shopping
            </button>
          </>
        )}
        </div>
      </div>
    </div>
  )
}
