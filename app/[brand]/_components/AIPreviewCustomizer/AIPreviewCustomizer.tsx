'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import type { CartItem } from '../../_context/CartContext'
import type { ProductItem } from '../../../../data/products'
import { Button } from '../Button'
import { CustomizerPanel, useIsMobile } from '../CustomizerPanel'
import { RevisionsNotice } from '../RevisionsNotice'
import { useNestedItems } from '../NestedItems/useNestedItems'
import type { QuickAddProduct } from '../QuickAddPanel'
import { generateWatercolorPreview, fileToDataUrl } from './generateWatercolorPreview'
import lalLoader from '@/src/assets/icons/lal/LAL.gif'
import pdp from '../../product/ProductDetailPage.module.css'
import styles from './AIPreviewCustomizer.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────
type IconCmp = React.ComponentType<{ size?: number; color?: string; className?: string }>

interface CustomizerIcons {
  ChevronIcon: IconCmp
  StarIcon: IconCmp
  FileUploadIcon: IconCmp
  XIcon: IconCmp
  [key: string]: IconCmp | undefined
}

interface AIPreviewCustomizerProps {
  brand: string
  product: ProductItem
  icons: CustomizerIcons
  nestedItems?: QuickAddProduct[]
  addItem: (item: CartItem) => void
  openCart: (added?: boolean) => void
}

type GenState = 'idle' | 'generating' | 'ready' | 'regenerating' | 'error'
type Step = 1 | 2

// ─── Options (reuse the watercolor product's frame colors + sizes) ─────────────
interface FrameColor { key: string; label: string; color: string; light?: boolean }
const FRAME_COLORS: FrameColor[] = [
  { key: 'black', label: 'Black', color: 'var(--frame-color-black)' },
  { key: 'white', label: 'White', color: 'var(--frame-color-white)', light: true },
  { key: 'brown', label: 'Dark Wood', color: 'var(--frame-color-walnut)' },
  { key: 'gold',  label: 'Light Wood', color: 'var(--frame-color-gold)' },
]

// Frame mockup photos keyed to the frame color.
const FRAME_IMAGES: Record<string, string> = {
  black: '/images/lal/frame-colors/Black.jpg',
  white: '/images/lal/frame-colors/White.jpg',
  brown: '/images/lal/frame-colors/DarkWood.jpg',
  gold:  '/images/lal/frame-colors/LightWood.jpg',
}

// White canvas window inside the (square) frame mockups, as fractions of the image.
// Sized a touch wider than the measured grey opening so the artwork fully covers
// it and no grey shows along the edges.
const CANVAS_WINDOW = { x: 0.187, y: 0.108, w: 0.624, h: 0.786 }

interface SizeOption { key: string; label: string; priceInCents: number }
const SIZES: SizeOption[] = [
  { key: 'XS', label: 'XS — 8" × 10"',  priceInCents: 7500 },
  { key: 'S',  label: 'S — 12" × 16"',  priceInCents: 9500 },
  { key: 'M',  label: 'M — 18" × 24"',  priceInCents: 12000 },
  { key: 'L',  label: 'L — 24" × 32"',  priceInCents: 15000 },
  { key: 'XL', label: 'XL — 30" × 40"', priceInCents: 19000 },
]

const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.webp'
const GEN_MS = 20000

// Rotating heading shown over the generating canvas.
const GEN_HEADINGS = [
  { until: 25,  text: 'ANALYZING YOUR IMAGE...' },
  { until: 50,  text: 'MIXING YOUR POP-ART PALETTE...' },
  { until: 75,  text: 'ADDING BOLD COLOR & CONTRAST...' },
  { until: 100, text: 'FINALIZING YOUR PREVIEW...' },
]

// Rising lime dots for the generating overlay (ported from the watercolor popup).
const FLOAT_DOTS: CSSProperties[] = [
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

const LAL_RATING = 4.7
const LAL_REVIEW_COUNT = 256

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

function truncate(name: string, max = 24): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name
}

// ─── Framed cart thumbnail ─────────────────────────────────────────────────────
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) {
  const ir = img.width / img.height
  const dr = dw / dh
  let sx = 0, sy = 0, sw = img.width, sh = img.height
  if (ir > dr) { sw = img.height * dr; sx = (img.width - sw) / 2 }
  else         { sh = img.width / dr;  sy = (img.height - sh) / 2 }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

// Composites the full framed live preview (frame mockup + artwork in the opening +
// watermark + personalization) into a data URL for the cart line item.
async function composeFramedThumb(frameSrc: string, artSrc: string, line1: string, line2: string): Promise<string> {
  const SIZE = 1000
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return artSrc

  const frameImg = await loadImg(frameSrc)
  ctx.drawImage(frameImg, 0, 0, SIZE, SIZE)

  const wx = CANVAS_WINDOW.x * SIZE
  const wy = CANVAS_WINDOW.y * SIZE
  const ww = CANVAS_WINDOW.w * SIZE
  const wh = CANVAS_WINDOW.h * SIZE
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(wx, wy, ww, wh)

  try {
    const art = await loadImg(artSrc)
    ctx.save()
    ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip()
    drawCover(ctx, art, wx, wy, ww, wh)
    ctx.restore()
  } catch { /* leave the white canvas if the art fails to load */ }

  // Diagonal watermark over the opening
  ctx.save()
  ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip()
  ctx.translate(wx + ww / 2, wy + wh / 2)
  ctx.rotate((-32 * Math.PI) / 180)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `700 ${ww * 0.028}px Poppins, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let gy = -wh; gy <= wh; gy += wh * 0.22) {
    for (let gx = -ww; gx <= ww; gx += ww * 0.5) {
      ctx.fillText('© LIME & LOU PREVIEW', gx, gy)
    }
  }
  ctx.restore()

  // Personalization text over a white fade at the bottom of the opening
  if (line1 || line2) {
    const fadeH = wh * 0.24
    const grad = ctx.createLinearGradient(0, wy + wh - fadeH, 0, wy + wh)
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(0.55, 'rgba(255,255,255,0.95)')
    grad.addColorStop(1, '#ffffff')
    ctx.fillStyle = grad
    ctx.fillRect(wx, wy + wh - fadeH, ww, fadeH)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    let ty = wy + wh - ww * 0.06
    if (line2) {
      ctx.fillStyle = '#888888'
      ctx.font = `400 ${ww * 0.036}px Poppins, system-ui, sans-serif`
      ctx.fillText(line2, wx + ww / 2, ty)
      ty -= ww * 0.055
    }
    if (line1) {
      ctx.fillStyle = '#111111'
      ctx.font = `600 ${ww * 0.045}px Poppins, system-ui, sans-serif`
      ctx.fillText(line1.toUpperCase(), wx + ww / 2, ty)
    }
  }

  return canvas.toDataURL('image/jpeg', 0.9)
}

// ─── Component ─────────────────────────────────────────────────────────────────
export function AIPreviewCustomizer({ brand, product, icons, nestedItems = [], addItem, openCart }: AIPreviewCustomizerProps) {
  const { ChevronIcon, StarIcon, FileUploadIcon, XIcon } = icons
  const RevisionsGlyph = icons.RevisionsIcon ?? icons.ClipboardCopyIcon

  // Nested Items — companion products staged above the Subtotal.
  const nested = useNestedItems(brand, nestedItems)
  const PersonIcon = icons.PersonIcon
  const ShippingIcon = icons.ShippingIcon
  const MapPinIcon = icons.MapPinIcon

  const isMobile = useIsMobile()

  // ── State ──
  const [genState, setGenState] = useState<GenState>('idle')
  const [progress, setProgress] = useState(0)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoName, setPhotoName] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const [step, setStep] = useState<Step>(1)
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [frameColor, setFrameColor] = useState('black')
  const [sizeKey, setSizeKey] = useState('XS')

  const [panelOpen, setPanelOpen] = useState(false)
  const [galleryIdx, setGalleryIdx] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<File | null>(null)
  const rafRef = useRef<number | null>(null)
  const waitRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isReady = genState === 'ready'
  const isBusy = genState === 'generating' || genState === 'regenerating'
  const started = genState !== 'idle'   // generation has begun → reveal the two-step flow
  const unlocked = isReady

  const selectedSize = SIZES.find(s => s.key === sizeKey) ?? SIZES[0]
  const selectedFrame = FRAME_COLORS.find(f => f.key === frameColor) ?? FRAME_COLORS[0]
  const currentPrice = selectedSize.priceInCents

  const galleryImages = product.hoverImage ? [product.image, product.hoverImage] : [product.image]

  // ── Generation orchestration ──
  const clearTimers = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    if (waitRef.current != null) clearTimeout(waitRef.current)
    rafRef.current = null
    waitRef.current = null
  }
  useEffect(() => () => clearTimers(), [])

  const runGeneration = useCallback((file: File, mode: 'generating' | 'regenerating') => {
    clearTimers()
    setGenState(mode)
    setProgress(0)

    let result: string | null = null
    let failed = false
    generateWatercolorPreview(file)
      .then(r => { result = r.previewUrl })
      .catch(() => { failed = true })

    // Hold the loading animation for at least GEN_MS, then flip to ready.
    const start = Date.now()
    const finalize = () => {
      if (failed) { setGenState('error'); return }
      if (result == null) { waitRef.current = setTimeout(finalize, 120); return }
      setPreviewUrl(result)
      setGenState('ready')
      setStep(1)
    }
    const tick = () => {
      const pct = Math.min(100, ((Date.now() - start) / GEN_MS) * 100)
      setProgress(pct)
      if (pct < 100) rafRef.current = requestAnimationFrame(tick)
      else finalize()
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // ── Upload / personalize / change / regenerate / retry ──
  // Initial upload just stores the photo; "Personalize yours" kicks off generation
  // (mirrors Music Memories). "Change photo" restarts generation immediately.
  const acceptFile = useCallback(async (file: File | undefined | null, autoGenerate: boolean) => {
    if (!file) return
    setUploadError(false)
    const dataUrl = await fileToDataUrl(file).catch(() => null)
    if (!dataUrl) { setUploadError(true); return }
    fileRef.current = file
    setPhotoUrl(dataUrl)
    setPhotoName(file.name)
    setPreviewUrl(null)
    setStep(1)
    if (autoGenerate) {
      if (isMobile) setPanelOpen(true)
      runGeneration(file, 'generating')
    }
  }, [isMobile, runGeneration])

  // Once the flow has started, picking a new file is a "change photo" → regenerate
  // and reset the allowance; before starting it just stores the photo.
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0], started)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    acceptFile(e.dataTransfer.files?.[0], started)
  }

  const handleRemovePhoto = () => {
    clearTimers()
    fileRef.current = null
    setPhotoUrl(null)
    setPhotoName('')
    setPreviewUrl(null)
    setGenState('idle')
    setPanelOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePersonalize = () => {
    if (!fileRef.current || !photoUrl) { setUploadError(true); return }
    if (isMobile) setPanelOpen(true)
    runGeneration(fileRef.current, 'generating')
  }

  const handleRetry = () => {
    // Retry after an error — does NOT consume the regenerate allowance.
    if (!fileRef.current) return
    runGeneration(fileRef.current, 'generating')
  }

  // ── Add to bag ──
  const handleAddToBag = async () => {
    if (!isReady || !previewUrl) return
    const l1 = line1.trim()
    const l2 = line2.trim()
    const selectedOptions = [
      { label: 'Frame', value: selectedFrame.label },
      { label: 'Size', value: selectedSize.key },
      ...(l1 ? [{ label: 'First Line', value: l1 }] : []),
      ...(l2 ? [{ label: 'Second Line', value: l2 }] : []),
      ...(photoName ? [{ label: 'Photo', value: photoName }] : []),
    ]

    // Cart thumbnail = the full framed live preview (frame + artwork + text + watermark)
    let image = previewUrl
    try {
      image = await composeFramedThumb(FRAME_IMAGES[frameColor] ?? FRAME_IMAGES.black, previewUrl, l1, l2)
    } catch { /* fall back to the raw generated image */ }

    addItem({
      id: `ai-${product.id}-${frameColor}-${sizeKey}-${Date.now()}`,
      name: product.name,
      price: currentPrice,
      image,
      isPersonalized: l1.length > 0 || l2.length > 0,
      selectedOptions,
      canvasConfig: photoUrl
        ? { productId: product.id, photo: photoUrl, photoName, frameKey: frameColor, sizeKey, persOn: l1.length > 0 || l2.length > 0, line1: l1, line2: l2 }
        : undefined,
    })
    // Add any staged nested items alongside the main product.
    nested.stagedItems.forEach((it) => addItem(it))
    nested.clear()
    setPanelOpen(false)
    openCart(true)
  }

  const filledStars = Math.round(LAL_RATING)

  // Generating heading (rotates with progress); the bar animates continuously in CSS.
  const genHeading = (GEN_HEADINGS.find(h => progress < h.until) ?? GEN_HEADINGS[GEN_HEADINGS.length - 1]).text

  // Loading content overlaid centered on the blurred canvas (desktop + mobile).
  const loadingOverlay = (
    <div className={styles.genContent}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={lalLoader.src} alt="" className={styles.genLoaderImg} aria-hidden="true" />
      <h3 className={styles.genHeading}>{genHeading}</h3>
      <div className={styles.segBar} role="progressbar" aria-label="Generating your preview">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={styles.segTrack}>
            <div className={styles.segFill} />
          </div>
        ))}
      </div>
      <p className={styles.genNoteWhite}>Note: The final artwork may differ slightly from the AI-generated preview.</p>
    </div>
  )

  // ── Preview stage (frame mockup + artwork, or the idle gallery) ──
  // galleryOnly keeps the product gallery regardless of generation state — used by
  // the PDP stage column on mobile (AI generation there happens only in the panel).
  const renderPreviewStage = (galleryOnly = false) => {
    const showFrame = !galleryOnly && genState !== 'idle'
    const artSrc = isReady ? (previewUrl ?? photoUrl ?? '') : (photoUrl ?? '')

    return (
      <div className={styles.stageInner}>
        {/* Same thumbnails + main-cell footprint in every state so the canvas
            size stays constant from gallery → generating → ready. */}
        <div className={styles.gallery}>
          {galleryImages.length > 1 && (
            <div className={styles.galleryThumbs}>
              {galleryImages.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.galleryThumb} ${!showFrame && i === galleryIdx ? styles.galleryThumbActive : ''}`}
                  onClick={() => setGalleryIdx(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          <div className={styles.galleryMain}>
            {!showFrame ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={galleryImages[galleryIdx]} alt={product.name} className={styles.galleryImg} />
            ) : (
              <>
                {/* Blurred while generating — overlays below are siblings so they stay sharp */}
                <div className={`${styles.frameMock} ${isBusy ? styles.frameMockLoading : ''}`} style={{ backgroundImage: `url(${FRAME_IMAGES[frameColor] ?? FRAME_IMAGES.black})` }}>
                  <div
                    className={styles.window}
                    style={{
                      left:   `${CANVAS_WINDOW.x * 100}%`,
                      top:    `${CANVAS_WINDOW.y * 100}%`,
                      width:  `${CANVAS_WINDOW.w * 100}%`,
                      height: `${CANVAS_WINDOW.h * 100}%`,
                    }}
                  >
                    <div className={styles.artworkBox}>
                      {artSrc && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={artSrc} alt="Your preview" className={styles.artwork} />
                      )}
                      {isReady && (
                        <div className={styles.watermark} aria-hidden="true">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <span key={i} className={styles.watermarkText}>© LIME &amp; LOU PREVIEW</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {isReady && (line1 || line2) && (
                      <div className={styles.textOverlay}>
                        {line1 && <span className={styles.textLine1}>{line1}</span>}
                        {line2 && <span className={styles.textLine2}>{line2}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {isReady && <span className={styles.liveBadge}>Live Preview</span>}

                {/* Disclaimer overlaid at the bottom of the ready preview */}
                {isReady && (
                  <p className={styles.readyNote}>Note: The final artwork may differ slightly from the AI-generated preview.</p>
                )}

                {/* Generating overlay — blurred canvas + rising lime dots + centered content */}
                {isBusy && (
                  <>
                    <div className={styles.imageOverlay} aria-hidden="true" />
                    <div className={styles.floatDots} aria-hidden="true">
                      {FLOAT_DOTS.map((pos, i) => (
                        <span key={i} className={styles.floatDot} style={pos} />
                      ))}
                    </div>
                    {loadingOverlay}
                  </>
                )}

                {genState === 'error' && (
                  <div className={styles.genOverlay}>
                    <h3 className={styles.genHeading}>PREVIEW FAILED TO GENERATE</h3>
                    <p className={styles.genNote}>Something went wrong while creating your preview.</p>
                    <button type="button" className={styles.retryBtn} onClick={handleRetry}>Try again</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    )
  }

  // ── Stepper ──
  const renderStepper = () => (
    <div className={styles.stepper} role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={step === 1}
        disabled={!unlocked}
        className={`${styles.step} ${step === 1 ? styles.stepActive : ''}`}
        onClick={() => unlocked && setStep(1)}
      >
        <span className={styles.stepNum}>1</span>
        <span className={styles.stepTitle}>Personalize</span>
        <span className={styles.stepSub}>Photo &amp; text</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={step === 2}
        disabled={!unlocked}
        className={`${styles.step} ${step === 2 ? styles.stepActive : ''}`}
        onClick={() => unlocked && setStep(2)}
      >
        <span className={styles.stepNum}>2</span>
        <span className={styles.stepTitle}>Frame Options</span>
        <span className={styles.stepSub}>Color &amp; size</span>
      </button>
    </div>
  )

  // ── Upload box (Add photo) — used idle (top) and inside Step 1 ──
  const uploadBox = (
    <div className={styles.uploadStep}>
      <p className={styles.uploadLabel}>Add photo</p>
      <div
        className={`${styles.uploadCard} ${uploadError ? styles.uploadCardError : ''} ${dragOver ? styles.uploadCardDrag : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <button type="button" className={styles.uploadTrigger} onClick={() => fileInputRef.current?.click()}>
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className={styles.uploadThumb} />
          ) : (
            <span className={styles.uploadIcon} aria-hidden="true">{FileUploadIcon ? <FileUploadIcon size={24} /> : null}</span>
          )}
          <span className={styles.uploadCopy}>
            <span className={styles.uploadTitle}>Upload your photo</span>
            <span className={styles.uploadSub}>{photoUrl ? truncate(photoName) : 'Select 1 image from your device'}</span>
          </span>
        </button>
        {photoUrl && (
          <button type="button" className={styles.uploadRemove} aria-label="Remove photo" onClick={handleRemovePhoto}>
            {XIcon ? <XIcon size={18} /> : '×'}
          </button>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} className={styles.hiddenInput} onChange={handleFileInput} />
      {uploadError && <p className={styles.fieldError}>Sorry, we couldn&apos;t read that file. Please try another image.</p>}
    </div>
  )

  // ── Step fields ──
  // Step 1 keeps the uploaded image (with X to delete) + the disclaimer above the text.
  const step1Fields = (
    <div className={styles.stepPanel} role="tabpanel">
      {uploadBox}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="ai-line1">First Line</label>
        <input id="ai-line1" type="text" className={styles.input} autoComplete="off"
          placeholder="e.g. Claudia & Johnny" value={line1} onChange={e => setLine1(e.target.value)} />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="ai-line2">Second Line</label>
        <input id="ai-line2" type="text" className={styles.input} autoComplete="off"
          placeholder="e.g. Luckiest kids on earth right now" value={line2} onChange={e => setLine2(e.target.value)} />
      </div>
    </div>
  )

  const step2Fields = (
    <div className={styles.stepPanel} role="tabpanel">
      <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
        <ChevronIcon size={18} className={styles.backChevron} /> Back
      </button>
      <div className={styles.field}>
        <span className={styles.label}>Select frame color — <span className={styles.labelValue}>{selectedFrame.label}</span></span>
        <div className={styles.swatches} role="group" aria-label="Frame color">
          {FRAME_COLORS.map(f => (
            <button
              key={f.key}
              type="button"
              aria-label={f.label}
              aria-pressed={f.key === frameColor}
              className={`${styles.swatch} ${f.light ? styles.swatchLight : ''} ${f.key === frameColor ? styles.swatchSelected : ''}`}
              style={{ ['--swatch-color' as string]: f.color }}
              onClick={() => setFrameColor(f.key)}
            />
          ))}
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Choose size</span>
          <button type="button" className={styles.sizeGuideLink}>Size guide</button>
        </div>
        <div className={styles.sizeRow}>
          {SIZES.map(s => (
            <button
              key={s.key}
              type="button"
              aria-pressed={s.key === sizeKey}
              className={`${styles.sizePill} ${s.key === sizeKey ? styles.sizePillActive : ''}`}
              onClick={() => setSizeKey(s.key)}
            >{s.key}</button>
          ))}
        </div>
      </div>
    </div>
  )

  const subtotalRow = (
    <>
      {/* Nested Items — companion products, directly above the Subtotal */}
      {nested.ui}
      <div className={styles.subtotalRow}>
        <span className={styles.subtotalLabel}>Subtotal:</span>
        <span className={styles.subtotalPrice}>{formatPrice(currentPrice + nested.nestedTotal)}</span>
      </div>
    </>
  )

  const primaryCta = step === 1
    ? <button type="button" className={styles.ctaButton} disabled={!unlocked} onClick={() => setStep(2)}>Continue to frame options</button>
    : <button type="button" className={styles.ctaButton} disabled={!unlocked || !previewUrl} onClick={handleAddToBag}>Add to bag</button>

  // While generating: a disabled CTA with an inline spinner (no stepper shown).
  const loadingCta = (
    <button type="button" className={styles.ctaButton} disabled>
      <span className={styles.spinner} aria-hidden="true" /> Creating your preview…
    </button>
  )

  // Steps only exist once the preview is ready (stepper is hidden while generating).
  const stepsContent = (
    <>
      {renderStepper()}
      {step === 1 ? step1Fields : step2Fields}
    </>
  )

  // ── Header (title / price / rating / trust) ──
  const header = (
    <>
      <div className={`${pdp.productHeader} ${styles.aiHeader}`}>
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
              <span key={i} className={i <= filledStars ? pdp.starFilled : pdp.starEmpty}><StarIcon size={20} /></span>
            ))}
          </div>
          <span className={pdp.ratingValue}>{LAL_RATING}</span>
          <a href="#reviews" className={pdp.ratingCount}
            onClick={e => { e.preventDefault(); document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
          >{LAL_REVIEW_COUNT} Reviews</a>
        </div>

        {/* Shared Unlimited Revisions info card (same component as Watercolor Dream) */}
        <RevisionsNotice icon={RevisionsGlyph ? <RevisionsGlyph size={24} /> : null} />
      </div>
    </>
  )

  const trustBadges = (
    <ul className={styles.trustBadges} aria-label="Trust badges">
      {[
        { Icon: RevisionsGlyph, text: 'Free Unlimited Revisions' },
        { Icon: PersonIcon,     text: 'Made by real artists' },
        { Icon: ShippingIcon,   text: 'Free Shipping On All Orders' },
        { Icon: MapPinIcon,     text: 'American-Made' },
      ].map(({ Icon, text }) => (
        <li key={text} className={styles.trustItem}>
          <span className={styles.trustIcon} aria-hidden="true">{Icon ? <Icon size={22} /> : null}</span>
          <span className={styles.trustText}>{text}</span>
        </li>
      ))}
    </ul>
  )

  // ── Layout ──
  return (
    <section className={styles.wrap} aria-label="Product options">
      {/* Left: preview stage on desktop. On mobile it stays the product gallery —
          AI generation/preview happens in the slide-in panel instead. */}
      <div className={styles.stageCol}>
        {renderPreviewStage(isMobile)}
      </div>

      {/* Right: controls */}
      <div className={styles.controlsCol}>
        {header}
        {/* Add-photo box only in the idle state — hidden while generating; moves into Step 1 when ready */}
        {!started && uploadBox}

        {!isReady ? (
          /* Idle → "Personalize yours"; generating → disabled "Loading…" CTA (progress lives under the gallery). */
          isBusy
            ? loadingCta
            : <button type="button" className={styles.ctaButton} onClick={handlePersonalize}>See how it looks</button>
        ) : isMobile ? (
          /* Mobile: steps live in the slide-in panel; PDP shows a resume CTA */
          !panelOpen && (
            <Button variant="secondary" className={styles.resumeBtn} onClick={() => setPanelOpen(true)}>
              Continue personalizing
            </Button>
          )
        ) : (
          <div className={styles.desktopSteps}>
            {stepsContent}
            {step === 2 && subtotalRow}
            {primaryCta}
          </div>
        )}

        {/* USPs sit below the CTA */}
        {trustBadges}
      </div>

      {/* Mobile customizer panel — same layout throughout: preview on top, tabs,
          then the loader (generating) or the step fields + CTA (ready). */}
      {isMobile && (
        <CustomizerPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          ariaLabel="Personalize your canvas"
          closeIcon={XIcon ? <XIcon size={20} /> : undefined}
          dismissible={isReady}
          scrollResetKey={`${genState}-${step}`}
          preview={<div className={styles.panelPreview}>{renderPreviewStage()}</div>}
        >
          <div className={styles.panelSteps}>
            {renderStepper()}
            {isReady ? (
              <>
                {step === 1 ? step1Fields : step2Fields}
                {/* CTA flows inline after the last field (not a sticky footer) */}
                {step === 2 && subtotalRow}
                {primaryCta}
              </>
            ) : loadingCta}
          </div>
        </CustomizerPanel>
      )}
    </section>
  )
}
