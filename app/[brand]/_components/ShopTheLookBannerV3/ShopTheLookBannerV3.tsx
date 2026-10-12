'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ShopTheLookBannerV1 } from '../ShopTheLookBannerV1'
import { HotspotPin } from '../HotspotPin'
import { HotspotPopover } from '../HotspotPopover'
import type { HotspotPinData } from '../HotspotImage'
import { QuickAddPanel } from '../QuickAddPanel'
import { useOpenPanelCount } from '../PanelStack'
import styles from './ShopTheLookBannerV3.module.css'

export interface ShopTheLookBannerV3Props {
  image: string
  imageAlt: string
  heading?: string | null
  pins: HotspotPinData[]
  /** Opens the Shop The Look panel — the touch CTA and each popover's "Shop Now". */
  onOpen: () => void
}

// Grace period so the pointer can travel from a dot into its popover.
const CLOSE_DELAY = 150

/**
 * V3 of the Shop The Look tile.
 *  • Touch / mobile — exactly V1: heading + CTA that opens the panel.
 *  • Desktop with a pointer (hover-capable, md+) — Current, improved: the CTA
 *    is a label; hovering (or tabbing into) the banner fades the CTA out and
 *    the dots in. Hovering / focusing a dot shows a popover (image, title,
 *    price, "Shop Now" → the panel); clicking the dot opens its Quick Add.
 * Both are rendered and switched by a media query (no hydration flash); the
 * hidden one is display:none, so it's out of the tab order and a11y tree.
 */
export function ShopTheLookBannerV3({ image, imageAlt, heading, pins, onOpen }: ShopTheLookBannerV3Props) {
  const baseId = useId()
  const [activePin, setActivePin] = useState<number | null>(null)
  const [quickAddPin, setQuickAddPin] = useState<number | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = null
  }
  const show = (i: number) => { cancelClose(); setActivePin(i) }
  const hideSoon = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setActivePin(null), CLOSE_DELAY)
  }
  useEffect(() => cancelClose, [])

  const openQuickAdd = (i: number) => { cancelClose(); setActivePin(i); setQuickAddPin(i) }

  // "Shop Now" opens the panel: hold that popover open meanwhile so focus can
  // return to its link on close; release once every panel has closed.
  const [heldPin, setHeldPin] = useState<number | null>(null)
  const openPanels = useOpenPanelCount()
  useEffect(() => {
    if (openPanels === 0) setHeldPin(null)
  }, [openPanels])
  const shopNow = (i: number) => { cancelClose(); setActivePin(i); setHeldPin(i); onOpen() }

  return (
    <>
      <div className={styles.touchOnly}>
        <ShopTheLookBannerV1 image={image} imageAlt={imageAlt} heading={heading} onOpen={onOpen} />
      </div>

      <div className={styles.hoverOnly}>
        <ShopTheLookBannerV1
          image={image}
          imageAlt={imageAlt}
          heading={heading}
          ctaAsLabel
          hideCtaOnHover
        >
          <div className={styles.pinLayer}>
            {pins.map((pin, i) => {
              const popoverId = `${baseId}-pop-${i}`
              const isOpen = activePin === i || quickAddPin === i || heldPin === i
              return (
                <div
                  key={pin.product.pdpUrl}
                  onMouseEnter={() => show(i)}
                  onMouseLeave={hideSoon}
                  onFocus={() => show(i)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hideSoon()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && quickAddPin === null) { cancelClose(); setActivePin(null) }
                  }}
                >
                  <HotspotPin
                    x={pin.x}
                    y={pin.y}
                    pinColor={pin.pinColor}
                    isOpen={isOpen}
                    openIndicator="minus"
                    onClick={() => openQuickAdd(i)}
                    label={pin.product.title}
                  />
                  <HotspotPopover
                    id={popoverId}
                    product={pin.product}
                    isOpen={isOpen}
                    side={pin.x > 50 ? 'left' : 'right'}
                    x={pin.x}
                    y={pin.y}
                    onShopNow={() => shopNow(i)}
                  />
                </div>
              )
            })}
          </div>
        </ShopTheLookBannerV1>

        <QuickAddPanel
          isOpen={quickAddPin !== null}
          onClose={() => setQuickAddPin(null)}
          product={quickAddPin !== null ? pins[quickAddPin]?.product ?? null : null}
        />
      </div>
    </>
  )
}
