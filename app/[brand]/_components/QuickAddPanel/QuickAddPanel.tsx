'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePanelLayer, layerZIndex } from '../PanelStack'
import { QuickAddPanelContent, quickAddLayout } from './QuickAddPanelContent'
import styles from './QuickAddPanel.module.css'
import type { ReactNode } from 'react'
import type { CartItem } from '../../_context/CartContext'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuickAddOption {
  name: string
  /** `grid` — an open grid of tiles, each an image over its label (the PDP's standard-image grid). */
  type: 'swatch' | 'dropdown' | 'pills' | 'text-input' | 'grid'
  /** `image` is a grid tile's picture (a gem, say). */
  values?: { label: string; value: string; price?: number; color?: string; image?: string }[]
  maxLength?: number
  placeholder?: string
  /**
   * Swatches only: the PDP's metal picker — a bold "Name:" label, larger
   * swatches, and each one's full price below it.
   */
  showPrices?: boolean
}

export interface QuickAddProduct {
  title: string
  price: number           // base price in cents
  salePrice?: number      // original/crossed-out price in cents
  currency?: string
  rating?: number
  reviewCount?: number
  /** `onModel` — a lifestyle shot, shown as it is rather than blended onto the tint. */
  images: { src: string; alt: string; onModel?: boolean }[]
  pdpUrl: string          // relative path, e.g. /product/24
  options: QuickAddOption[]
  /** A short tag on its nested items card — an offer, say "50% off". */
  ribbon?: string
  /** Hide the panel's image gallery on mobile (images still show on desktop). */
  hideGalleryOnMobile?: boolean
  /** Hide the panel's image gallery entirely (all breakpoints) — options only. */
  hideGallery?: boolean
  /**
   * How engraving is asked for. 'names' (default): a number-of-names selector
   * and one field per name, replacing the product's own text input. 'fields':
   * just the product's own options, text inputs required — say one name field,
   * or one initial or birthstone choice.
   */
  engraving?: 'names' | 'fields'
}

/** What the shopper chose in the form — enough to reopen it exactly as it was. */
export interface QuickAddFormValues {
  selectedOptions: Record<string, string>
  names: string[]
}

export interface QuickAddPanelProps {
  isOpen: boolean
  onClose: () => void
  product: QuickAddProduct | null
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>
  /** Primary CTA label. Defaults to "Add to Bag". */
  ctaLabel?: string
  /**
   * When provided, replaces the default "add to cart + open cart" behavior with
   * this callback (used by Nested Items to stage a companion product instead of
   * dropping it straight into the bag). Receives the fully configured cart item.
   */
  onAdd?: (item: CartItem) => void
  /** Show the "View Full Details" link. Hidden for nested items (bound to the main product). */
  showViewDetails?: boolean
  /** Choices the form opens with instead of the defaults. */
  initialValues?: QuickAddFormValues
  /** Called with the form's choices whenever they change. */
  onChange?: (values: QuickAddFormValues) => void
  /** Change it to start the form over from `initialValues` (it otherwise starts over per product). */
  formKey?: string | number
  /** Drawn after the last selection, above the CTA — e.g. a nested items offer. */
  afterOptions?: ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * The Quick Add panel — the slide-in shell (backdrop, panel, close button)
 * around the Quick Add form (`QuickAddPanelContent`).
 */
export function QuickAddPanel({ isOpen, onClose, product, closeButtonRef, ctaLabel = 'Add to Bag', onAdd, showViewDetails = true, initialValues, onChange, formKey, afterOptions }: QuickAddPanelProps) {
  const internalCloseRef = useRef<HTMLButtonElement>(null)
  const closeRef = closeButtonRef ?? internalCloseRef
  const panelRef = useRef<HTMLDivElement>(null)

  // Panel stack — Escape (topmost panel only), focus trap, focus return, and the
  // page scroll lock. Depth > 0 when opened on top of another panel (e.g. from a
  // card inside Shop The Look); a lone panel is depth 0 and behaves as before.
  const depth = usePanelLayer(isOpen, onClose, panelRef)
  const stackZ = layerZIndex(depth)

  // Portal to the themed root (the [data-theme] wrapper) so the panel escapes any
  // inner stacking context that traps it under the site header, WHILE keeping the
  // brand CSS variables (typography/colors/buttons are scoped to [data-theme]).
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const themed = anchorRef.current?.closest('[data-theme]') as HTMLElement | null
    setPortalTarget(themed ?? document.body)
  }, [])

  // Focus the close button when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 50)
    }
  }, [isOpen, closeRef])

  // Always render panel in the DOM so CSS transform transitions work.
  // (Unmounting on close = no initial transform to transition from, breaking animation.)
  // Match FloatingCart pattern: panel is always mounted, visibility driven by CSS class.
  const layout = product ? quickAddLayout(product) : null

  const tree = (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
        style={stackZ.backdrop}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={stackZ.panel}
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''} ${layout?.singleColumn ? styles.panelSingle : ''} ${(layout?.hideGalleryOnMobile || layout?.hideGallery) ? styles.panelHugMobile : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Add to Bag"
      >
        {/* Close button — plain X, absolute top-right of the panel */}
        <button
          ref={closeRef}
          type="button"
          className={styles.closeBtn}
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>

        {/* The form starts over whenever the product (or the host's formKey) changes */}
        {product && (
          <QuickAddPanelContent
            key={`${product.title}-${formKey ?? ''}`}
            product={product}
            ctaLabel={ctaLabel}
            showViewDetails={showViewDetails}
            onAdd={onAdd}
            initialValues={initialValues}
            onChange={onChange}
            afterOptions={afterOptions}
            onDone={onClose}
          />
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Anchor stays in place so we can resolve the themed [data-theme] root */}
      <span ref={anchorRef} aria-hidden="true" style={{ display: 'none' }} />
      {portalTarget && createPortal(tree, portalTarget)}
    </>
  )
}
