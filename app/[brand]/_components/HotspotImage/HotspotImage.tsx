'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { HotspotPin } from '../HotspotPin'
import { QuickAddPanel } from '../QuickAddPanel'
import type { QuickAddProduct } from '../QuickAddPanel'
import styles from './HotspotImage.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HotspotPinData {
  x: number
  y: number
  pinColor?: 'light' | 'dark'
  product: QuickAddProduct
}

export interface HotspotImageProps {
  src: string
  alt: string
  pins?: HotspotPinData[]
  children?: ReactNode    // headline or any overlay content
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HotspotImage({ src, alt, pins = [], children, className }: HotspotImageProps) {
  const [openPinIndex, setOpenPinIndex] = useState<number | null>(null)

  // Refs for returning focus to the pin that opened the panel
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([])
  const closePanelBtnRef = useRef<HTMLButtonElement | null>(null)

  const toggle = (i: number) =>
    setOpenPinIndex(prev => (prev === i ? null : i))

  const close = () => {
    const idx = openPinIndex
    setOpenPinIndex(null)
    // Return focus to the pin that opened the panel
    if (idx !== null) {
      setTimeout(() => pinRefs.current[idx]?.focus(), 50)
    }
  }

  // Escape key via HotspotPin's aria-expanded state is already handled in QuickAddPanel,
  // but also handle at this level to close when focus is on a pin
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPinIndex(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const openProduct = openPinIndex !== null ? pins[openPinIndex]?.product ?? null : null

  return (
    <>
      {/* Full-bleed image + pins + overlay children */}
      <div className={`${styles.wrapper} ${className ?? ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={styles.image} loading="lazy" />

        {/* Overlay children (headline, etc.) — above image, below pins */}
        {children && (
          <div className={styles.overlay}>{children}</div>
        )}

        {/* Hotspot pins */}
        {pins.map((pin, i) => (
          <HotspotPin
            key={i}
            x={pin.x}
            y={pin.y}
            pinColor={pin.pinColor}
            isOpen={openPinIndex === i}
            onClick={() => toggle(i)}
            label={pin.product.title}
          />
        ))}
      </div>

      {/* Quick-add panel — rendered outside the wrapper so it overlays the page */}
      <QuickAddPanel
        isOpen={openPinIndex !== null}
        onClose={close}
        product={openProduct}
        closeButtonRef={closePanelBtnRef}
      />
    </>
  )
}
