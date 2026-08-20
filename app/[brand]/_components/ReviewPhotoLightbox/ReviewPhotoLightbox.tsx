'use client'

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import { createPortal } from 'react-dom'
import styles from './ReviewPhotoLightbox.module.css'

/**
 * One photo in the site-wide list. The list is ordered by review, so stepping
 * with the arrows walks the rest of the current review's photos before moving
 * on to the next review — `reviewStart` is where the owning review's run begins,
 * which is what the per-review thumbnails index against.
 */
export interface ReviewPhoto {
  src: string
  /** Index in the global list where this review's photos start. */
  reviewStart: number
  /** Every photo belonging to the same review, in order. */
  reviewPhotos: string[]
  initials: string
  name: string
  location: string
  dateLabel: string
  rating: number
  body: string
}

export interface ReviewPhotoLightboxProps {
  photos: ReviewPhoto[]
  /** Index into `photos` of the photo on screen, or null when closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
  /**
   * 'single' shows one photo beside its review; 'grid' shows every photo as a
   * gallery (opened from the strip's "View All"). Picking one switches to
   * 'single' via onSelectPhoto.
   */
  mode?: 'single' | 'grid'
  onSelectPhoto?: (index: number) => void
  /**
   * Provided only when this photo was opened from the "View All" grid — renders
   * a Back control in the header that returns to it.
   */
  onBack?: () => void
  StarIcon: ComponentType<{ size?: number }>
  ArrowIcon: ComponentType<{ size?: number }>
  XIcon: ComponentType<{ size?: number }>
  CheckmarkIcon: ComponentType<{ size?: number }>
}

export function ReviewPhotoLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
  mode = 'single',
  onSelectPhoto,
  onBack,
  StarIcon,
  ArrowIcon,
  XIcon,
  CheckmarkIcon,
}: ReviewPhotoLightboxProps) {
  const isOpen = index !== null && photos.length > 0
  const dialogRef = useRef<HTMLDivElement>(null)
  // Portal into the [data-theme] wrapper rather than <body>: the brand tokens
  // (typography, radii, surfaces) are scoped to that element, so a lightbox
  // rendered outside it loses every var and falls back to browser defaults.
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const themed = anchorRef.current?.closest('[data-theme]') as HTMLElement | null
    setPortalTarget(themed ?? document.body)
  }, [])
  const closeRef = useRef<HTMLButtonElement>(null)
  // The thumbnail that opened the lightbox, so focus can go back to it on close.
  const openerRef = useRef<Element | null>(null)

  const step = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return
      const next = (index + delta + photos.length) % photos.length
      onIndexChange(next)
    },
    [index, photos.length, onIndexChange],
  )

  // Remember what had focus, and hand it back when the lightbox closes.
  useEffect(() => {
    if (!isOpen) return
    openerRef.current = document.activeElement
    const timer = setTimeout(() => closeRef.current?.focus(), 50)
    return () => {
      clearTimeout(timer)
      const opener = openerRef.current
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [isOpen])

  // Escape closes, arrows step through the photos.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowRight') step(1)
      else if (event.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, step])

  // Keep Tab inside the dialog while it is open.
  useEffect(() => {
    if (!isOpen) return
    const node = dialogRef.current
    if (!node) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const focusables = Array.from(
        node.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'),
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    node.addEventListener('keydown', onKeyDown)
    return () => node.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  // Lock the page behind the lightbox.
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [isOpen])

  const anchor = <span ref={anchorRef} aria-hidden="true" style={{ display: 'none' }} />

  if (!isOpen || index === null || !portalTarget) return anchor

  const photo = photos[index]
  const activeInReview = index - photo.reviewStart
  const showReviewThumbs = photo.reviewPhotos.length > 1
  const isGrid = mode === 'grid'
  // Grid mode counts the whole gallery; single mode says where you are in it.
  const counter = isGrid ? `${photos.length}` : `${index + 1} of ${photos.length}`
  const alt = `Photo from ${photo.name}'s review`

  return (
    <>
      {anchor}
      {createPortal(
        <div className={styles.root} role="presentation">
          <div className={styles.backdrop} aria-hidden="true" onClick={onClose} />

          <div
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-label={`Customer reviews with photos, ${counter}`}
          >
            {/* Back (only from the grid) left, title centred, close right */}
            <div className={styles.header}>
              {onBack ? (
                <button
                  type="button"
                  className={styles.back}
                  aria-label="Back to all photos"
                  onClick={onBack}
                >
                  <span className={styles.backIcon} aria-hidden="true"><ArrowIcon size={24} /></span>
                </button>
              ) : (
                <span aria-hidden="true" />
              )}

              <p className={styles.headerTitle}>
                Customer reviews with photos <span className={styles.headerCount}>({counter})</span>
              </p>

              <button ref={closeRef} type="button" className={styles.close} aria-label="Close" onClick={onClose}>
                <XIcon size={24} />
              </button>
            </div>

            {isGrid ? (
              /* "View All" — every photo as a gallery; picking one opens it */
              <ul className={styles.grid}>
                {photos.map((item, i) => (
                  <li key={`${item.src}-${i}`}>
                    <button
                      type="button"
                      className={styles.gridItem}
                      aria-label={`Open photo from ${item.name}'s review`}
                      onClick={() => onSelectPhoto?.(i)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt={`Photo from ${item.name}'s review`}
                        className={styles.gridImg}
                        loading="lazy"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
            <div className={styles.body}>
              {/* On mobile the arrows flank the photo in this row; on desktop
                  they become circles on the backdrop outside the modal. */}
              <div className={styles.photoPane}>
                <button
                  type="button"
                  className={`${styles.nav} ${styles.navPrev}`}
                  aria-label="Previous photo"
                  onClick={() => step(-1)}
                >
                  <span className={styles.navIconPrev} aria-hidden="true"><ArrowIcon size={24} /></span>
                </button>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={alt} className={styles.photo} />

                <button
                  type="button"
                  className={`${styles.nav} ${styles.navNext}`}
                  aria-label="Next photo"
                  onClick={() => step(1)}
                >
                  <span aria-hidden="true"><ArrowIcon size={24} /></span>
                </button>
              </div>

              <div className={styles.infoPane}>
                <div className={styles.reviewer}>
                  <span className={styles.avatarWrap} aria-hidden="true">
                    <span className={styles.avatar}>{photo.initials}</span>
                    <span className={styles.avatarBadge}><CheckmarkIcon size={10} /></span>
                  </span>
                  <span className={styles.reviewerText}>
                    <span className={styles.reviewerName}>{photo.name}</span>
                    <span className={styles.reviewerMeta}>
                      {photo.location} <span aria-hidden="true">•</span> {photo.dateLabel}
                    </span>
                  </span>
                </div>

                <div className={styles.stars} aria-label={`${photo.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={star <= photo.rating ? styles.starFilled : styles.starEmpty}
                      aria-hidden="true"
                    >
                      <StarIcon size={20} />
                    </span>
                  ))}
                </div>

                <p className={styles.reviewText}>{photo.body}</p>

                {/* This review's own photos — swapping one changes the photo only */}
                {showReviewThumbs && (
                  <ul className={styles.reviewThumbs} aria-label="More photos from this review">
                    {photo.reviewPhotos.map((src, i) => (
                      <li key={`${src}-${i}`}>
                        <button
                          type="button"
                          className={`${styles.reviewThumb} ${i === activeInReview ? styles.reviewThumbActive : ''}`}
                          aria-current={i === activeInReview}
                          aria-label={`Photo ${i + 1} of ${photo.reviewPhotos.length} from ${photo.name}'s review`}
                          onClick={() => onIndexChange(photo.reviewStart + i)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className={styles.reviewThumbImg} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            )}
          </div>
        </div>,
        portalTarget,
      )}
    </>
  )
}
