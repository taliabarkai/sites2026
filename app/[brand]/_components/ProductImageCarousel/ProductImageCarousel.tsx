'use client'

import { useCallback, useRef, useState } from 'react'
import styles from './ProductImageCarousel.module.css'

export interface ProductImageCarouselProps {
  /** Image srcs shown as horizontally-snapping slides. */
  images: string[]
  /** Optional live-preview image prepended as the first slide (LAL PDP). */
  livePreview?: string | null
  /** Extra class merged onto the root (e.g. to hide on desktop in the PDP). */
  className?: string
  /** Slides shrink below full width so the next image peeks in (QuickAdd panel). */
  peek?: boolean
  /** Show the progress bar below the track. Defaults to true. */
  showProgress?: boolean
}

/**
 * Horizontally scrollable image carousel with snap slides and a progress bar.
 * Shared between the PDP mobile gallery and the QuickAdd panel's ≤4-image variant.
 */
export function ProductImageCarousel({ images, livePreview, className, peek = false, showProgress = true }: ProductImageCarouselProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const allImages = livePreview ? [livePreview, ...images] : images

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setActiveIdx(Math.round(el.scrollLeft / el.clientWidth))
  }, [])

  const rootClass = [styles.carousel, peek ? styles.peek : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <div ref={trackRef} className={styles.track} onScroll={onScroll}>
        {allImages.map((src, i) => (
          <div key={i} className={styles.slide}>
            {livePreview && i === 0 && <span className={styles.livePreviewRibbon}>Live Preview</span>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className={styles.image}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
      {showProgress && allImages.length > 1 && (
        <div className={styles.progressTrack} aria-hidden="true">
          <div
            className={styles.progressBar}
            style={{
              width: `${100 / allImages.length}%`,
              transform: `translateX(${activeIdx * 100}%)`,
            }}
          />
        </div>
      )}
    </div>
  )
}
