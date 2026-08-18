'use client'

import { useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { Button } from '../_components/Button'
import { getBrandFromPathname } from '../_config/brands'
import type { BrandKey } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './customer-feedback.module.css'

// Brand-scoped icons — resolved at runtime per the icon rules (never hardcode a brand).
const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

/** Experience rows in step 2. */
const EXPERIENCE_ROWS = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'service', label: 'Customer Service' },
] as const

/** Recommendation scale in step 3. */
const SCORES = [0, 1, 2, 3, 4, 5] as const

// ─── Star rating input ────────────────────────────────────────────────────────

interface StarInputProps {
  /** Current rating, 0 = not yet rated. */
  value: number
  onChange: (value: number) => void
  /** Labels the group for assistive tech — points at the visible label. */
  labelledBy: string
  StarIcon: React.ComponentType<{ size?: number }>
}

/**
 * Five clickable stars behaving like a radiogroup: click or arrow-key to rate.
 * Hovering previews the rating so the whole row reads as one control.
 */
function StarInput({ value, onChange, labelledBy, StarIcon }: StarInputProps) {
  const [hovered, setHovered] = useState(0)
  const refs = useRef<Array<HTMLButtonElement | null>>([])
  const shown = hovered || value

  // The chosen star is the single tab stop, or the first one while unrated.
  const activeIndex = Math.max(0, value - 1)

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, star: number) {
    let next: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = star === 5 ? 1 : star + 1
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = star === 1 ? 5 : star - 1
    else if (event.key === 'Home') next = 1
    else if (event.key === 'End') next = 5

    if (next === null) return
    event.preventDefault()
    onChange(next)
    refs.current[next - 1]?.focus()
  }

  return (
    <div
      className={styles.stars}
      role="radiogroup"
      aria-labelledby={labelledBy}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          ref={(node) => { refs.current[star - 1] = node }}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
          tabIndex={star - 1 === activeIndex ? 0 : -1}
          className={`${styles.star} ${star <= shown ? styles.starOn : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onKeyDown={(event) => handleKeyDown(event, star)}
        >
          <StarIcon size={24} />
        </button>
      ))}
    </div>
  )
}

// ─── Yes / No segmented control ───────────────────────────────────────────────

interface YesNoProps {
  value: 'yes' | 'no' | null
  onChange: (value: 'yes' | 'no') => void
  labelledBy: string
}

function YesNo({ value, onChange, labelledBy }: YesNoProps) {
  return (
    <div className={styles.yesNo} role="radiogroup" aria-labelledby={labelledBy}>
      {(['yes', 'no'] as const).map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          tabIndex={value === option || (value === null && option === 'yes') ? 0 : -1}
          className={`${styles.choice} ${styles.yesNoBtn} ${value === option ? styles.choiceSelected : ''}`}
          onClick={() => onChange(option)}
        >
          {option === 'yes' ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/** A photo the shopper attached — `url` is an object URL for the preview. */
interface UploadedPhoto {
  name: string
  url: string
}

/** Per-product answers in step 1. */
interface ProductFeedback {
  rating: number
  recommend: 'yes' | 'no' | null
  review: string
  photos: UploadedPhoto[]
}

const EMPTY_FEEDBACK: ProductFeedback = { rating: 0, recommend: null, review: '', photos: [] }

const REVIEW_PLACEHOLDER = 'What did you love? What could be better?'
const COMMENTS_PLACEHOLDER = 'Anything else you would like us to know?'

/**
 * Thank-you reward shown on the success screen — percent off the next order,
 * per brand. IB and MNN have no figure of their own yet, so they use OAL's 20%.
 */
const DISCOUNT_PERCENT: Record<BrandKey, number> = {
  oal: 20,
  tgr: 25,
  lal: 30,
  ib:  20,
  mnn: 20,
}

export default function CustomerFeedbackPage() {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const { StarIcon, FileUploadIcon, XIcon, CheckmarkIcon, ClipboardCopyIcon } = BRAND_ICONS[brand]

  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:    withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref:   withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  // Stand-in for a real order: OAL shows a single-item order, the other brands
  // show a two-item one (which puts a divider between the two products).
  const products = getBrandProducts(brand).slice(0, brand === 'oal' ? 1 : 2)

  // Reward copy, all derived from the brand's percentage
  const discountPercent = DISCOUNT_PERCENT[brand]
  const discountAmount = `${discountPercent}% Off`
  const discountCode = `THANKU${discountPercent}`

  const [productFeedback, setProductFeedback] = useState<Record<number, ProductFeedback>>({})
  const [experience, setExperience] = useState<Record<string, number>>({})
  const [comments, setComments] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const feedbackFor = (id: number): ProductFeedback => productFeedback[id] ?? EMPTY_FEEDBACK

  const updateProduct = (id: number, patch: Partial<ProductFeedback>) =>
    setProductFeedback((prev) => ({ ...prev, [id]: { ...feedbackFor(id), ...patch } }))

  // Attach the picked files as previews. Object URLs are revoked when the
  // shopper removes a photo, so nothing is left dangling for the ones dropped.
  function addPhotos(id: number, files: FileList | null) {
    if (!files || files.length === 0) return
    const picked = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))
    updateProduct(id, { photos: [...feedbackFor(id).photos, ...picked] })
  }

  function removePhoto(id: number, url: string) {
    URL.revokeObjectURL(url)
    updateProduct(id, { photos: feedbackFor(id).photos.filter((photo) => photo.url !== url) })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = {
      brand,
      products: products.map((product) => {
        const { photos, ...answers } = feedbackFor(product.id)
        return { id: product.id, ...answers, photos: photos.map((photo) => photo.name) }
      }),
      experience,
      comments,
      score,
    }
    // TODO: no feedback endpoint exists in this project yet — POST the payload
    // once one is available (e.g. `await fetch('/api/feedback', { method: 'POST', … })`).
    console.log('[customer-feedback] submit', payload)
    setSubmitted(true)
    // The success screen replaces the form in place, so bring it into view.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(discountCode)
      setCopied(true)
    } catch {
      // Clipboard blocked (permissions, or a non-secure context) — the code is
      // still on screen for the shopper to copy by hand.
      setCopied(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content" className={styles.main}>
        <div className={styles.container}>
          {submitted ? (
            /* ── Success screen — replaces the form once submitted ────────── */
            <section className={styles.card} aria-labelledby="cf-success-heading">
              <div className={styles.success}>
                <span className={styles.successCheck} aria-hidden="true">
                  <CheckmarkIcon size={24} />
                </span>
                <h2 id="cf-success-heading" className={styles.successTitle}>
                  Thanks for your feedback
                </h2>
              </div>

              <div className={styles.successBody}>
                <p className={styles.successIntro}>
                  Your review helps other jewelry lovers shop with confidence, and we’ve
                  sent your {discountPercent}% off code to your inbox too.
                </p>

                <div className={styles.offer}>
                  <p className={styles.offerAmount}>{discountAmount}</p>
                  <p className={styles.offerLabel}>Your next order</p>
                </div>

                <div className={styles.codeGroup}>
                  <button type="button" className={styles.code} onClick={copyCode}>
                    <span className={styles.codeValue}>{discountCode}</span>
                    <span className={styles.codeIcon} aria-hidden="true">
                      <ClipboardCopyIcon size={20} />
                    </span>
                    <span className={styles.srOnly}>Copy discount code</span>
                  </button>
                  <p className={styles.codeStatus} role="status">
                    {copied ? 'Code copied' : ''}
                  </p>
                </div>

                <Button href={`/${brand}`} variant="primary" className={styles.successCta}>
                  Continue Shopping
                </Button>

                <p className={`${styles.hint} ${styles.successNote}`}>
                  If you added photos, they’ll appear on the product page once reviewed.
                </p>
              </div>
            </section>
          ) : (
            <>
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Customer Feedback</h1>
              <p className={styles.pageSubtitle}>
                Leave a review and earn a thank-you discount for your next order. Takes about 2 minutes.
              </p>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* ── Step 1 — rate each product ─────────────────────────────── */}
              <section className={styles.card} aria-labelledby="cf-step1-heading">
                <p className={styles.stepLabel}>Step 1 of 3</p>
                <h2 id="cf-step1-heading" className={styles.cardTitle}>
                  How would you rate your jewelry?
                </h2>

                <div className={styles.products}>
                  {products.map((product) => {
                    const answers = feedbackFor(product.id)
                    const nameId = `cf-product-${product.id}-name`
                    const recommendId = `cf-product-${product.id}-recommend`
                    const reviewId = `cf-product-${product.id}-review`
                    const photosId = `cf-product-${product.id}-photos`

                    return (
                      <div key={product.id} className={styles.product}>
                        <div className={styles.productTop}>
                          <span className={styles.productMedia}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.image}
                              alt={product.name}
                              className={styles.productImage}
                              loading="lazy"
                            />
                          </span>

                          <div className={styles.productInfo}>
                            <p id={nameId} className={styles.productName}>{product.name}</p>
                            {/* Stars and their hint: stacked on mobile, side by side on desktop */}
                            <div className={styles.ratingRow}>
                              <StarInput
                                value={answers.rating}
                                onChange={(rating) => updateProduct(product.id, { rating })}
                                labelledBy={nameId}
                                StarIcon={StarIcon}
                              />
                              <p className={styles.hint}>
                                {answers.rating > 0
                                  ? `${answers.rating} of 5`
                                  : 'Tap to rate'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className={styles.recommendRow}>
                          <span id={recommendId} className={styles.fieldLabel}>
                            Would you recommend it?
                          </span>
                          <YesNo
                            value={answers.recommend}
                            onChange={(recommend) => updateProduct(product.id, { recommend })}
                            labelledBy={recommendId}
                          />
                        </div>

                        <div className={styles.fieldGroup}>
                          <label htmlFor={reviewId} className={styles.fieldLabel}>
                            Your review:
                          </label>
                          <textarea
                            id={reviewId}
                            className={styles.textarea}
                            rows={3}
                            placeholder={REVIEW_PLACEHOLDER}
                            value={answers.review}
                            onChange={(event) => updateProduct(product.id, { review: event.target.value })}
                          />
                        </div>

                        {/* Optional photo upload — the whole box is the file picker */}
                        <div className={styles.upload}>
                          <p className={styles.uploadTitle}>
                            Add photos <span className={styles.uploadOptional}>(optional)</span>
                          </p>
                          <p className={styles.hint}>Show other shoppers how it looks in real life.</p>

                          {/* One input drives both states — the empty-state box and
                              the "add another" tile are both labels pointing at it. */}
                          <input
                            id={photosId}
                            type="file"
                            accept="image/*"
                            multiple
                            className={styles.uploadInput}
                            onChange={(event) => {
                              addPhotos(product.id, event.target.files)
                              // Allow re-picking the same file after a removal
                              event.target.value = ''
                            }}
                          />

                          {answers.photos.length === 0 ? (
                            /* Empty state — the wide upload box */
                            <label className={styles.uploadBox} htmlFor={photosId}>
                              <span className={styles.uploadTile} aria-hidden="true">
                                <FileUploadIcon size={24} />
                              </span>
                              <span className={styles.uploadCopy}>
                                <span className={styles.uploadCta}>Upload your photos</span>
                                <span className={styles.hint}>Select images from your device</span>
                              </span>
                            </label>
                          ) : (
                            /* With photos — thumbnails, then a square tile to add more.
                               Removing the last photo restores the box above. */
                            <ul className={styles.thumbs}>
                              {answers.photos.map((photo) => (
                                <li key={photo.url} className={styles.thumb}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={photo.url} alt={photo.name} className={styles.thumbImage} />
                                  <button
                                    type="button"
                                    className={styles.thumbRemove}
                                    aria-label={`Remove ${photo.name}`}
                                    onClick={() => removePhoto(product.id, photo.url)}
                                  >
                                    <XIcon size={12} />
                                  </button>
                                </li>
                              ))}
                              <li>
                                <label className={styles.thumbAdd} htmlFor={photosId}>
                                  <FileUploadIcon size={24} />
                                  <span className={styles.srOnly}>Add another photo</span>
                                </label>
                              </li>
                            </ul>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* ── Step 2 — rate the experience ───────────────────────────── */}
              <section className={styles.card} aria-labelledby="cf-step2-heading">
                <p className={styles.stepLabel}>Step 2 of 3</p>
                <h2 id="cf-step2-heading" className={styles.cardTitle}>Rate your experience</h2>

                <div className={styles.experienceList}>
                  {EXPERIENCE_ROWS.map((row) => {
                    const rowId = `cf-experience-${row.id}`
                    return (
                      <div key={row.id} className={styles.experienceRow}>
                        <span id={rowId} className={styles.fieldLabel}>{row.label}</span>
                        <StarInput
                          value={experience[row.id] ?? 0}
                          onChange={(rating) => setExperience((prev) => ({ ...prev, [row.id]: rating }))}
                          labelledBy={rowId}
                          StarIcon={StarIcon}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="cf-comments" className={styles.fieldLabel}>
                    Additional comments:
                  </label>
                  <textarea
                    id="cf-comments"
                    className={styles.textarea}
                    rows={3}
                    placeholder={COMMENTS_PLACEHOLDER}
                    value={comments}
                    onChange={(event) => setComments(event.target.value)}
                  />
                </div>
              </section>

              {/* ── Step 3 — recommendation score + submit ─────────────────── */}
              <section className={styles.card} aria-labelledby="cf-step3-heading">
                <p className={styles.stepLabel}>Step 3 of 3</p>
                <h2 id="cf-step3-heading" className={styles.cardTitle}>
                  How likely are you to recommend us to a friend?
                </h2>

                <div className={styles.scale}>
                  <div className={styles.scaleRow} role="radiogroup" aria-labelledby="cf-step3-heading">
                    {SCORES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={score === value}
                        tabIndex={score === value || (score === null && value === 0) ? 0 : -1}
                        className={`${styles.choice} ${styles.scaleBtn} ${score === value ? styles.choiceSelected : ''}`}
                        onClick={() => setScore(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <div className={styles.scaleLegend}>
                    <span className={styles.hint}>Not Likely</span>
                    <span className={styles.hint}>Very Likely</span>
                  </div>
                </div>

                <div className={styles.submitRow}>
                  <Button type="submit" variant="primary" className={styles.submitBtn}>
                    Submit
                  </Button>
                </div>
              </section>
            </form>
            </>
          )}
        </div>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}
