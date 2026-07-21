'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { getBrandFromPathname } from '../../_config/brands'
import type { BrandKey } from '../../_config/brands'
import { Button } from '../Button'
import type { CartItem } from '../../_context/CartContext'
import { useCart, WARRANTY_CENTS } from '../../_context/CartContext'
import styles from './FloatingCart.module.css'

const BRAND_ICONS = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib: ibIcons,
} as const

/** Brand-specific hero image for the 5-year protection plan details panel. */
const CARE_PLAN_IMAGES: Partial<Record<BrandKey, string>> = {
  tgr: 'https://cdn.theograce.co.uk/digital-asset/product/jewelry-care-plan--21.jpg',
  oal: 'https://cdn.oakandluna.com/digital-asset/product/jewelry-care-plan-24.jpg',
}

export interface FloatingCartProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  subtotal: number
  onRemoveItem: (id: string) => void
  onEditItem: (id: string) => void
  onContinueToCheckout: () => void
  onGenerateGiftNote: () => Promise<string>
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

interface CartItemRowProps {
  item: CartItem
  /** Show the delivery-guarantee line (only the 2nd standalone main item). */
  showGuarantee: boolean
  brand: BrandKey
  onRemove: (id: string) => void
  onEdit: (id: string) => void
  onNavigate: () => void
  onGenerateGiftNote: () => Promise<string>
  DropdownIcon: React.ComponentType<{ size?: number }>
  /** Whether the 5-year protection plan is selected for this item. */
  hasPlan: boolean
  onTogglePlan: () => void
  /** Open the protection-plan details sub-panel for this item. */
  onOpenCarePlan: () => void
}

function CartItemRow({ item, showGuarantee, brand, onRemove, onEdit, onNavigate, DropdownIcon, hasPlan, onTogglePlan, onOpenCarePlan }: CartItemRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const hasOptions = item.selectedOptions && item.selectedOptions.length > 0
  const { CheckboxIcon, CheckmarkIcon } = BRAND_ICONS[brand]

  // Custom canvas items deep-link to the PDP with the saved preview restored inline
  const itemHref = item.canvasConfig
    ? `/${brand}/product/${item.canvasConfig.productId}?preview=${item.id}`
    : `/${brand}/product`

  const handleRemoveConfirm = () => {
    onRemove(item.id)
  }

  return (
    <article className={styles.item}>
      {/* Delivery guarantee — only on the 2nd standalone main item (companions excluded) */}
      {showGuarantee && (
        <p className={styles.deliveryGuarantee}>Guaranteed to arrive by Christmas</p>
      )}
      <div className={styles.itemMain}>
        <Link href={itemHref} className={styles.itemImageWrap} onClick={onNavigate}>
          <img
            src={item.image}
            alt={item.name}
            className={styles.itemImage}
          />
        </Link>

        <div className={styles.itemBody}>
          <Link href={itemHref} className={styles.itemName} onClick={onNavigate}>{item.name}</Link>

          <div className={styles.itemPriceRow}>
            {item.originalPrice != null && (
              <span className={styles.itemOriginalPrice}>{formatPrice(item.originalPrice)}</span>
            )}
            <span className={styles.itemPrice}>{formatPrice(item.price)}</span>
          </div>

          {hasOptions && (
            <div className={styles.detailsBlock}>
              <button
                type="button"
                className={styles.detailsToggle}
                aria-expanded={detailsOpen}
                onClick={() => setDetailsOpen(o => !o)}
              >
                View Details{' '}
                <span style={{ display: 'inline-flex', transform: detailsOpen ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform var(--transition-fast)' }}>
                  <DropdownIcon size={24} />
                </span>
              </button>
              {detailsOpen && (
                <dl className={styles.optionsList}>
                  {item.selectedOptions!.map(opt => (
                    <div key={opt.label} className={styles.optionRow}>
                      <dt className={styles.optionKey}>{opt.label}</dt>
                      <dd className={styles.optionValue}>{opt.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}

          <div className={styles.itemActions}>
            <button type="button" className={styles.editLink} onClick={() => onEdit(item.id)}>
              Edit
            </button>

            <span className={styles.actionsDivider} aria-hidden="true" />

            {confirmRemove ? (
              <span className={styles.removeConfirm}>
                Remove item?{' '}
                <button type="button" className={styles.removeConfirmYes} onClick={handleRemoveConfirm}>
                  Yes
                </button>
                {' / '}
                <button type="button" className={styles.removeConfirmCancel} onClick={() => setConfirmRemove(false)}>
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" className={styles.removeLink} onClick={() => setConfirmRemove(true)}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Per-item 5-year protection plan — toggling adjusts the cart subtotal */}
      <div className={styles.protectionRow}>
        <button
          type="button"
          role="checkbox"
          aria-checked={hasPlan}
          className={styles.protectionToggle}
          onClick={onTogglePlan}
        >
          <span className={styles.protectionCheckbox} aria-hidden="true">
            {hasPlan ? (
              <span className={styles.protectionChecked}>
                <CheckmarkIcon size={12} />
              </span>
            ) : (
              <CheckboxIcon size={24} />
            )}
          </span>
          <span className={styles.protectionLabel}>Add a 5-Year Protection Plan for $15</span>
        </button>
        <button type="button" className={styles.protectionDetails} onClick={onOpenCarePlan}>
          Details
        </button>
      </div>
    </article>
  )
}

export function FloatingCart({
  isOpen,
  onClose,
  items,
  subtotal,
  onRemoveItem,
  onEditItem,
  onContinueToCheckout,
  onGenerateGiftNote,
}: FloatingCartProps) {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const icons = BRAND_ICONS[brand]
  const { XIcon, CheckmarkIcon, ChevronIcon } = icons
  const { justAdded, toggleWarranty } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)

  // Protection-plan details sub-panel — holds the id of the item whose "Details"
  // was tapped (null = closed). Slides over the cart content.
  const [carePlanItemId, setCarePlanItemId] = useState<string | null>(null)
  const carePlanImage = CARE_PLAN_IMAGES[brand]
  const handleAddCarePlan = () => {
    const target = items.find(it => it.id === carePlanItemId)
    if (target && !target.warranty) toggleWarranty(target.id)
    setCarePlanItemId(null)
  }

  // The delivery guarantee shows on the 2nd standalone MAIN item only — companion
  // (nested) items don't count toward that position.
  let mainCount = 0
  const showGuaranteeFor = items.map(it => {
    if (it.isCompanion) return false
    mainCount += 1
    return mainCount === 2
  })

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const el = panelRef.current
    if (!el) return
    const focusables = Array.from(
      el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])')
    )
    focusables[0]?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    el.addEventListener('keydown', handleTab)
    return () => el.removeEventListener('keydown', handleTab)
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            My Bag {items.length > 0 && <span className={styles.count}>({items.length})</span>}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close cart"
            onClick={onClose}
          >
            <XIcon size={24} />
          </button>
        </div>

        {justAdded && items.length > 0 && (
          <div className={styles.addedBanner}>
            <span className={styles.addedCheck} aria-hidden="true">
              <CheckmarkIcon size={24} />
            </span>
            <span className={styles.addedText}>Successfully added to bag!</span>
          </div>
        )}

        <div className={styles.itemsList}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>Your bag is empty.</p>
              <Button href="#" variant="secondary" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item, index) => (
              <CartItemRow
                key={item.id}
                item={item}
                showGuarantee={showGuaranteeFor[index]}
                brand={brand}
                onRemove={onRemoveItem}
                onEdit={onEditItem}
                onNavigate={onClose}
                onGenerateGiftNote={onGenerateGiftNote}
                DropdownIcon={icons.DropdownIcon}
                hasPlan={!!item.warranty}
                onTogglePlan={() => toggleWarranty(item.id)}
                onOpenCarePlan={() => setCarePlanItemId(item.id)}
              />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totals}>
              <div className={styles.subtotalRow}>
                <span className={styles.footerLabel}>Subtotal</span>
                <span className={styles.footerAmount}>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.taxRow}>
                <span className={styles.footerLabel}>Tax</span>
                <span className={styles.taxNote}>Calculated at checkout</span>
              </div>
            </div>
            <Button variant="add-to-cart" href={`/${brand}/checkout`} className={styles.checkoutBtn}>
              Checkout
            </Button>
          </div>
        )}

        {/* Protection-plan details — slides over the cart content */}
        <div
          className={`${styles.carePlan} ${carePlanItemId ? styles.carePlanOpen : ''}`}
          role="dialog"
          aria-label="5-Year Jewelry Protection Plan"
          aria-hidden={!carePlanItemId}
        >
          <div className={styles.carePlanHeader}>
            <button type="button" className={styles.carePlanBack} onClick={() => setCarePlanItemId(null)}>
              <span className={styles.carePlanBackIcon} aria-hidden="true"><ChevronIcon size={20} /></span>
              Back
            </button>
          </div>

          <div className={styles.carePlanScroll}>
            {/* Two-column header — image (180px) left, title + price right */}
            <div className={styles.carePlanTop}>
              {carePlanImage && (
                <span className={styles.carePlanImageWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={carePlanImage} alt="5-Year Jewelry Protection Plan" className={styles.carePlanImage} />
                </span>
              )}
              <div className={styles.carePlanTopInfo}>
                <h3 className={styles.carePlanTitle}>5-Year Jewelry Protection Plan</h3>
                <span className={styles.carePlanPrice}>{formatPrice(WARRANTY_CENTS)}</span>
              </div>
            </div>

            <div className={styles.carePlanBody}>
              <p className={styles.carePlanIntro}>
                Our 5-Year Jewelry Protection Plan allows you to enjoy exclusive services, such as
                restoring &amp; preserving the beauty of your jewelry as well as benefit from free
                returns and more.
              </p>

              <h3 className={styles.carePlanHeading}>Benefits</h3>

              <div className={styles.carePlanBenefit}>
                <h4 className={styles.carePlanBenefitTitle}>Free Returns</h4>
                <p className={styles.carePlanText}>
                  We cover return shipping for resizing, damage, or replacement purposes.
                </p>
              </div>

              <div className={styles.carePlanBenefit}>
                <h4 className={styles.carePlanBenefitTitle}>Replacements of damaged jewelry</h4>
                <ul className={styles.carePlanList}>
                  <li>Chain &amp; clasp replacement</li>
                  <li>Replacement of missing stones &amp; diamonds</li>
                  <li>Manufacturing issues, such as breakage or tarnishing</li>
                </ul>
              </div>

              <div className={styles.carePlanBenefit}>
                <h4 className={styles.carePlanBenefitTitle}>Free Resizing</h4>
                <p className={styles.carePlanText}>
                  We offer resizing services to ensure the ideal fit.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.carePlanFooter}>
            <Button variant="add-to-cart" className={styles.carePlanAddBtn} onClick={handleAddCarePlan}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
