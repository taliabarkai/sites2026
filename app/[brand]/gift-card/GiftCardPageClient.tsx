'use client'

import { useEffect, useId, useMemo, useState } from 'react'
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
  const { FileUploadIcon } = BRAND_ICONS[brand]

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
      ? { src: upload.url, alt: 'Your photo for the gift card', contain: true }
      : design?.galleryImages?.[brand]
        ? { src: design.galleryImages[brand]!, alt: `${design.message} gift card`, contain: false }
        : GIFT_CARD_GALLERY_IMAGES[brand]
          ? { ...GIFT_CARD_GALLERY_IMAGES[brand]!, contain: false }
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
    setDesignId('custom')
    // Reset so choosing the same file again still fires a change.
    event.target.value = ''
  }

  function removeUpload() {
    setUpload(null)
    setDesignId(GIFT_CARD_DESIGNS[0].id)
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
          {/* ── Gallery — sticky on desktop ────────────────────────────────── */}
          {galleryImage ? (
            <div className={joinClasses(styles.previewColumn, styles.galleryColumn)}>
              <div className={styles.gallerySticky}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={galleryImage.src}
                  alt={galleryImage.alt}
                  className={joinClasses(styles.galleryImage, galleryImage.contain && styles.galleryImageContain)}
                />
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
              <header className={styles.formHeader}>
                <h1 id="gift-card-form-title" className={styles.formTitle}>Create Your Digital Gift Card</h1>
              </header>

              {/* Design */}
              <fieldset className={styles.section}>
                <legend className={styles.sectionTitle}>Pick a Card</legend>
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
                    <label className={styles.designOption}>
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={upload.url} alt="" className={styles.designTileImage} />
                        </span>
                      ) : (
                        <span className={styles.designTile}>
                          <CardFace design={null} image={upload.url} brandLabel={brandLabel} size="tile" />
                        </span>
                      )}
                      <span className={styles.srOnly}>Your photo</span>
                    </label>
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

                {upload && (
                  <div className={styles.uploadRow}>
                    <label className={styles.uploadButton}>
                      <input
                        type="file"
                        accept="image/*"
                        className={styles.visuallyHiddenInput}
                        onChange={handleUpload}
                      />
                      <FileUploadIcon size={20} />
                      <span>Replace image</span>
                    </label>
                    <button type="button" className={styles.textLink} onClick={removeUpload}>
                      Remove
                    </button>
                  </div>
                )}
              </fieldset>

              {/* Amount */}
              <fieldset
                className={styles.section}
                aria-describedby={errors.amount ? `${fieldId('amount')}-error` : undefined}
              >
                <legend className={styles.sectionTitle}>Choose an Amount</legend>
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
                    <span className={styles.amountTile}>Custom amount</span>
                  </label>
                </div>
                {errors.amount && (
                  <p id={`${fieldId('amount')}-error`} className={styles.error}>{errors.amount}</p>
                )}

                {amountChoice === 'custom' && (
                  <div className={styles.fieldGroup}>
                    <label htmlFor={fieldId('customAmount')} className={styles.label}>
                      Amount (${GIFT_CARD_CUSTOM_MIN}–${GIFT_CARD_CUSTOM_MAX})
                    </label>
                    <div className={joinClasses(styles.prefixControl, errors.customAmount && styles.inputInvalid)}>
                      <span className={styles.prefix} aria-hidden="true">$</span>
                      <input
                        id={fieldId('customAmount')}
                        type="text"
                        inputMode="numeric"
                        data-focus-ring="none"
                        className={styles.prefixInput}
                        value={customAmount}
                        placeholder="e.g. 200"
                        onChange={(event) => {
                          setCustomAmount(event.target.value.replace(/[^\d.]/g, ''))
                          clearError('customAmount')
                        }}
                        aria-invalid={errors.customAmount ? true : undefined}
                        aria-describedby={errors.customAmount ? `${fieldId('customAmount')}-error` : undefined}
                      />
                    </div>
                    {errors.customAmount && (
                      <p id={`${fieldId('customAmount')}-error`} className={styles.error}>{errors.customAmount}</p>
                    )}
                  </div>
                )}
              </fieldset>

              {/* Send method — pick any combination */}
              <fieldset
                id={fieldId('method')}
                className={styles.section}
                aria-describedby={`${fieldId('method')}-hint`}
              >
                <legend className={styles.sectionTitle}>How Would You Like to Send It?</legend>
                <p id={`${fieldId('method')}-hint`} className={styles.stepHint}>Select all that apply</p>
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
              </fieldset>

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
