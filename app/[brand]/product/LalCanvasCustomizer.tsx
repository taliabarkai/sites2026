'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import type { CartItem } from '../_context/CartContext'
import type { ProductItem } from '../../../data/products'
import lalLoader from '@/src/assets/icons/lal/LAL.gif'
import { RevisionsNotice } from '../_components/RevisionsNotice'
import { useNestedItems } from '../_components/NestedItems/useNestedItems'
import type { QuickAddProduct } from '../_components/QuickAddPanel'
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
  items: CartItem[]
  previewId?: string
  nestedItems?: QuickAddProduct[]
  addItem: (item: CartItem) => void
  openCart: (added?: boolean) => void
  onLivePreviewChange?: (image: string | null) => void
}

// ─── Data ───────────────────────────────────────────────────────────────────
interface FrameColor { key: string; label: string; color: string; hasBorder?: boolean }

const FRAME_COLORS: FrameColor[] = [
  { key: 'black',  label: 'Black',  color: 'var(--frame-color-black)'  },
  { key: 'white',  label: 'White',  color: 'var(--frame-color-white)', hasBorder: true },
  { key: 'walnut', label: 'Walnut', color: 'var(--frame-color-walnut)' },
  { key: 'gold',   label: 'Gold',   color: 'var(--frame-color-gold)'   },
]

// Photoreal frame mockups used in the AI preview — the selected frame color
// swaps this background and the artwork sits in the mockup's grey opening.
// walnut → dark wood, gold → light wood (closest available tones).
const FRAME_IMAGES: Record<string, string> = {
  black:  '/images/lal/frame-colors/Black.jpg',
  white:  '/images/lal/frame-colors/White.jpg',
  walnut: '/images/lal/frame-colors/DarkWood.jpg',
  gold:   '/images/lal/frame-colors/LightWood.jpg',
}

// Grey canvas window inside the (square) frame mockups, as fractions of the image.
const CANVAS_WINDOW = { x: 0.2065, y: 0.1135, w: 0.584, h: 0.774 }

interface SizeOption { key: string; priceInCents: number; scale: number }

// XL renders at full size; each smaller size shrinks the preview by 6%.
const SIZES: SizeOption[] = [
  { key: 'XS', priceInCents: 7500,  scale: 0.76 },
  { key: 'S',  priceInCents: 9500,  scale: 0.82 },
  { key: 'M',  priceInCents: 12000, scale: 0.88 },
  { key: 'L',  priceInCents: 15000, scale: 0.94 },
  { key: 'XL', priceInCents: 19000, scale: 1.0  },
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
  frameKey: string
  line1: string
  line2: string
}

// Draws the selected frame mockup, then lays the photo + watermark +
// personalization into the mockup's grey opening (CANVAS_WINDOW).
async function composeFramedImage(opts: ComposeOpts): Promise<string> {
  const SIZE = 1000
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return opts.photoUrl

  // Frame mockup background
  const frameSrc = FRAME_IMAGES[opts.frameKey] ?? FRAME_IMAGES.black
  try {
    const frameImg = await loadImage(frameSrc)
    ctx.drawImage(frameImg, 0, 0, SIZE, SIZE)
  } catch {
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, SIZE, SIZE)
  }

  // Grey opening → white canvas mat + subtle woven texture
  const wx = CANVAS_WINDOW.x * SIZE
  const wy = CANVAS_WINDOW.y * SIZE
  const ww = CANVAS_WINDOW.w * SIZE
  const wh = CANVAS_WINDOW.h * SIZE
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(wx, wy, ww, wh)
  ctx.save()
  ctx.strokeStyle = 'rgba(0,0,0,0.025)'
  ctx.lineWidth = 1
  for (let gx = wx; gx < wx + ww; gx += 3) { ctx.beginPath(); ctx.moveTo(gx, wy); ctx.lineTo(gx, wy + wh); ctx.stroke() }
  for (let gy = wy; gy < wy + wh; gy += 3) { ctx.beginPath(); ctx.moveTo(wx, gy); ctx.lineTo(wx + ww, gy); ctx.stroke() }
  ctx.restore()

  // Photo (cover) — leaves room at the bottom for the personalization text
  const pad = ww * 0.07
  const hasText = !!(opts.line1 || opts.line2)
  const textReserve = hasText ? wh * 0.15 : pad
  const ibx = wx + pad, iby = wy + pad
  const ibw = ww - pad * 2
  const ibh = wh - pad - textReserve
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
  ctx.font = `700 ${ww * 0.03}px Poppins, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let gy = -ibh; gy <= ibh; gy += ww * 0.14) {
    for (let gx = -ibw; gx <= ibw; gx += ww * 0.34) {
      ctx.fillText('© LIME & LOU PREVIEW', gx, gy)
    }
  }
  ctx.restore()

  // Personalization lines below the photo
  let ty = iby + ibh + ww * 0.06
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  if (opts.line1) {
    ctx.fillStyle = '#111111'
    ctx.font = `600 ${ww * 0.05}px Poppins, system-ui, sans-serif`
    ctx.fillText(opts.line1.toUpperCase(), wx + ww / 2, ty)
    ty += ww * 0.055
  }
  if (opts.line2) {
    ctx.fillStyle = '#888888'
    ctx.font = `400 ${ww * 0.038}px Poppins, system-ui, sans-serif`
    ctx.fillText(opts.line2, wx + ww / 2, ty)
  }

  return canvas.toDataURL('image/jpeg', 0.9)
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LalCanvasCustomizer({ brand, product, icons, items, previewId, nestedItems = [], addItem, openCart, onLivePreviewChange }: LalCanvasCustomizerProps) {
  const {
    ChevronIcon, StarIcon, FileUploadIcon, XIcon, ShippingIcon,
    MapPinIcon, PersonIcon, ClipboardCopyIcon, RevisionsIcon,
  } = icons
  const RevisionsGlyph = RevisionsIcon ?? ClipboardCopyIcon

  // Nested Items — companion products staged above the Subtotal.
  const nested = useNestedItems(brand, nestedItems)

  const [photoUrl, setPhotoUrl]   = useState<string | null>(null)
  const [photoName, setPhotoName] = useState<string>('')
  const [frameKey, setFrameKey]   = useState<string>('black')
  const [sizeKey, setSizeKey]     = useState<string>('XS')
  const [line1, setLine1]         = useState('')
  const [line2, setLine2]         = useState('')
  const [photoError, setPhotoError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [previewGenerated, setPreviewGenerated] = useState(false)

  const fileInputRef  = useRef<HTMLInputElement>(null)
  const sectionRef    = useRef<HTMLElement>(null)
  const restoredIdRef = useRef<string | null>(null)

  // Restore a saved canvas from the cart (?preview=<itemId>) so the preview shows inline
  useEffect(() => {
    if (!previewId || restoredIdRef.current === previewId) return
    const cfg = items.find(i => i.id === previewId)?.canvasConfig
    if (!cfg) return
    restoredIdRef.current = previewId
    setPhotoUrl(cfg.photo)
    setPhotoName(cfg.photoName)
    setFrameKey(cfg.frameKey)
    setSizeKey(cfg.sizeKey)
    setLine1(cfg.line1)
    setLine2(cfg.line2)
    setPreviewGenerated(true)
  }, [previewId, items])

  // Recompose the framed canvas for the gallery "Live Preview" whenever inputs change
  useEffect(() => {
    if (!previewGenerated || !photoUrl) {
      onLivePreviewChange?.(null)
      return
    }
    let cancelled = false
    ;(async () => {
      const image = await composeFramedImage({
        photoUrl,
        frameKey,
        line1: line1.trim(),
        line2: line2.trim(),
      })
      if (!cancelled) onLivePreviewChange?.(image)
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewGenerated, photoUrl, frameKey, line1, line2, sizeKey])

  const selectedSize  = SIZES.find(s => s.key === sizeKey) ?? SIZES[0]
  const selectedFrame = FRAME_COLORS.find(f => f.key === frameKey) ?? FRAME_COLORS[0]
  const currentPrice  = selectedSize.priceInCents

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Read as a data URL so the photo survives navigation/restore from the cart
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoUrl(typeof reader.result === 'string' ? reader.result : null)
      setPhotoName(file.name)
      setPhotoError(false)
      setPreviewGenerated(false) // new photo → previous preview is stale
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
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
    const l1 = line1.trim()
    const l2 = line2.trim()
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
        image = await composeFramedImage({ photoUrl, frameKey, line1: l1, line2: l2 })
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
      canvasConfig: photoUrl
        ? { productId: product.id, photo: photoUrl, photoName, frameKey, sizeKey, persOn: true, line1: l1, line2: l2 }
        : undefined,
    })
    // Add any staged nested items alongside the main product.
    nested.stagedItems.forEach((it) => addItem(it))
    nested.clear()
    setModalOpen(false)
    openCart(true)
  }

  const handleContinueShopping = () => {
    setModalOpen(false)
    setPreviewGenerated(true)  // persist the generated preview → shows in the gallery
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
            <span className={pdp.priceCurrent} style={{ color: 'var(--colors-text)' }}>{formatPrice(currentPrice)}</span>
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

        {/* Unlimited Revisions info card — above the header divider */}
        <RevisionsNotice icon={<RevisionsGlyph size={24} />} />
      </div>

      {/* Add photo */}
      <div className={styles.step}>
        <p className={styles.stepLabel}>Add photo</p>
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

      {/* Select frame */}
      <div className={styles.step}>
        <p className={styles.stepLabel}>
          Select frame &ndash; <span className={styles.stepValue}>{selectedFrame.label}</span>
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

      {/* Choose size */}
      <div className={styles.step}>
        <div className={styles.stepHeaderRow}>
          <p className={styles.stepLabel}>Choose size</p>
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

      {/* First Line */}
      <div className={styles.step}>
        <p className={styles.stepLabel}>First Line</p>
        <input
          id="lal-line1"
          type="text"
          value={line1}
          onChange={e => setLine1(e.target.value)}
          placeholder="e.g. Claudia & Johnny"
          autoComplete="off"
          className={styles.persInput}
        />
      </div>

      {/* Second Line */}
      <div className={`${styles.step} ${styles.stepLast}`}>
        <p className={styles.stepLabel}>Second Line</p>
        <input
          id="lal-line2"
          type="text"
          value={line2}
          onChange={e => setLine2(e.target.value)}
          placeholder="e.g. Luckiest kids on earth right now"
          autoComplete="off"
          className={styles.persInput}
        />
      </div>

      {/* Nested Items — companion products, directly above the Subtotal */}
      {nested.ui}

      {/* Subtotal + CTA */}
      <div className={styles.subtotalRow}>
        <span className={styles.subtotalLabel}>Subtotal:</span>
        <span className={styles.subtotalValue}>{formatPrice(currentPrice + nested.nestedTotal)}</span>
      </div>
      <button
        type="button"
        className={styles.customizeBtn}
        onClick={previewGenerated ? handleAddToBag : handleCustomize}
      >
        {previewGenerated
          ? (nested.stagedCount === 0 ? 'Add to Bag' : `Add ${1 + nested.stagedCount} Items to bag`)
          : 'Customize Now'}
      </button>

      {/* Trust badges */}
      <ul className={styles.trustBadges} aria-label="Trust badges">
        {[
          { Icon: RevisionsGlyph, text: 'Free Unlimited Revisions' },
          { Icon: PersonIcon,     text: 'Made by real artists' },
          { Icon: ShippingIcon,   text: 'Free Shipping On All Orders' },
          { Icon: MapPinIcon,     text: 'American-Made' },
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
          frameKey={frameKey}
          line1={line1.trim()}
          line2={line2.trim()}
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
  frameKey: string
  line1: string
  line2: string
  blurred: boolean
}

function FramePreview({ photoUrl, frameKey, line1, line2, blurred }: FramePreviewProps) {
  const frameImage = FRAME_IMAGES[frameKey] ?? FRAME_IMAGES.black
  return (
    <div
      className={`${styles.frameMock}${blurred ? ` ${styles.frameMockLoading}` : ''}`}
      style={{ backgroundImage: `url(${frameImage})` }}
    >
      {/* Artwork sits inside the mockup's grey opening */}
      <div
        className={styles.frameWindow}
        style={{
          left:   `${CANVAS_WINDOW.x * 100}%`,
          top:    `${CANVAS_WINDOW.y * 100}%`,
          width:  `${CANVAS_WINDOW.w * 100}%`,
          height: `${CANVAS_WINDOW.h * 100}%`,
        }}
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
          {(line1 || line2) && (
            <div className={styles.framePersonalization}>
              {line1 && <span className={styles.framePersLine1}>{line1}</span>}
              {line2 && <span className={styles.framePersLine2}>{line2}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Generation modal ─────────────────────────────────────────────────────────
const GENERATION_MS = 20000

const PROGRESS_MESSAGES = [
  { until: 25,  text: 'ANALYZING YOUR IMAGE...' },
  { until: 50,  text: 'MIXING A ONE-OF-A-KIND WATERCOLOR PALETTE...' },
  { until: 75,  text: 'ADDING FINE ARTISTIC DETAILS...' },
  { until: 100, text: 'FINALIZING YOUR PREVIEW...' },
]

function messageForProgress(pct: number): string {
  return (PROGRESS_MESSAGES.find(m => pct < m.until) ?? PROGRESS_MESSAGES[PROGRESS_MESSAGES.length - 1]).text
}

// Secondary step messages — a longer list so this line changes more often than
// the headline. Kept distinct from the headline copy so they never echo.
const STEP_LABELS = [
  'Reading colors, light & composition',
  'Studying tones & contrast',
  'Blending your custom pigments',
  'Mixing washes & gradients',
  'Layering brushstrokes & texture',
  'Softening edges & shadows',
  'Adding finishing highlights',
  'Polishing the final touches',
]

// Horizontal position, size + staggered delays/durations for the rising dots.
// Each dot starts at the bottom of the canvas and floats upward like a water
// stream. Sizes vary (6–14px) and the wide delay spread keeps bubbles present
// across the whole canvas height at any moment rather than only near the bottom.
const FLOAT_DOTS: Array<CSSProperties> = [
  { left: '6%',  width: '8px',  height: '8px',  animationDelay: '0s',    animationDuration: '4.2s' },
  { left: '14%', width: '12px', height: '12px', animationDelay: '-2.4s', animationDuration: '5.0s' },
  { left: '22%', width: '6px',  height: '6px',  animationDelay: '-1.1s', animationDuration: '3.6s' },
  { left: '30%', width: '10px', height: '10px', animationDelay: '-3.3s', animationDuration: '4.6s' },
  { left: '38%', width: '14px', height: '14px', animationDelay: '-0.7s', animationDuration: '5.4s' },
  { left: '46%', width: '7px',  height: '7px',  animationDelay: '-2.9s', animationDuration: '3.9s' },
  { left: '52%', width: '11px', height: '11px', animationDelay: '-1.8s', animationDuration: '4.8s' },
  { left: '60%', width: '9px',  height: '9px',  animationDelay: '-4.0s', animationDuration: '4.3s' },
  { left: '68%', width: '13px', height: '13px', animationDelay: '-0.4s', animationDuration: '5.2s' },
  { left: '76%', width: '6px',  height: '6px',  animationDelay: '-3.6s', animationDuration: '3.7s' },
  { left: '84%', width: '10px', height: '10px', animationDelay: '-1.5s', animationDuration: '4.5s' },
  { left: '92%', width: '8px',  height: '8px',  animationDelay: '-2.1s', animationDuration: '4.0s' },
  { left: '18%', width: '9px',  height: '9px',  animationDelay: '-4.4s', animationDuration: '5.6s' },
  { left: '72%', width: '12px', height: '12px', animationDelay: '-3.0s', animationDuration: '4.9s' },
]

/**
 * Crossfades a text value: fade out the old text over 300ms, pause 100ms, then
 * swap and fade in the new text over 300ms. Returns the text to display plus a
 * `visible` flag driving the opacity transition. Shared by the headline and the
 * secondary trust message so both swap with identical timing.
 */
function useCrossfadeText(value: string): { text: string; visible: boolean } {
  const [text, setText]       = useState(value)
  const [visible, setVisible] = useState(true)
  const prevRef = useRef(value)

  useEffect(() => {
    if (value === prevRef.current) return
    prevRef.current = value
    setVisible(false)                 // fade out (300ms)
    const t = setTimeout(() => {      // 300ms out + 100ms pause
      setText(value)
      setVisible(true)                // fade in (300ms)
    }, 400)
    return () => clearTimeout(t)
  }, [value])

  return { text, visible }
}

interface CanvasPreviewModalProps {
  photoUrl: string
  frameKey: string
  line1: string
  line2: string
  icons: CustomizerIcons
  initialReady?: boolean
  onClose: () => void
  onAddToBag: () => void
  onContinueShopping: () => void
}

function CanvasPreviewModal({
  photoUrl, frameKey, line1, line2, icons, initialReady = false,
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

  // Segmented progress: 4 phases of 25% each.
  const segmentFill = (i: number) =>
    Math.max(0, Math.min(1, (progress - i * 25) / 25)) * 100

  // Step label changes on finer buckets (once per ~1/N of progress) so it swaps
  // more often than the headline; the small offset keeps the two lines from
  // ever changing on the same tick.
  const stepLabelIndex = Math.min(
    STEP_LABELS.length - 1,
    Math.max(0, Math.floor((progress - 6) / (100 / STEP_LABELS.length))),
  )

  // Crossfaded copy — headline + step label swap on the same fade timing.
  const headline  = useCrossfadeText(messageForProgress(progress))
  const stepLabel = useCrossfadeText(STEP_LABELS[stepLabelIndex])

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
              frameKey={frameKey}
              line1={line1}
              line2={line2}
              blurred={!isReady}
            />
          </div>
          {/* Loading overlays — cover the entire preview section: 40% black tint,
              lime dots streaming upward, and the lime loader centered on top. */}
          {!isReady && (
            <>
              <div className={styles.imageOverlay} aria-hidden="true" />
              <div className={styles.floatDots} aria-hidden="true">
                {FLOAT_DOTS.map((pos, i) => (
                  <span key={i} className={styles.floatDot} style={pos} />
                ))}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lalLoader.src} alt="" className={styles.loaderGif} aria-hidden="true" />
            </>
          )}
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
            <span className={styles.statusBadge}>
              <span className={styles.statusBadgeDot} aria-hidden="true">●</span>
              Creating Your Artwork
            </span>
          )}
        </div>

        {/* Heading */}
        {isReady ? (
          <h2 className={styles.modalHeading}>YOUR WATERCOLOR PREVIEW IS READY!</h2>
        ) : (
          <h2 className={`${styles.modalHeading} ${styles.fadeText}${headline.visible ? '' : ` ${styles.fadeTextHidden}`}`}>
            {headline.text}
          </h2>
        )}

        {/* Segmented step progress (loading only) */}
        {!isReady && (
          <div className={styles.progressBlock}>
            <div
              className={styles.segBar}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              onClick={handleSkip}
              style={{ cursor: 'pointer' }}
              title="Skip generation (prototype)"
            >
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={styles.segTrack}>
                  <div className={styles.segFill} style={{ width: `${segmentFill(i)}%` }} />
                </div>
              ))}
            </div>
            <span className={`${styles.progressStepLabel} ${styles.fadeText}${stepLabel.visible ? '' : ` ${styles.fadeTextHidden}`}`}>{stepLabel.text}</span>
          </div>
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
