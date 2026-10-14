'use client'

import { useState, useEffect, useId, useRef, type ReactNode } from 'react'
import { HotspotPin } from '../HotspotPin'
import { HotspotPopover } from '../HotspotPopover'
import { QuickAddPanel } from '../QuickAddPanel'
import type { QuickAddProduct } from '../QuickAddPanel'
import { useOpenPanelCount } from '../PanelStack'
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
  /**
   * Turns on hover popovers (V3's mini card) on hover-capable devices; returns
   * where each popover's "Shop Now" links. Clicking a dot still opens Quick Add.
   */
  popoverHref?: (product: QuickAddProduct) => string
  /**
   * Turns on the same hover popovers, with "Shop Now" calling this instead of
   * linking (V3 / NEW FINAL: opens the Shop The Look panel).
   */
  onPopoverShopNow?: () => void
}

// Only real pointers get popovers — on touch a tap goes straight to Quick Add.
const HOVER_QUERY = '(hover: hover) and (pointer: fine)'
// Grace period so the pointer can travel from a dot into its popover.
const POPOVER_CLOSE_DELAY = 150

// ─── Component ────────────────────────────────────────────────────────────────

export function HotspotImage({ src, alt, pins = [], children, className, popoverHref, onPopoverShopNow }: HotspotImageProps) {
  const [openPinIndex, setOpenPinIndex] = useState<number | null>(null)

  // Hover / focus popovers (only when `popoverHref` or `onPopoverShopNow` is set)
  const hasPopovers = Boolean(popoverHref || onPopoverShopNow)
  const baseId = useId()
  const [popoverPin, setPopoverPin] = useState<number | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }
  const showPopover = (i: number) => {
    if (!window.matchMedia(HOVER_QUERY).matches) return
    cancelClose()
    setPopoverPin(i)
  }
  const hidePopoverSoon = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setPopoverPin(null), POPOVER_CLOSE_DELAY)
  }
  useEffect(() => cancelClose, [])

  // "Shop Now" opening the panel holds its popover open meanwhile, so focus can
  // return to its link on close; released once every panel has closed.
  const [heldPin, setHeldPin] = useState<number | null>(null)
  const openPanels = useOpenPanelCount()
  useEffect(() => {
    if (openPanels === 0) setHeldPin(null)
  }, [openPanels])
  const shopNow = (i: number) => {
    cancelClose()
    setHeldPin(i)
    onPopoverShopNow?.()
  }

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
      if (e.key === 'Escape') { setOpenPinIndex(null); setPopoverPin(null) }
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
        {pins.map((pin, i) => {
          if (!hasPopovers) {
            return (
              <HotspotPin
                key={i}
                x={pin.x}
                y={pin.y}
                pinColor={pin.pinColor}
                isOpen={openPinIndex === i}
                onClick={() => toggle(i)}
                label={pin.product.title}
              />
            )
          }
          const isOpen = popoverPin === i || openPinIndex === i || heldPin === i
          return (
            <div
              key={i}
              onMouseEnter={() => showPopover(i)}
              onMouseLeave={hidePopoverSoon}
              onFocus={() => showPopover(i)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hidePopoverSoon()
              }}
            >
              <HotspotPin
                x={pin.x}
                y={pin.y}
                pinColor={pin.pinColor}
                isOpen={isOpen}
                openIndicator="minus"
                onClick={() => setOpenPinIndex(i)}
                label={pin.product.title}
              />
              <HotspotPopover
                id={`${baseId}-pop-${i}`}
                product={pin.product}
                isOpen={popoverPin === i || heldPin === i}
                side={pin.x > 50 ? 'left' : 'right'}
                x={pin.x}
                y={pin.y}
                shopNowHref={popoverHref?.(pin.product)}
                onShopNow={() => shopNow(i)}
              />
            </div>
          )
        })}
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
