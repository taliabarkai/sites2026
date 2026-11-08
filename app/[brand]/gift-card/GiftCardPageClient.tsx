'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { Button } from '../_components/Button'
import { FloatingCart } from '../_components/FloatingCart'
import { Checkbox } from '../_components/Checkbox'
import { SiteLogo } from '../_components/SiteLogo'
import { BRANDS, getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import {
  GIFT_CARD_AMOUNTS,
  GIFT_CARD_CUSTOM_MAX,
  GIFT_CARD_CUSTOM_MIN,
  GIFT_CARD_DESIGNS,
  GIFT_CARD_GALLERY_IMAGES,
  GIFT_CARD_MESSAGE_MAX,
} from '../_config/giftCardContent'
import type { GiftCardDesign } from '../_config/giftCardContent'
import { useCart } from '../_context/CartContext'
import type { SelectedOption } from '../_context/CartContext'
import styles from './GiftCardPage.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SendMethod = 'email' | 'link' | 'print'

// Email is always part of the order (the recipient is emailed the card), so
// its chip is locked on; the others are optional extras on top of it.
const SEND_METHODS: Array<{ id: SendMethod; label: string; locked?: boolean }> = [
  { id: 'email', label: 'Send by email', locked: true },
  { id: 'link',  label: 'Get a link' },
  { id: 'print', label: 'Print at home' },
]

/** The uploaded photo card's tilt, matching .photoCard's rotate() in the CSS. */
const PHOTO_CARD_TILT_DEG = 61
/** The card's width over its height, matching .photoCard's aspect-ratio. */
const CARD_RATIO = 1.586
const ZOOM_MIN = 1
const ZOOM_MAX = 3
const ZOOM_STEP = 0.25
const BACK_TEXT_MAX = 80

// ─── Photo framing ────────────────────────────────────────────────────────────
// The uploaded photo is drawn at its "cover" size (just big enough to fill the
// card), then moved, turned and zoomed with one transform. Sizes below are in
// card widths, so the same frame renders identically in the gallery and the tile.

interface PhotoFrame {
  /** Offset from centre, as a fraction of the card's width / height. */
  tx: number
  ty: number
  zoom: number
  /** Quarter turns: 0, 90, 180 or 270. */
  rot: number
}

const DEFAULT_FRAME: PhotoFrame = { tx: 0, ty: 0, zoom: 1, rot: 0 }
const CARD_W = 1
const CARD_H = 1 / CARD_RATIO

const clampTo = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** The photo's size when cropped to cover the card, in card widths. */
function coverSize(natural: { w: number; h: number }) {
  const scale = Math.max(CARD_W / natural.w, CARD_H / natural.h)
  return { w: natural.w * scale, h: natural.h * scale }
}

/** Total scale: the zoom, plus whatever a quarter turn needs to still fill the card. */
function frameScale(frame: PhotoFrame, cover: { w: number; h: number }) {
  const turned = frame.rot % 180 !== 0
  const fill = turned ? Math.max(1, CARD_W / cover.h, CARD_H / cover.w) : 1
  return frame.zoom * fill
}

/** Keeps the photo covering the card: offsets can't open a gap at any edge. */
function clampFrame(frame: PhotoFrame, cover: { w: number; h: number } | null): PhotoFrame {
  if (!cover) return frame
  const scale = frameScale(frame, cover)
  const turned = frame.rot % 180 !== 0
  const extentX = scale * (turned ? cover.h : cover.w)
  const extentY = scale * (turned ? cover.w : cover.h)
  const maxX = Math.max(0, (extentX - CARD_W) / 2) / CARD_W
  const maxY = Math.max(0, (extentY - CARD_H) / 2) / CARD_H
  return { ...frame, tx: clampTo(frame.tx, -maxX, maxX), ty: clampTo(frame.ty, -maxY, maxY) }
}

/** Inline style for the photo inside a card face; plain cover until it has loaded. */
function photoStyle(frame: PhotoFrame, cover: { w: number; h: number } | null): React.CSSProperties | undefined {
  if (!cover) return undefined
  // translate() percentages are of the image's own size, so convert from card fractions.
  const offsetX = (frame.tx * CARD_W / cover.w) * 100
  const offsetY = (frame.ty * CARD_H / cover.h) * 100
  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: `${(cover.w / CARD_W) * 100}%`,
    height: `${(cover.h / CARD_H) * 100}%`,
    maxWidth: 'none',
    objectFit: 'fill',
    transform: `translate(-50%, -50%) translate(${offsetX}%, ${offsetY}%) rotate(${frame.rot}deg) scale(${frameScale(frame, cover)})`,
  }
}

function formatPrice(cents: number): string {
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}

function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

// ─── Card face — the text placeholder for the gift card artwork ──────────────

interface CardFaceProps {
  design: GiftCardDesign | null
  /** An uploaded photo, standing in for a design. */
  image?: string
  brandLabel: string
  amount?: string
  recipientName?: string
  size: 'preview' | 'tile'
}

function CardFace({ design, image, brandLabel, amount, recipientName, size }: CardFaceProps) {
  const tone = image ? 'photo' : design?.tone ?? 'outline'
  const artwork = image

  return (
    <div
      className={joinClasses(
        styles.cardFace,
        size === 'preview' ? styles.cardFacePreview : styles.cardFaceTile,
        tone === 'solid' && styles.toneSolid,
        tone === 'tinted' && styles.toneTinted,
        tone === 'outline' && styles.toneOutline,
        tone === 'photo' && styles.tonePhoto,
      )}
    >
      {artwork && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artwork} alt="" className={styles.cardArtwork} />
      )}

      <span className={styles.cardBrand}>{brandLabel}</span>
      {!artwork && <span className={styles.cardMessage}>{design?.message}</span>}

      {size === 'preview' && (
        <span className={styles.cardFooter}>
          <span className={styles.cardRecipient}>
            {recipientName ? `For ${recipientName}` : 'Gift card'}
          </span>
          {amount && <span className={styles.cardAmount}>{amount}</span>}
        </span>
      )}
    </div>
  )
}

// ─── Text field with a visible label ──────────────────────────────────────────

interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email'
  placeholder?: string
  autoComplete?: string
  error?: string
  hint?: string
  /** Sets the label in the step-title style, so the question names the field. */
  titled?: boolean
}

function TextField({
  id, label, value, onChange, type = 'text', placeholder, autoComplete, error, hint, titled,
}: TextFieldProps) {
  const errorId = `${id}-error`
  const hintId  = `${id}-hint`
  const described = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className={titled ? styles.titledField : styles.fieldGroup}>
      <label htmlFor={id} className={titled ? styles.sectionTitle : styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        className={joinClasses(styles.input, error && styles.inputInvalid)}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={described || undefined}
      />
      {error && <p id={errorId} className={styles.error}>{error}</p>}
      {hint && <p id={hintId} className={styles.hint}>{hint}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GiftCardPageClient() {
  const pathname = usePathname()
  const router = useRouter()
  const { items, isOpen, subtotal, addItem, openCart, closeCart, removeItem } = useCart()
  const brand = getBrandFromPathname(pathname)
  const brandLabel = BRANDS.find((item) => item.key === brand)?.label ?? ''
  const icons = BRAND_ICONS[brand]
  const { FileUploadIcon, RotateIcon, XIcon, ZoomInIcon, ZoomOutIcon } = icons

  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:    withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref:   withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  const uid = useId()
  const fieldId = (name: string) => `${uid}-${name}`

  // ── Form state ────────────────────────────────────────────────────────────
  const [designId, setDesignId]         = useState<string>(GIFT_CARD_DESIGNS[0].id)
  const [upload, setUpload]             = useState<{ url: string; name: string } | null>(null)
  // How the uploaded photo is framed in its card, and its natural size once loaded.
  const [photoFrame, setPhotoFrame]     = useState<PhotoFrame>(DEFAULT_FRAME)
  const [photoNatural, setPhotoNatural] = useState<{ w: number; h: number } | null>(null)
  const [addBackText, setAddBackText]   = useState(false)
  const [backText, setBackText]         = useState('')
  const [showBack, setShowBack]         = useState(false)
  // An in-progress drag on the gallery photo: where the pointer and frame started.
  const photoDrag = useRef<{ startX: number; startY: number; startFrame: PhotoFrame } | null>(null)
  const [amountChoice, setAmountChoice] = useState<number | 'custom' | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [methods, setMethods]           = useState<SendMethod[]>(['email'])
  const [recipientName, setRecipientName]   = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage]           = useState('')
  const [errors, setErrors]             = useState<Record<string, string>>({})

  // Uploaded photos live as object URLs. Release the old one when it is replaced.
  useEffect(() => {
    return () => {
      if (upload) URL.revokeObjectURL(upload.url)
    }
  }, [upload])

  // ── Derived ───────────────────────────────────────────────────────────────
  const sendsByEmail      = methods.includes('email')
  const askRecipientEmail = sendsByEmail

  const design = useMemo(
    () => GIFT_CARD_DESIGNS.find((item) => item.id === designId) ?? null,
    [designId],
  )

  // Picker tiles: flat card art at card shape, else a square crop of the
  // gallery mockup. The upload slot takes whichever shape its neighbours have.
  const tileArt = (item: GiftCardDesign) =>
    item.tileImages?.[brand]
      ? { src: item.tileImages[brand]!, shape: 'card' as const }
      : item.galleryImages?.[brand]
        ? { src: item.galleryImages[brand]!, shape: 'square' as const }
        : null
  const firstArt = GIFT_CARD_DESIGNS.map(tileArt).find(Boolean) ?? null
  const hasArtwork = Boolean(firstArt)
  const squareTiles = firstArt?.shape === 'square'

  // The gallery follows the selection: an uploaded photo, the chosen design's
  // artwork, or the brand's default gallery image.
  const galleryImage =
    designId === 'custom' && upload
      ? { src: upload.url, alt: 'Your photo on the gift card', photo: true }
      : design?.galleryImages?.[brand]
        ? { src: design.galleryImages[brand]!, alt: `${design.message} gift card`, photo: false }
        : GIFT_CARD_GALLERY_IMAGES[brand]
          ? { ...GIFT_CARD_GALLERY_IMAGES[brand]!, photo: false }
          : null

  const amountCents = useMemo(() => {
    if (amountChoice === null) return 0
    if (amountChoice !== 'custom') return amountChoice
    const dollars = Number(customAmount)
    return Number.isFinite(dollars) && dollars > 0 ? Math.round(dollars * 100) : 0
  }, [amountChoice, customAmount])

  function clearError(name: string) {
    setErrors((prev) => {
      if (!(name in prev)) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUpload({ url: URL.createObjectURL(file), name: file.name })
    setPhotoFrame(DEFAULT_FRAME)
    setPhotoNatural(null)
    setDesignId('custom')
    // Reset so choosing the same file again still fires a change.
    event.target.value = ''
  }

  function removeUpload() {
    setUpload(null)
    setAddBackText(false)
    setBackText('')
    setShowBack(false)
    setDesignId(GIFT_CARD_DESIGNS[0].id)
  }

  const hasBackText = addBackText && backText.trim().length > 0
  const photoCover = photoNatural ? coverSize(photoNatural) : null
  const framedPhotoStyle = photoStyle(photoFrame, photoCover)

  function notePhotoSize(event: React.SyntheticEvent<HTMLImageElement>) {
    const img = event.currentTarget
    if (img.naturalWidth) setPhotoNatural({ w: img.naturalWidth, h: img.naturalHeight })
  }

  function updateFrame(change: (prev: PhotoFrame) => PhotoFrame) {
    setPhotoFrame((prev) => clampFrame(change(prev), photoCover))
  }

  const zoomPhoto = (step: number) =>
    updateFrame((prev) => ({ ...prev, zoom: clampTo(prev.zoom + step, ZOOM_MIN, ZOOM_MAX) }))

  const rotatePhoto = () => updateFrame((prev) => ({ ...prev, rot: (prev.rot + 90) % 360 }))

  // Dragging the photo: the picture follows the pointer exactly. The card is
  // tilted, so the pointer's screen movement is turned into the card's own axes.
  function startPhotoDrag(event: React.PointerEvent<HTMLSpanElement>) {
    photoDrag.current = { startX: event.clientX, startY: event.clientY, startFrame: photoFrame }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function movePhotoDrag(event: React.PointerEvent<HTMLSpanElement>) {
    const drag = photoDrag.current
    if (!drag) return
    const face = event.currentTarget
    const screenX = event.clientX - drag.startX
    const screenY = event.clientY - drag.startY
    const angle = (PHOTO_CARD_TILT_DEG * Math.PI) / 180
    const localX = Math.cos(angle) * screenX - Math.sin(angle) * screenY
    const localY = Math.sin(angle) * screenX + Math.cos(angle) * screenY
    setPhotoFrame(clampFrame({
      ...drag.startFrame,
      tx: drag.startFrame.tx + localX / face.offsetWidth,
      ty: drag.startFrame.ty + localY / face.offsetHeight,
    }, photoCover))
  }

  function endPhotoDrag(event: React.PointerEvent<HTMLSpanElement>) {
    photoDrag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function toggleMethod(id: SendMethod, on: boolean) {
    if (SEND_METHODS.find((option) => option.id === id)?.locked) return
    setMethods((prev) => (on ? [...prev, id] : prev.filter((item) => item !== id)))
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {}

    if (amountChoice === null) {
      next.amount = 'Choose an amount.'
    } else if (amountChoice === 'custom') {
      const dollars = Number(customAmount)
      if (!customAmount.trim() || !Number.isFinite(dollars)) {
        next.customAmount = 'Enter an amount.'
      } else if (dollars < GIFT_CARD_CUSTOM_MIN || dollars > GIFT_CARD_CUSTOM_MAX) {
        next.customAmount = `Choose an amount between $${GIFT_CARD_CUSTOM_MIN} and $${GIFT_CARD_CUSTOM_MAX}.`
      } else if (!Number.isInteger(dollars)) {
        next.customAmount = 'Use whole dollars.'
      }
    }

    if (!recipientName.trim()) next.recipientName = "Enter the recipient's name."
    if (askRecipientEmail) {
      if (!recipientEmail.trim()) next.recipientEmail = "Enter the recipient's email."
      else if (!EMAIL_PATTERN.test(recipientEmail.trim())) next.recipientEmail = 'Enter a valid email, e.g. name@example.com.'
    }

    return next
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const found = validate()
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      const target = document.getElementById(fieldId(firstInvalid))
      const control = target?.matches('input, textarea') ? target : target?.querySelector('input')
      control?.focus()
      return
    }

    const usingUpload = designId === 'custom' && upload
    const designName = usingUpload ? 'Your photo' : design?.message ?? 'Gift card'
    const options: SelectedOption[] = [
      { label: 'Design', value: designName },
      { label: 'Delivery', value: SEND_METHODS.filter((m) => methods.includes(m.id)).map((m) => m.label).join(', ') },
      { label: 'To', value: recipientName.trim() },
      ...(askRecipientEmail ? [{ label: 'Email', value: recipientEmail.trim() }] : []),
      ...(message.trim() ? [{ label: 'Message', value: message.trim() }] : []),
      ...(usingUpload && addBackText && backText.trim() ? [{ label: 'Back of card', value: backText.trim() }] : []),
    ]

    addItem({
      id: `gift-card-${Date.now()}`,
      name: `${designName} Digital Gift Card`,
      price: amountCents,
      // The cart outlives the page, and an uploaded photo's object URL does not,
      // so a photo card shows the brand's default gallery image in the bag.
      image:
        (!usingUpload && design?.galleryImages?.[brand]) ||
        GIFT_CARD_GALLERY_IMAGES[brand]?.src ||
        '',
      isPersonalized: false,
      selectedOptions: options,
    })
    openCart(true)
  }

  const recipientPreviewName = recipientName.trim()

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content" className={styles.main}>
        <div className={styles.layout}>
          {/* ── Title — above the gallery on mobile, atop the form on desktop ─ */}
          <div className={styles.titleColumn}>
            <h1 id="gift-card-form-title" className={styles.formTitle}>Create Your Digital Gift Card</h1>
          </div>

          {/* ── Gallery — sticky on desktop ────────────────────────────────── */}
          {galleryImage ? (
            <div className={joinClasses(styles.previewColumn, styles.galleryColumn)}>
              <div className={styles.gallerySticky}>
                {galleryImage.photo ? (
                  // An uploaded photo, cropped to fill a landscape card. The card
                  // has a back (the optional text) and flips to show it while the
                  // text field has focus.
                  <div className={styles.photoStage}>
                    <span className={joinClasses(styles.photoCard, styles.photoCard3d)}>
                      <span className={joinClasses(styles.cardFlip, showBack && styles.cardFlipped)}>
                        <span
                          className={styles.cardSideFront}
                          onPointerDown={startPhotoDrag}
                          onPointerMove={movePhotoDrag}
                          onPointerUp={endPhotoDrag}
                          onPointerCancel={endPhotoDrag}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={galleryImage.src}
                            alt={galleryImage.alt}
                            draggable={false}
                            className={styles.photoCardImage}
                            style={framedPhotoStyle}
                            onLoad={notePhotoSize}
                          />
                        </span>
                        <span
                          className={joinClasses(styles.cardSideBack, hasBackText && styles.cardSideBackWithText)}
                          aria-hidden={!showBack}
                        >
                          {/* Logo alone: centred. With text: the text takes the centre
                              and the logo drops to the bottom edge, a quarter smaller. */}
                          {hasBackText && <span className={styles.cardBackText}>{backText}</span>}
                          <SiteLogo brand={brand} className={styles.cardBackLogo} />
                        </span>
                      </span>
                    </span>

                    {/* Photo tools, bottom-left: zoom and turn. Moving is by drag. */}
                    {!showBack && (
                      <div className={styles.photoTools} role="group" aria-label="Adjust your photo">
                        <button
                          type="button"
                          className={styles.photoTool}
                          onClick={() => zoomPhoto(ZOOM_STEP)}
                          disabled={photoFrame.zoom >= ZOOM_MAX}
                          aria-label="Zoom in"
                        >
                          <ZoomInIcon size={24} />
                        </button>
                        <button
                          type="button"
                          className={styles.photoTool}
                          onClick={() => zoomPhoto(-ZOOM_STEP)}
                          disabled={photoFrame.zoom <= ZOOM_MIN}
                          aria-label="Zoom out"
                        >
                          <ZoomOutIcon size={24} />
                        </button>
                        <button
                          type="button"
                          className={styles.photoTool}
                          onClick={rotatePhoto}
                          aria-label="Rotate photo"
                        >
                          <RotateIcon size={24} />
                        </button>
                      </div>
                    )}

                    {/* Front | Back, bottom-right. Also mirrors the flip that happens
                        on its own while the back text is being typed. */}
                    <div className={styles.sideToggle} role="group" aria-label="Card side">
                      {([
                        { label: 'Front', back: false },
                        { label: 'Back',  back: true },
                      ] as const).map((side) => (
                        <button
                          key={side.label}
                          type="button"
                          className={joinClasses(styles.sideToggleButton, showBack === side.back && styles.sideToggleActive)}
                          aria-pressed={showBack === side.back}
                          onClick={() => setShowBack(side.back)}
                        >
                          {side.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={galleryImage.src} alt={galleryImage.alt} className={styles.galleryImage} />
                )}
              </div>
            </div>
          ) : (
            <div className={styles.previewColumn}>
              <div className={styles.previewSticky}>
                <p className={styles.srOnly} aria-live="polite">
                  {`Preview: ${upload ? 'your photo' : design?.message ?? ''} card${amountCents ? `, ${formatPrice(amountCents)}` : ''}`}
                </p>
                <div aria-hidden="true" className={styles.previewCard}>
                  <CardFace
                    design={design}
                    image={upload?.url}
                    brandLabel={brandLabel}
                    amount={amountCents ? formatPrice(amountCents) : undefined}
                    recipientName={recipientPreviewName}
                    size="preview"
                  />
                </div>
                <p className={styles.previewCaption}>Card artwork coming soon. The preview shows the design name.</p>
              </div>
            </div>
          )}

          {/* ── Form panel ─────────────────────────────────────────────────── */}
          <div className={styles.formColumn}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate aria-labelledby="gift-card-form-title">
              {/* Design */}
              {/* Groups, not fieldsets: iOS Safari won't lay a legend out as a flex
                  item, so a fieldset step loses the spacing every other step has. */}
              <div className={styles.section} role="radiogroup" aria-labelledby={fieldId('design-title')}>
                <p id={fieldId('design-title')} className={styles.sectionTitle}>Pick a Card</p>
                <div className={joinClasses(styles.designRow, squareTiles && styles.designRowSquare)}>
                  {GIFT_CARD_DESIGNS.map((item) => (
                    <label key={item.id} className={styles.designOption}>
                      <input
                        type="radio"
                        name="design"
                        value={item.id}
                        className={styles.visuallyHiddenInput}
                        checked={designId === item.id}
                        onChange={() => setDesignId(item.id)}
                      />
                      {tileArt(item) ? (
                        <span
                          className={joinClasses(
                            styles.designTile,
                            styles.designTilePhoto,
                            tileArt(item)!.shape === 'square' && styles.designTileSquare,
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={tileArt(item)!.src} alt="" className={styles.designTileImage} />
                        </span>
                      ) : (
                        <span className={styles.designTile}>
                          <CardFace design={item} brandLabel={brandLabel} size="tile" />
                        </span>
                      )}
                      <span className={styles.srOnly}>{item.message}</span>
                    </label>
                  ))}
                  {/* Sixth slot: upload a photo. Once there, it is a design like the rest. */}
                  {upload ? (
                    // The uploaded photo: a design like the rest, plus a remove
                    // button on the tile and a Replace link under it.
                    <div className={styles.designOption}>
                      <label className={styles.designOptionLabel}>
                        <input
                          type="radio"
                          name="design"
                          value="custom"
                          className={styles.visuallyHiddenInput}
                          checked={designId === 'custom'}
                          onChange={() => setDesignId('custom')}
                        />
                        {hasArtwork ? (
                          <span
                            className={joinClasses(
                              styles.designTile,
                              styles.designTilePhoto,
                              squareTiles && styles.designTileSquare,
                            )}
                          >
                            <span className={styles.photoStage}>
                              <span className={styles.photoCard}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={upload.url}
                                  alt=""
                                  className={styles.photoCardImage}
                                  style={framedPhotoStyle}
                                  onLoad={notePhotoSize}
                                />
                              </span>
                            </span>
                          </span>
                        ) : (
                          <span className={styles.designTile}>
                            <CardFace design={null} image={upload.url} brandLabel={brandLabel} size="tile" />
                          </span>
                        )}
                        <span className={styles.srOnly}>Your photo</span>
                      </label>
                      <button
                        type="button"
                        className={styles.removePhoto}
                        onClick={removeUpload}
                        aria-label="Remove your photo"
                      >
                        <XIcon size={16} />
                      </button>
                      <label className={styles.replaceLink}>
                        <input
                          type="file"
                          accept="image/*"
                          className={styles.visuallyHiddenInput}
                          onChange={handleUpload}
                        />
                        Replace
                      </label>
                    </div>
                  ) : (
                    <label className={styles.designOption}>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.visuallyHiddenInput}
                        onChange={handleUpload}
                      />
                      <span className={styles.designTile}>
                        <span className={styles.uploadTile}>
                          <FileUploadIcon size={24} />
                          <span>Upload your own</span>
                        </span>
                      </span>
                    </label>
                  )}
                </div>

                {/* Text for the back of a photo card. */}
                {upload && designId === 'custom' && (
                  <div className={styles.backTextGroup}>
                    <Checkbox
                      checked={addBackText}
                      onChange={(on) => {
                        setAddBackText(on)
                        if (!on) setShowBack(false)
                      }}
                      icons={icons}
                    >
                      Add text
                    </Checkbox>
                    {addBackText && (
                      <div className={styles.textareaWrap}>
                        <label htmlFor={fieldId('backText')} className={styles.srOnly}>
                          Text for the back of the card
                        </label>
                        <textarea
                          id={fieldId('backText')}
                          className={styles.textarea}
                          rows={2}
                          maxLength={BACK_TEXT_MAX}
                          value={backText}
                          placeholder="Text for the back of the card"
                          onFocus={() => setShowBack(true)}
                          onBlur={() => setShowBack(false)}
                          onChange={(event) => {
                            setBackText(event.target.value)
                            setShowBack(true)
                          }}
                          aria-describedby={`${fieldId('backText')}-count`}
                        />
                        <span id={`${fieldId('backText')}-count`} className={styles.counterInside}>
                          {backText.length} / {BACK_TEXT_MAX}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div
                className={styles.section}
                role="group"
                aria-labelledby={fieldId('amount-title')}
                aria-describedby={errors.amount ? `${fieldId('amount')}-error` : undefined}
              >
                <p id={fieldId('amount-title')} className={styles.sectionTitle}>Choose an Amount</p>
                {/* Mobile: chips slide sideways, the custom field drops below them.
                    Tablet up: the grid dissolves into this row (display: contents),
                    so the field sits after Custom and wraps only when out of room. */}
                <div className={styles.amountRow}>
                  <div className={styles.amountGrid}>
                    {GIFT_CARD_AMOUNTS.map((cents, index) => (
                      <label key={cents} className={styles.amountOption}>
                        <input
                          // The first option takes focus when no amount is chosen.
                          id={index === 0 ? fieldId('amount') : undefined}
                          type="radio"
                          name="amount"
                          value={cents}
                          className={styles.visuallyHiddenInput}
                          checked={amountChoice === cents}
                          onChange={() => {
                            setAmountChoice(cents)
                            clearError('amount')
                            clearError('customAmount')
                          }}
                        />
                        <span className={styles.amountTile}>{formatPrice(cents)}</span>
                      </label>
                    ))}
                    <label className={styles.amountOption}>
                      <input
                        type="radio"
                        name="amount"
                        value="custom"
                        className={styles.visuallyHiddenInput}
                        checked={amountChoice === 'custom'}
                        onChange={() => {
                          setAmountChoice('custom')
                          clearError('amount')
                          requestAnimationFrame(() => document.getElementById(fieldId('customAmount'))?.focus())
                        }}
                      />
                      <span className={styles.amountTile}>Custom</span>
                    </label>
                  </div>
                  {/* Sized for four digits. */}
                  {amountChoice === 'custom' && (
                    <div className={joinClasses(styles.prefixControl, styles.customAmount, errors.customAmount && styles.inputInvalid)}>
                      <label htmlFor={fieldId('customAmount')} className={styles.srOnly}>
                        Custom amount in dollars
                      </label>
                      <span className={styles.prefix} aria-hidden="true">$</span>
                      <input
                        id={fieldId('customAmount')}
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        data-focus-ring="none"
                        className={styles.prefixInput}
                        value={customAmount}
                        placeholder="Amount"
                        onChange={(event) => {
                          setCustomAmount(event.target.value.replace(/\D/g, ''))
                          clearError('customAmount')
                        }}
                        aria-invalid={errors.customAmount ? true : undefined}
                        aria-describedby={errors.customAmount ? `${fieldId('customAmount')}-error` : undefined}
                      />
                    </div>
                  )}
                </div>
                {errors.amount && (
                  <p id={`${fieldId('amount')}-error`} className={styles.error}>{errors.amount}</p>
                )}

                {errors.customAmount && (
                  <p id={`${fieldId('customAmount')}-error`} className={styles.error}>{errors.customAmount}</p>
                )}
              </div>

              {/* Send method — pick any combination */}
              <div
                id={fieldId('method')}
                className={styles.section}
                role="group"
                aria-labelledby={fieldId('method-title')}
              >
                {/* The hint rides in the title, so it is read with the question and
                    wraps under it only when the line runs out. */}
                <p id={fieldId('method-title')} className={styles.sectionTitle}>
                  How Would You Like to Send It?{' '}
                  <span className={styles.titleHint}>(select all that apply)</span>
                </p>
                {/* Chips like the amounts, but checkboxes: any combination is allowed. */}
                <div className={styles.methodGrid}>
                  {SEND_METHODS.map((option) => (
                    <label key={option.id} className={styles.amountOption}>
                      <input
                        type="checkbox"
                        name="method"
                        value={option.id}
                        className={styles.visuallyHiddenInput}
                        checked={methods.includes(option.id)}
                        // Stays focusable and announced as checked, just not changeable.
                        aria-disabled={option.locked || undefined}
                        onChange={(event) => toggleMethod(option.id, event.target.checked)}
                      />
                      <span className={styles.amountTile}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recipient */}
              <div className={styles.section}>
                <TextField
                  id={fieldId('recipientName')}
                  label="Who's This For?"
                  titled
                  value={recipientName}
                  autoComplete="off"
                  onChange={(value) => {
                    setRecipientName(value)
                    clearError('recipientName')
                  }}
                  error={errors.recipientName}
                />
              </div>

              {askRecipientEmail && (
                <div className={styles.section}>
                  <TextField
                    id={fieldId('recipientEmail')}
                    label="What's Their Email?"
                    titled
                    type="email"
                    value={recipientEmail}
                    placeholder="e.g. name@example.com"
                    autoComplete="off"
                    onChange={(value) => {
                      setRecipientEmail(value)
                      clearError('recipientEmail')
                    }}
                    error={errors.recipientEmail}
                    hint="Use your own email if you don't have theirs. You can pass the gift on later."
                  />
                </div>
              )}

              {/* Message (optional) */}
              <div className={styles.section}>
                <div className={styles.titledField}>
                  <label htmlFor={fieldId('message')} className={styles.sectionTitle}>Your Message</label>
                  {/* The count sits inside the box, bottom right. */}
                  <div className={styles.textareaWrap}>
                    <textarea
                      id={fieldId('message')}
                      className={styles.textarea}
                      rows={4}
                      maxLength={GIFT_CARD_MESSAGE_MAX}
                      value={message}
                      placeholder="Happy birthday! Treat yourself to something you love."
                      onChange={(event) => setMessage(event.target.value)}
                      aria-describedby={`${fieldId('message')}-count`}
                    />
                    <span id={`${fieldId('message')}-count`} className={styles.counterInside}>
                      {message.length} / {GIFT_CARD_MESSAGE_MAX}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <Button type="submit" variant="primary" className={styles.actionButton}>
                  Add to bag
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer columns={footerColumns} />
      <FloatingCart
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        subtotal={subtotal}
        onRemoveItem={removeItem}
        onEditItem={() => {}}
        onContinueToCheckout={() => router.push(`/${brand}/checkout`)}
        onGenerateGiftNote={async () => 'Wishing you a wonderful day filled with joy!'}
      />
    </div>
  )
}
