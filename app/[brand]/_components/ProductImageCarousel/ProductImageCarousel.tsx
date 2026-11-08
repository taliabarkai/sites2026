'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import styles from './ProductImageCarousel.module.css'

export interface ProductImageCarouselProps {
  /** Image srcs shown as horizontally-snapping slides. */
  images: string[]
  /** Optional live-preview image prepended as the first slide (LAL PDP). */
  livePreview?: string | null
  /** Ribbon on the live-preview slide. Defaults to "Live Preview". */
  livePreviewRibbon?: string
  /** `brand` (default): brand-primary pill, as LAL ships it. `ribbon`: the theme's ribbon tokens, legible on every brand. */
  livePreviewRibbonTone?: 'brand' | 'ribbon'
  /** Template PDPs: ribbons stacked top left in the theme's ribbon colors, in place of the single ribbon. */
  livePreviewRibbons?: string[]
  /** An icon before one of those ribbons (the personalization badge's wand). */
  ribbonIcon?: { on: string; icon: ReactNode }
  /** Ribbons drawn in the sale color (a promotion's badge). */
  saleRibbons?: string[]
  /** Drawn over the live-preview slide, bottom-left (a disclaimer, a loading state). */
  livePreviewOverlay?: ReactNode
  /** Extra class merged onto the root (e.g. to hide on desktop in the PDP). */
  className?: string
  /** Slides shrink below full width so the next image peeks in (QuickAdd panel). */
  peek?: boolean
  /** Show the progress bar below the track. Defaults to true. */
  showProgress?: boolean
  /** `below` (default): under the images. `floating`: over the image, inset 16px from the bottom and sides. */
  progressPlacement?: 'below' | 'floating'
  /** On-model shots among `images` — shown as they are, not blended onto the tint. */
  modelImages?: string[]
}

/**
 * Horizontally scrollable image carousel with snap slides and a progress bar.
 * Shared between the PDP mobile gallery and the QuickAdd panel's ≤4-image variant.
 */
export function ProductImageCarousel({ images, livePreview, livePreviewRibbon = 'Live Preview', livePreviewRibbonTone = 'brand', livePreviewRibbons, ribbonIcon, saleRibbons, livePreviewOverlay, className, peek = false, showProgress = true, progressPlacement = 'below', modelImages = [] }: ProductImageCarouselProps) {
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
            {/* On the first slide — the preview, or before there is one, the product's own badges */}
            {i === 0 && livePreviewRibbons && livePreviewRibbons.length > 0 && (
              <div className={styles.ribbonStack}>
                {livePreviewRibbons.map((text) => (
                  <span key={text} className={`${styles.livePreviewRibbon} ${styles.livePreviewRibbonThemed} ${ribbonIcon?.on === text ? styles.ribbonWithIcon : ''} ${saleRibbons?.includes(text) ? styles.ribbonSale : ''}`}>
                    {ribbonIcon?.on === text && ribbonIcon.icon}
                    {text}
                  </span>
                ))}
              </div>
            )}
            {livePreview && i === 0 && !livePreviewRibbons && livePreviewRibbon && <span className={`${styles.livePreviewRibbon} ${livePreviewRibbonTone === 'ribbon' ? styles.livePreviewRibbonThemed : ''}`}>{livePreviewRibbon}</span>}
            {livePreview && i === 0 && livePreviewOverlay && <div className={styles.livePreviewOverlay}>{livePreviewOverlay}</div>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className={`${styles.image} ${modelImages.includes(src) ? styles.imageModel : ''}`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
      {showProgress && allImages.length > 1 && (
        <div className={`${styles.progressTrack} ${progressPlacement === 'floating' ? styles.progressFloating : ''}`} aria-hidden="true">
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
