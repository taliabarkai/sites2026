'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from './SliderGallery.module.css'

type IconCmp = React.ComponentType<{ size?: number; color?: string; className?: string }>

export interface SliderGalleryProps {
  images: string[]
  /** On-model shots among `images` — shown as they are, not blended onto the tint. */
  modelImages: string[]
  name: string
  /** The desktop sticky bar watches this box. */
  rootRef?: React.RefObject<HTMLDivElement | null>
  /** The live preview, drawn as slide 1 with its ribbons stacked top left. */
  livePreview?: string | null
  ribbons?: string[]
  /** An icon before one of the ribbons (the personalization badge's wand). */
  ribbonIcon?: { on: string; icon: React.ReactNode }
  previewNote?: React.ReactNode
  /** The buy box's id, for the "Skip Media Gallery" link. */
  skipTo?: string
  icons: { ChevronIcon: IconCmp; ZoomInIcon: IconCmp; ZoomOutIcon: IconCmp }
}

const ZOOM = 1.75
/** Slides above this index load eagerly — the first screenful. */
const EAGER_SLIDES = 2

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Desktop slider gallery: one square image at a time, in a column the image's width, with native scroll snap, a two-button
 * arrow pill, a zoom cursor, and click-to-zoom in place (1.75×, panning with
 * the mouse). Only one slide is zoomed at a time; zoom resets when that slide
 * leaves view or on Esc. Infinite: the arrows and swipes carry on round past
 * either end. Hidden below desktop — mobile keeps the carousel.
 */
export function SliderGallery({ images, modelImages, name, rootRef, livePreview, ribbons, ribbonIcon, previewNote, skipTo, icons }: SliderGalleryProps) {
  const { ChevronIcon, ZoomInIcon, ZoomOutIcon } = icons
  const slides = livePreview ? [livePreview, ...images] : images
  const n = slides.length
  // Infinite: a copy of the last slide before the first and of the first after
  // the last. Landing on a copy jumps silently to its real twin, so the strip
  // always carries on in the direction it was going.
  const looped = n > 1
  const frames = looped ? [slides[n - 1], ...slides, slides[0]] : slides
  /** Which real slide a frame shows. */
  const realIndex = (fi: number) => (looped ? (fi - 1 + n) % n : fi)
  const isCopy = (fi: number) => looped && (fi === 0 || fi === n + 1)

  const trackRef = useRef<HTMLDivElement>(null)
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [zoomed, setZoomed] = useState<number | null>(null)
  // Where the zoom is anchored inside the frame, as percentages
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  /** Puts a frame in view without animating (the jump off a copy, the start position). */
  const jumpTo = useCallback((fi: number) => {
    const track = trackRef.current
    if (track) track.scrollLeft = fi * track.clientWidth
  }, [])

  // Start on the first real slide — and again whenever the set of slides changes
  useLayoutEffect(() => { jumpTo(looped ? 1 : 0) }, [jumpTo, looped, n])

  const onScroll = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    // A zoomed slide that has left the strip resets
    setZoomed((z) => {
      if (z === null) return z
      const frame = track.children[z] as HTMLElement | undefined
      if (!frame) return null
      const r = frame.getBoundingClientRect()
      const t = track.getBoundingClientRect()
      return r.right <= t.left + 1 || r.left >= t.right - 1 ? null : z
    })
    // Once the scroll settles on a copy, swap to the real slide it shows
    if (!looped) return
    if (settleRef.current) clearTimeout(settleRef.current)
    settleRef.current = setTimeout(() => {
      const fi = Math.round(track.scrollLeft / track.clientWidth)
      if (fi === 0) jumpTo(n)
      else if (fi === n + 1) jumpTo(1)
    }, 120)
  }, [looped, n, jumpTo])

  useEffect(() => () => { if (settleRef.current) clearTimeout(settleRef.current) }, [])

  // Esc zooms out
  useEffect(() => {
    if (zoomed === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoomed(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  /** One slide forward or back — past either end it carries on round. */
  const step = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: dir * track.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }

  const pointAt = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }
  }

  const toggleZoom = (i: number, at?: { x: number; y: number }) => {
    if (zoomed === i) { setZoomed(null); return }
    setOrigin(at ?? { x: 50, y: 50 })
    setZoomed(i)
  }

  // Over the zoomed slide a click zooms out; anywhere else it zooms in
  const CursorIcon = hovered !== null && hovered === zoomed ? ZoomOutIcon : ZoomInIcon

  return (
    <div ref={rootRef} className={styles.root}>
      {skipTo && <a href={`#${skipTo}`} className={styles.skip}>Skip Media Gallery</a>}

      <div
        ref={trackRef}
        className={styles.track}
        onScroll={onScroll}
        onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => { setCursor(null); setHovered(null) }}
      >
        {frames.map((src, i) => {
          const real = realIndex(i)
          const copy = isCopy(i)
          const isPreview = !!livePreview && real === 0
          const isZoomed = zoomed === i
          return (
            <div
              key={copy ? `copy-${i}` : isPreview ? 'preview' : `${i}-${src.slice(-40)}`}
              // The copies at either end are for the wrap-around only
              aria-hidden={copy || undefined}
              role={copy ? undefined : 'button'}
              tabIndex={copy ? -1 : 0}
              aria-label={copy ? undefined : `Slide ${real + 1} of ${n}, ${isPreview ? 'live preview' : 'image'}`}
              aria-pressed={copy ? undefined : isZoomed}
              className={styles.slide}
              onClick={(e) => toggleZoom(i, pointAt(e))}
              onMouseEnter={() => setHovered(i)}
              onMouseMove={isZoomed ? (e) => setOrigin(pointAt(e)) : undefined}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleZoom(i) }
              }}
            >
              {isPreview && ribbons && ribbons.length > 0 && (
                <div className={styles.ribbonStack}>
                  {ribbons.map((text) => (
                    <span key={text} className={`${styles.ribbon} ${ribbonIcon?.on === text ? styles.ribbonWithIcon : ''}`}>
                      {ribbonIcon?.on === text && ribbonIcon.icon}
                      {text}
                    </span>
                  ))}
                </div>
              )}
              {isPreview && previewNote && <div className={styles.note}>{previewNote}</div>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={real === 0 && !copy ? name : ''}
                className={`${styles.image} ${modelImages.includes(src) ? styles.imageModel : ''}`}
                style={{ transform: `scale(${isZoomed ? ZOOM : 1})`, transformOrigin: `${origin.x}% ${origin.y}%` }}
                loading={real < EAGER_SLIDES || copy ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          )
        })}
      </div>

      {/* Prev / next — one pill, bottom right of the strip */}
      <div className={styles.arrows} onMouseEnter={() => setCursor(null)}>
        <button type="button" className={styles.arrow} aria-label="Previous image" onClick={() => step(-1)}>
          <span className={styles.prevIcon} aria-hidden="true"><ChevronIcon size={20} /></span>
        </button>
        <button type="button" className={styles.arrow} aria-label="Next image" onClick={() => step(1)}>
          <span aria-hidden="true"><ChevronIcon size={20} /></span>
        </button>
      </div>

      {/* The cursor over the images: what a click will do */}
      {cursor && (
        <span className={styles.cursor} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} aria-hidden="true">
          <CursorIcon size={24} />
        </span>
      )}
    </div>
  )
}
