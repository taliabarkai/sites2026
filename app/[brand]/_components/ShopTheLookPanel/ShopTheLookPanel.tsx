'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getBrandFromPathname } from '../../_config/brands'
import { PanelPortal } from '../PanelPortal'
import { ProductCard } from '../ProductCard'
import type { ProductCardProps } from '../ProductCard'
import { usePanelLayer, layerZIndex } from '../PanelStack'
import { HotspotPin } from '../HotspotPin'
import type { HotspotPinData } from '../HotspotImage'
import { ShopTheLookProductRow } from '../ShopTheLookProductRow'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './ShopTheLookPanel.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

export interface ShopTheLookItem extends ProductCardProps {
  id: string
}

export interface ShopTheLookPanelProps {
  isOpen: boolean
  onClose: () => void
  image: string
  imageAlt: string
  /**
   * v1 — banner image + the products as category ProductCards.
   * v2 — desktop: same as v1. Mobile: banner image with the hotspot dots and
   *      prev/next arrows + the selected dot's product card (first on open).
   */
  variant?: 'v1' | 'v2'
  /** v1: products in the look — ProductCards whose bag button opens Quick Add
   *  stacked on top of this panel. */
  items?: ShopTheLookItem[]
  /** v2: the tile's hotspot pins (position + product) — the same data Current uses. */
  pins?: HotspotPinData[]
  title?: string
}

/**
 * Shop The Look drawer. Same placement, motion and close behaviour as
 * QuickAddPanel: right-side drawer on desktop, bottom sheet on mobile, always in
 * the DOM so the transform transition runs. Registers with the panel stack so a
 * Quick Add opened from one of its cards sits on top and Escape closes only that.
 */
export function ShopTheLookPanel({
  isOpen,
  onClose,
  image,
  imageAlt,
  variant = 'v1',
  items = [],
  pins = [],
  title = 'Shop The Look',
}: ShopTheLookPanelProps) {
  const brand = getBrandFromPathname(usePathname())
  const { XIcon, ArrowIcon } = BRAND_ICONS[brand]

  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const depth = usePanelLayer(isOpen, onClose, panelRef)
  const stackZ = layerZIndex(depth)

  // v2: selected product — first one on every open; kept while Quick Add is
  // stacked on top (the panel stays open, so this state survives).
  const [selected, setSelected] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const productRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (isOpen) setSelected(0)
  }, [isOpen])

  // Tapping a dot swaps the product card; on mobile (card below the image)
  // bring it into view if it sits below the fold.
  const selectFromPin = (i: number) => {
    setSelected(i)
    const card = productRef.current
    const scroller = scrollRef.current
    if (!card || !scroller) return
    const overflow = card.getBoundingClientRect().bottom - scroller.getBoundingClientRect().bottom
    if (overflow > 0) scroller.scrollBy({ top: overflow + parseFloat(getComputedStyle(card).scrollMarginBottom || '0'), behavior: 'smooth' })
  }
  const selectedPin = pins[selected] ?? pins[0]
  // Arrows step through the products, wrapping at either end.
  const step = (dir: 1 | -1) => {
    if (pins.length === 0) return
    selectFromPin((selected + dir + pins.length) % pins.length)
  }

  // Move focus into the panel once it starts sliding in (matches QuickAddPanel).
  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => closeRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [isOpen])

  return (
    <PanelPortal>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        style={stackZ.backdrop}
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        style={stackZ.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        inert={!isOpen}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.closeBtn}
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            <XIcon size={24} />
          </button>
        </header>

        {/* Stays mounted while Quick Add is stacked on top, so its scroll
            position is untouched when Quick Add closes. */}
        <div ref={scrollRef} className={styles.scrollArea}>
          {/* v1 layout — all of v1, and v2 on desktop (md+) */}
          <div className={variant === 'v2' ? styles.desktopOnly : styles.contents}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={imageAlt} className={styles.image} loading="lazy" />

              <ul className={styles.grid} aria-label="Products in this look">
                {items.map(({ id, ...card }) => (
                  <li key={id} className={styles.gridItem}>
                    <ProductCard {...card} />
                  </li>
                ))}
              </ul>
          </div>

          {/* v2 mobile layout — image with dots + arrows + the selected product */}
          {variant === 'v2' && (
            <div className={styles.mobileOnly}>
              {/* Image + hotspot dots — % positions from the tile's pin data, so
                  they land on the same products at any panel size. */}
              <div className={styles.imageColumn}>
              <div className={styles.hotspotImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={imageAlt} className={styles.image} loading="lazy" />
                {pins.map((pin, i) => (
                  <HotspotPin
                    key={pin.product.pdpUrl}
                    x={pin.x}
                    y={pin.y}
                    pinColor={pin.pinColor}
                    isSelected={selected === i}
                    onClick={() => selectFromPin(i)}
                    label={`Show ${pin.product.title}`}
                  />
                ))}
              </div>

              {pins.length > 1 && (
                <div className={styles.arrows}>
                  <button type="button" className={styles.arrowBtn} aria-label="Previous product" onClick={() => step(-1)}>
                    <span className={styles.arrowPrev} aria-hidden="true"><ArrowIcon size={20} /></span>
                  </button>
                  <span className={styles.counter} aria-hidden="true">{selected + 1} / {pins.length}</span>
                  <button type="button" className={styles.arrowBtn} aria-label="Next product" onClick={() => step(1)}>
                    <span aria-hidden="true"><ArrowIcon size={20} /></span>
                  </button>
                </div>
              )}
              </div>

              {/* Only the selected dot's product — announced when it changes */}
              <div ref={productRef} className={styles.selectedProduct} aria-live="polite">
                {selectedPin && (
                  <ShopTheLookProductRow key={selectedPin.product.pdpUrl} product={selectedPin.product} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PanelPortal>
  )
}
