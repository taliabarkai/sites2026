'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import type { IconProps } from '@/src/components/icons/Icon'
import type { CartItem } from '../_context/CartContext'
import { Button } from '../_components/Button'
import { Header } from '../_components/Header'
import { useCart } from '../_context/CartContext'
import { getBrandFromPathname } from '../_config/brands'
import { prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import { GiftOptionsModal } from '../_components/FloatingCart/GiftOptionsModal'
import type { SavedGift } from '../_components/FloatingCart/GiftOptionsModal'
import styles from './CheckoutPage.module.css'

// ─── Brand icons ──────────────────────────────────────────────────────────────

interface BrandIcons {
  GiftIcon:      React.ComponentType<IconProps>
  ChevronIcon:   React.ComponentType<IconProps>
  ShippingIcon:  React.ComponentType<IconProps>
  ReturnIcon:    React.ComponentType<IconProps>
  WarrantyIcon:  React.ComponentType<IconProps>
  CheckmarkIcon: React.ComponentType<IconProps>
  DropdownIcon:  React.ComponentType<IconProps>
  PlusMinusIcon: React.ComponentType<IconProps>
  TooltipIcon:   React.ComponentType<IconProps>
  LockIcon:      React.ComponentType<IconProps>
  CouponIcon:    React.ComponentType<IconProps>
  XIcon:         React.ComponentType<IconProps>
  TrashCanIcon:  React.ComponentType<IconProps>
}

const BRAND_ICONS: Record<string, BrandIcons> = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib:  ibIcons,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface UpsellProduct {
  id:             string
  name:           string
  price:          number
  originalPrice?: number
  image:          string
}

const UPSELL_PRODUCTS: UpsellProduct[] = [
  {
    id: 'jewelry-care-kit',
    name: 'Jewelry Care Kit',
    price: 1200,
    image: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-6.jpg',
  },
  {
    id: 'climber-earrings',
    name: 'Climber Earrings',
    price: 2500,
    originalPrice: 5000,
    image: 'https://cdn.oakandluna.com/digital-asset/product/engraved-comprass-necklace-gold-vermeil-1.jpg',
  },
]

// ─── Checkout Gift Options ─────────────────────────────────────────────────────

interface CheckoutGiftOption {
  id:             string
  name:           string
  description:    string
  price:          number
  originalPrice?: number
  image:          string
}

const DEFAULT_GIFT_OPTIONS: CheckoutGiftOption[] = [
  {
    id:          'classic-gift-set',
    name:        'Classic Gift Set',
    description: 'Includes: Gift bag, gift box and a custom note',
    price:       400,
    image:       'https://cdn.oakandluna.com/digital-asset/product/gift-box-25.jpg',
  },
]

const TGR_GIFT_OPTIONS: CheckoutGiftOption[] = [
  {
    id:          'classic-gift-box',
    name:        'Classic Gift Box',
    description: 'Includes: Gift bag, gift box and a custom note',
    price:       400,
    image:       'https://cdn.oakandluna.com/digital-asset/product/gift-box-25.jpg',
  },
  {
    id:          'personalized-gift-box',
    name:        'Personalized Gift Box',
    description: 'Includes: Gift bag, gift box, fabric pouch and a custom note',
    price:       700,
    image:       'https://cdn.oakandluna.com/digital-asset/product/gift-box-25.jpg',
  },
]

// ─── Step Breadcrumb ──────────────────────────────────────────────────────────

interface StepBreadcrumbProps {
  currentStep:    number
  completedSteps: Set<number>
  icons:          BrandIcons
  brand:          string
  onEditStep:     (step: number) => void
}

const BREADCRUMB_STEPS = [
  { n: 1, label: 'Contact & Delivery' },
  { n: 2, label: 'Shipping' },
  { n: 3, label: 'Payment' },
] as const

function StepBreadcrumb({ currentStep, completedSteps, icons, brand, onEditStep }: StepBreadcrumbProps) {
  const { ChevronIcon } = icons

  return (
    <nav className={styles.stepBreadcrumb} aria-label="Checkout steps">
      {/* Cart — always a link back */}
      <span className={styles.stepBreadcrumbItem}>
        <Link
          href={`/${brand}/cart`}
          className={`${styles.stepBreadcrumbLabel} ${styles.stepBreadcrumbCompleted}`}
        >
          Cart
        </Link>
        <span className={styles.stepBreadcrumbSep} aria-hidden="true">
          <ChevronIcon size={12} />
        </span>
      </span>

      {BREADCRUMB_STEPS.map(({ n, label }, i) => {
        const isActive    = n === currentStep
        const isCompleted = completedSteps.has(n)

        return (
          <span key={n} className={styles.stepBreadcrumbItem}>
            {i > 0 && (
              <span className={styles.stepBreadcrumbSep} aria-hidden="true">
                <ChevronIcon size={12} />
              </span>
            )}
            {isCompleted ? (
              <button
                type="button"
                className={`${styles.stepBreadcrumbLabel} ${styles.stepBreadcrumbCompleted}`}
                onClick={() => onEditStep(n)}
                aria-label={`${label}, completed — click to edit`}
              >
                {label}
              </button>
            ) : (
              <span
                className={`${styles.stepBreadcrumbLabel} ${isActive ? styles.stepBreadcrumbActive : styles.stepBreadcrumbLocked}`}
                aria-current={isActive ? 'step' : undefined}
              >
                {label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

// ─── Accordion Step ───────────────────────────────────────────────────────────

interface AccordionStepProps {
  title:             string
  stepNumber:        number
  isActive:          boolean
  isCompleted:       boolean
  completedSummary?: React.ReactNode
  onEdit:            () => void
  children:          React.ReactNode
  preTitle?:         React.ReactNode
  subHeader?:        React.ReactNode
  icon?:             React.ReactNode
  editLabel?:        string
  headerRight?:      React.ReactNode
}

function AccordionStep({ title, stepNumber, isActive, isCompleted, completedSummary, onEdit, children, preTitle, subHeader, icon, editLabel = 'Edit', headerRight }: AccordionStepProps) {
  const prefixedTitle = `${stepNumber}. ${title}`

  if (!isActive && !isCompleted) {
    return (
      <div className={styles.accordionStep} data-step={stepNumber}>
        <div className={styles.accordionLockedCard}>
          <h2 className={styles.accordionLockedTitle}>
            {prefixedTitle}
            {icon && <span className={styles.accordionTitleIcon}>{icon}</span>}
          </h2>
        </div>
      </div>
    )
  }

  if (isCompleted && !isActive) {
    return (
      <div className={styles.accordionStep} data-step={stepNumber}>
        <div className={styles.accordionCompletedCard}>
          <div className={styles.accordionCompletedHeader}>
            <h2 className={styles.accordionCompletedTitle}>
              {prefixedTitle}
              {icon && <span className={styles.accordionTitleIcon}>{icon}</span>}
            </h2>
            <button type="button" className={styles.accordionEditBtn} onClick={onEdit}>{editLabel}</button>
          </div>
          {completedSummary && (
            <div className={styles.accordionCompletedDetails}>{completedSummary}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.accordionStep} data-step={stepNumber}>
      <div className={styles.accordionActiveCard}>
        {preTitle}
        <div className={subHeader ? styles.accordionTitleArea : undefined}>
          <div className={styles.accordionHeader}>
            <h2 className={styles.accordionTitle}>
              {prefixedTitle}
              {icon && <span className={styles.accordionTitleIcon}>{icon}</span>}
            </h2>
            {headerRight && <div className={styles.accordionHeaderRight}>{headerRight}</div>}
          </div>
          {subHeader && <div className={styles.accordionSubHeader}>{subHeader}</div>}
        </div>
        <div className={`${styles.accordionBody}${subHeader ? ` ${styles.accordionBodyWithSubHeader}` : ''}`} data-accordion-body>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Checkout Item Row ────────────────────────────────────────────────────────

interface CheckoutItemRowProps {
  item:           CartItem
  icons:          BrandIcons
  showGuarantee?: boolean
  onAddGift?:     () => void
}

function CheckoutItemRow({ item, icons, showGuarantee, onAddGift }: CheckoutItemRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const hasOptions = item.selectedOptions && item.selectedOptions.length > 0
  const { ChevronIcon } = icons

  return (
    <article className={styles.checkoutItem}>
      <div className={styles.checkoutItemRow}>
        <div className={styles.itemImageWrap}>
          <img src={item.image} alt={item.name} className={styles.itemImage} />
        </div>
        <div className={styles.itemContent}>
          {showGuarantee && <p className={styles.deliveryGuarantee}>Guaranteed to arrive by Christmas</p>}
          <div className={styles.itemInfoGroup}>
            <p className={styles.itemName}>{item.name}</p>
            <div className={styles.itemPrices}>
              {item.originalPrice && (
                <span className={styles.priceOriginal}>{formatPrice(item.originalPrice)}</span>
              )}
              <span className={styles.priceSelling}>{formatPrice(item.price)}</span>
            </div>

            {hasOptions && (
              <button
                type="button"
                className={styles.viewDetailsToggle}
                onClick={() => setDetailsOpen(prev => !prev)}
                aria-expanded={detailsOpen}
              >
                View Details
                <span className={detailsOpen ? styles.chevronOpen : styles.chevronClosed} aria-hidden="true">
                  <ChevronIcon size={16} />
                </span>
              </button>
            )}

            {detailsOpen && hasOptions && (
              <dl className={styles.optionsGrid}>
                {item.selectedOptions!.map(({ label, value }) => (
                  <div key={label} className={styles.optionRow}>
                    <dt className={styles.optionLabel}>{label}:</dt>
                    <dd className={styles.optionValue}>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {onAddGift && (
            <button type="button" className={styles.addGiftLink} onClick={onAddGift}>
              Add gift options
            </button>
          )}

        </div>{/* end itemContent */}
      </div>
    </article>
  )
}

// ─── Upsell Card ──────────────────────────────────────────────────────────────

function UpsellCard({ product, icons }: { product: UpsellProduct; icons: BrandIcons }) {
  return (
    <div className={styles.upsellCard}>
      <div className={styles.upsellImageWrap}>
        <img src={product.image} alt={product.name} className={styles.upsellImage} loading="lazy" />
      </div>
      <p className={styles.upsellName}>{product.name}</p>
      <div className={styles.upsellPrices}>
        {product.originalPrice && (
          <span className={styles.priceOriginal}>{formatPrice(product.originalPrice)}</span>
        )}
        <span className={styles.priceSelling}>{formatPrice(product.price)}</span>
      </div>
      <Button
        variant="upsell-primary"
        trailingIcon={<icons.PlusMinusIcon size={24} />}
        className={styles.upsellButton}
      >
        Add
      </Button>
    </div>
  )
}

// ─── You May Also Like ────────────────────────────────────────────────────────

function _YouMayAlsoLike({ icons }: { icons: BrandIcons }) {
  return (
    <section className={styles.upsellSection} aria-labelledby="upsell-heading">
      <h2 id="upsell-heading" className={styles.sectionTitle}>You May Also Like</h2>
      <div className={styles.upsellGrid}>
        {UPSELL_PRODUCTS.map(product => (
          <UpsellCard key={product.id} product={product} icons={icons} />
        ))}
      </div>
    </section>
  )
}

// ─── Order Summary ────────────────────────────────────────────────────────────

interface OrderSummaryProps {
  items:                CartItem[]
  icons:                BrandIcons
  showDetails?:         boolean
  subtotal?:            number
  selectedShipping?:    'free' | 'standard'
  hideHeader?:          boolean
  hideBenefits?:        boolean
  taxAmount?:           number | null
  orderTotalDisplay?:   number
  onOpenGiftModal?:     (itemId: string) => void
}

function OrderSummary({ items, icons, showDetails, subtotal = 0, selectedShipping = 'free', hideHeader, hideBenefits, taxAmount, orderTotalDisplay, onOpenGiftModal }: OrderSummaryProps) {
  const [promoCode,    setPromoCode]    = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [appliedCode,  setAppliedCode]  = useState('')

  const { ShippingIcon, ReturnIcon, WarrantyIcon, CouponIcon, XIcon } = icons
  const shippingCost   = selectedShipping === 'standard' ? 500 : 0
  const discountAmount = promoApplied ? Math.round(subtotal * 0.20) : 0
  const orderTotal     = subtotal + shippingCost - discountAmount + (taxAmount ?? 0)
  const displayTotal   = orderTotalDisplay ?? orderTotal

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      setAppliedCode(promoCode.trim().toUpperCase())
      setPromoApplied(true)
    }
  }

  const handleRemovePromo = () => {
    setPromoApplied(false)
    setAppliedCode('')
    setPromoCode('')
  }

  return (
    <section className={styles.orderSummary} aria-labelledby="summary-heading">
      {!hideHeader && (
        <div className={styles.summaryHeader}>
          <h2 id="summary-heading" className={styles.summaryTitle}>Order Summary</h2>
          <span className={styles.itemCount}>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>
      )}

      <div className={styles.summaryItems}>
        {items.map(item => (
          <CheckoutItemRow
            key={item.id}
            item={item}
            icons={icons}
            showGuarantee={selectedShipping === 'standard'}
            onAddGift={onOpenGiftModal ? () => onOpenGiftModal(item.id) : undefined}
          />
        ))}
      </div>

      {showDetails && (
        <>
          <div className={styles.promoRow}>
            <span className={styles.promoQuestion}>
              <CouponIcon size={16} />
              Have a promo code?
            </span>
            {promoApplied ? (
              <div className={styles.promoAppliedWrap}>
                <div className={styles.appliedPromoBox}>
                  <span className={styles.appliedPromoIcon}><CouponIcon size={16} /></span>
                  <span className={styles.appliedPromoCode}>{appliedCode}</span>
                  <button type="button" className={styles.removePromoBtn} onClick={handleRemovePromo} aria-label="Remove promo code">
                    <XIcon size={16} />
                  </button>
                </div>
                <p className={styles.promoSuccessMsg}>You saved 20% with this coupon.</p>
              </div>
            ) : (
              <div className={styles.storeCreditRow}>
                <div className={styles.storeCreditInput}>
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                    className={styles.input}
                    aria-label="Promo code"
                  />
                </div>
                <Button variant="primary" className={styles.applyButton} onClick={handleApplyPromo}>Apply</Button>
              </div>
            )}
          </div>

          <div className={styles.totalsRows}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal:</span>
              <span className={styles.totalValue}>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Shipping:</span>
              <span className={styles.totalValue}>
                {selectedShipping === 'free' ? 'Free' : formatPrice(shippingCost)}
              </span>
            </div>
            {promoApplied && (
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Promotional Discounts:</span>
                <span className={styles.promoDiscountValue}>
                  <CouponIcon size={14} />
                  -{formatPrice(discountAmount)}
                </span>
              </div>
            )}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Tax:</span>
              {taxAmount != null
                ? <span className={styles.totalValue}>{formatPrice(taxAmount)}</span>
                : <span className={styles.totalValueMuted}>Not calculated</span>
              }
            </div>
          </div>

          <div className={styles.summaryDivider} />

          <div className={styles.orderTotalRow}>
            <span className={styles.orderTotalLabel}>Order Total:</span>
            <span className={styles.orderTotalValue}>{formatPrice(displayTotal)}</span>
          </div>
          {promoApplied && (
            <p className={styles.savingsNote}>You're saving {formatPrice(discountAmount)} on this order!</p>
          )}

          {!hideBenefits && (
            <>
              <div className={styles.summaryDivider} />
              <ul className={styles.benefits}>
                <li className={styles.benefit}>
                  <span className={styles.benefitIcon}><ShippingIcon size={24} /></span>
                  <span>Free shipping on all orders</span>
                </li>
                <li className={styles.benefit}>
                  <span className={styles.benefitIcon}><ReturnIcon size={24} /></span>
                  <span>60-day extended returns</span>
                </li>
                <li className={styles.benefit}>
                  <span className={styles.benefitIcon}><WarrantyIcon size={24} /></span>
                  <span>2-year warranty</span>
                </li>
              </ul>
            </>
          )}
        </>
      )}
    </section>
  )
}

// ─── Gift Checkbox Row ────────────────────────────────────────────────────────

interface GiftCheckRowProps {
  image:          string
  name:           string
  description?:   string
  price?:         string
  originalPrice?: string
  saved:          boolean
  message?:       string
  onClick:        () => void
  onRemove?:      () => void
  onEdit?:        () => void
  removeIcon?:    React.ReactNode
  isSubOption?:   boolean
}

function GiftCheckRow({ image, name, description, price, originalPrice, saved, message, onClick, onRemove, onEdit, removeIcon, isSubOption = false }: GiftCheckRowProps) {
  if (saved) {
    return (
      <div className={`${styles.giftCheckRow} ${styles.giftCheckRowSaved} ${isSubOption ? styles.giftCheckRowSub : ''}`}>
        <img src={image} alt={name} className={styles.giftCheckThumb} />
        <div className={styles.giftCheckInfo}>
          <span className={styles.giftCheckName}>{name}</span>
          {(originalPrice || price) && (
            <div className={styles.giftSavedPrices}>
              {originalPrice && <span className={styles.giftSavedPriceOriginal}>{originalPrice}</span>}
              {price         && <span className={styles.giftSavedPriceSelling}>{price}</span>}
            </div>
          )}
          {message && message.trim() !== '' && (
            <p className={styles.giftSavedNote}>&ldquo;{message}&rdquo;</p>
          )}
        </div>
        <div className={styles.giftSavedActions}>
          {onRemove && (
            <button type="button" className={styles.giftSavedRemove} onClick={onRemove} aria-label="Remove gift">
              {removeIcon}
            </button>
          )}
          {onEdit && (
            <button type="button" className={styles.giftSavedEdit} onClick={onEdit}>
              Edit
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${styles.giftCheckRow} ${isSubOption ? styles.giftCheckRowSub : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <img src={image} alt={name} className={styles.giftCheckThumb} />
      <div className={styles.giftCheckInfo}>
        <span className={styles.giftCheckName}>{name}</span>
        {description && <span className={styles.giftCheckDesc}>{description}</span>}
        {price       && <span className={styles.giftCheckPrice}>{price}</span>}
      </div>
      <button
        type="button"
        className={styles.giftAddBtn}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        Add
      </button>
    </div>
  )
}

// ─── Page Inner ────────────────────────────────────────────────────────────────

function CheckoutPageInner() {
  const pathname = usePathname()
  const brand    = getBrandFromPathname(pathname)
  const icons    = BRAND_ICONS[brand]
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const topline  = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
  }

  const { items, subtotal } = useCart()

  const isTgr          = brand === 'tgr'
  const brandGiftOptions = isTgr ? TGR_GIFT_OPTIONS : DEFAULT_GIFT_OPTIONS

  // ── Layout version toggle (presentation/demo only) ──────────────────────────
  // v1: accordion — one step open at a time, gated by Continue buttons.
  // v2: flat — all 4 sections expanded at once, no Continue gating.
  const [version, setVersion] = useState<'v1' | 'v2'>('v1')

  // ── Step state machine ──────────────────────────────────────────────────────
  // Steps: 1=Contact & Delivery, 2=Shipping Method, 3=Gift Options, 4=Payment
  // Steps 2 and 3 activate simultaneously when step 1 is completed.
  const [activeSteps,    setActiveSteps]    = useState<Set<number>>(new Set([1]))
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // In v2 every step is expanded and nothing is shown as "completed" (collapsed).
  const isActive    = (s: number) => version === 'v2' || activeSteps.has(s)
  const isCompleted = (s: number) => version === 'v2' ? false : completedSteps.has(s)

  const editStep = (step: number) => {
    if (step === 2) {
      // Editing shipping re-opens both shipping and gift options
      setActiveSteps(new Set([2, 3]))
      setCompletedSteps(prev => { const n = new Set(prev); n.delete(2); n.delete(3); return n })
    } else if (step === 3) {
      // Editing gift options only — shipping stays completed
      setActiveSteps(new Set([3]))
      setCompletedSteps(prev => { const n = new Set(prev); n.delete(3); return n })
    } else {
      setActiveSteps(new Set([step]))
      setCompletedSteps(prev => { const n = new Set(prev); n.delete(step); return n })
    }
  }

  const completeStep = (step: number) => {
    if (step === 1) {
      setCompletedSteps(prev => new Set([...prev, 1]))
      setActiveSteps(new Set([2, 3]))
    } else if (step === 3) {
      // Completing gift options phase also completes shipping
      setCompletedSteps(prev => new Set([...prev, 2, 3]))
      setActiveSteps(new Set([4]))
    } else if (step === 4) {
      setCompletedSteps(prev => new Set([...prev, 4]))
      setActiveSteps(new Set())
    }
  }

  const animateAndComplete = (step: number) => {
    const nextStep = step === 1 ? 2 : step === 3 ? 4 : step + 1
    const stepEl   = document.querySelector(`[data-step="${step}"]`) as HTMLElement | null
    const body     = stepEl?.querySelector('[data-accordion-body]') as HTMLElement | null

    const scrollToNext = () => {
      // Double rAF: first frame lets React flush the re-render, second fires after layout is settled
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const nextEl = document.querySelector(`[data-step="${nextStep}"]`) as HTMLElement | null
          if (!nextEl) return
          // Measure all sticky bars at top of viewport so the title clears them
          let stickyHeight = 0
          document.querySelectorAll('[data-sticky-top]').forEach(el => {
            stickyHeight += (el as HTMLElement).getBoundingClientRect().height
          })
          const top = nextEl.getBoundingClientRect().top + window.scrollY - stickyHeight - 16
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
        })
      })
    }

    if (!body) {
      completeStep(step)
      scrollToNext()
      return
    }

    const DURATION = 300
    const height   = body.scrollHeight

    body.style.overflow   = 'hidden'
    body.style.maxHeight  = `${height}px`
    body.style.opacity    = '1'
    body.style.transition = `max-height ${DURATION}ms ease, opacity ${DURATION}ms ease`

    requestAnimationFrame(() => {
      body.style.maxHeight = '0px'
      body.style.opacity   = '0'

      setTimeout(() => {
        completeStep(step)
        scrollToNext()
      }, DURATION)
    })
  }

  // ── Mobile summary sheet ────────────────────────────────────────────────────
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)

  // ── Gift options modal (floating cart flow) ─────────────────────────────────
  const [giftModalItemId,   setGiftModalItemId]   = useState<string | null>(null)
  const [giftModalOptionId, setGiftModalOptionId] = useState<string | null>(null)

  const openGiftModal = (itemId: string, optionId: string) => {
    setGiftModalOptionId(optionId)
    setGiftModalItemId(itemId)
  }

  // ── Gift options — step 3 ───────────────────────────────────────────────────
  const [itemGiftSelections, setItemGiftSelections] = useState<Record<string, string[]>>({})
  // Custom gift note per selection, keyed by `${itemId}::${optionId}`
  const [itemGiftNotes, setItemGiftNotes] = useState<Record<string, string>>({})
  const [expandedGiftItemId, setExpandedGiftItemId] = useState<string | null>(null)

  const giftNoteKey  = (itemId: string, optionId: string) => `${itemId}::${optionId}`
  const getGiftNote  = (itemId: string, optionId: string) => itemGiftNotes[giftNoteKey(itemId, optionId)]
  const saveGiftNote = (itemId: string, optionId: string, note: string) =>
    setItemGiftNotes(prev => ({ ...prev, [giftNoteKey(itemId, optionId)]: note }))

  const eligibleGiftItems = items.filter(item =>
    !item.name.toLowerCase().includes('warranty')
  )

  const selectGiftForItem = (itemId: string, optionId: string) => {
    setItemGiftSelections(prev => {
      const current = prev[itemId] ?? []
      if (current.includes(optionId)) return prev
      return { ...prev, [itemId]: [...current, optionId] }
    })
  }

  const deselectGiftForItem = (itemId: string, optionId: string) => {
    setItemGiftSelections(prev => ({
      ...prev,
      [itemId]: (prev[itemId] ?? []).filter(id => id !== optionId),
    }))
    setItemGiftNotes(prev => {
      const next = { ...prev }
      delete next[giftNoteKey(itemId, optionId)]
      return next
    })
  }

  const anyGiftSelected = Object.values(itemGiftSelections).some(arr => arr.length > 0)

  // ── Form state ──────────────────────────────────────────────────────────────

  // Contact
  const [email,      setEmail]      = useState('')
  const [emailOptIn, setEmailOptIn] = useState(true)

  // Delivery
  const [country,       setCountry]       = useState('')
  const [firstName,     setFirstName]     = useState('')
  const [lastName,      setLastName]      = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [aptSuite,      setAptSuite]      = useState('')
  const [city,          setCity]          = useState('')
  const [addrState,     setAddrState]     = useState('')
  const [zipCode,       setZipCode]       = useState('')
  const [phone,         setPhone]         = useState('')

  // Shipping
  const [selectedShipping, setSelectedShipping] = useState<'free' | 'standard'>('free')

  // Payment
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [billingFirstName,      setBillingFirstName]      = useState('')
  const [billingLastName,       setBillingLastName]       = useState('')
  const [billingStreetAddress,  setBillingStreetAddress]  = useState('')
  const [billingAptSuite,       setBillingAptSuite]       = useState('')
  const [billingCity,           setBillingCity]           = useState('')
  const [billingState,          setBillingState]          = useState('')
  const [billingZipCode,        setBillingZipCode]        = useState('')
  const [applyStoreCredit,      setApplyStoreCredit]      = useState(false)
  const [storeCreditCode,       setStoreCreditCode]       = useState('')
  const [paymentMethod,    setPaymentMethod]    = useState<'credit-card' | 'paypal' | 'applepay' | null>(null)
  const [promoCode,        setPromoCode]        = useState('')
  const [promoApplied,     setPromoApplied]     = useState(false)
  const [appliedPromoCode, setAppliedPromoCode] = useState('')
  const [cardNumber,       setCardNumber]       = useState('')
  const [cardExpiry,       setCardExpiry]       = useState('')
  const [cardCvv,          setCardCvv]          = useState('')
  const [cardName,         setCardName]         = useState('')
  const [summaryOpen,      setSummaryOpen]      = useState(true)

  const { DropdownIcon, TooltipIcon, CheckmarkIcon, LockIcon, XIcon, CouponIcon, ShippingIcon, ReturnIcon, WarrantyIcon, ChevronIcon } = icons

  const handleApplyMobilePromo = () => {
    if (promoCode.trim()) {
      setAppliedPromoCode(promoCode.trim().toUpperCase())
      setPromoApplied(true)
    }
  }

  const handleRemoveMobilePromo = () => {
    setPromoApplied(false)
    setAppliedPromoCode('')
    setPromoCode('')
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const shippingCost   = selectedShipping === 'standard' ? 500 : 0
  const discountAmount = promoApplied ? Math.round(subtotal * 0.20) : 0
  const taxAmount      = isCompleted(1) ? Math.round(subtotal * 0.08) : null
  const orderTotal     = subtotal + shippingCost - discountAmount + (taxAmount ?? 0)

  const step1Valid = email.trim() !== '' && firstName.trim() !== '' && lastName.trim() !== ''
    && streetAddress.trim() !== '' && city.trim() !== '' && addrState.trim() !== '' && zipCode.trim() !== ''

  const step1Summary = (
    <div className={styles.completedGroup}>
      <div className={styles.completedSection}>
        <span className={styles.completedLabel}>Contact</span>
        <span className={styles.completedValue}>{email}</span>
      </div>
      <div className={styles.completedSection}>
        <span className={styles.completedLabel}>Deliver to</span>
        <span className={styles.completedValue}>{country}</span>
        <span className={styles.completedValue}>{firstName} {lastName}</span>
        <span className={styles.completedValue}>{streetAddress}{aptSuite ? `, ${aptSuite}` : ''}</span>
        <span className={styles.completedValue}>{city}, {addrState} {zipCode}</span>
        <span className={styles.completedValue}>{phone}</span>
      </div>
    </div>
  )
  const step2Summary = (
    <div className={styles.completedGroup}>
      <div className={styles.completedSection}>
        <div className={styles.completedLabelRow}>
          <span className={styles.completedLabel}>
            {selectedShipping === 'free' ? 'Free Shipping' : 'Standard Shipping'}
          </span>
          <span className={styles.completedLabel}>
            {selectedShipping === 'free' ? 'FREE' : formatPrice(shippingCost)}
          </span>
        </div>
        <span className={styles.completedValue}>
          {selectedShipping === 'free' ? 'Arrives 6-8 business days after production time' : 'Arrives 4-6 business days after production time'}
        </span>
      </div>
    </div>
  )
  const giftSelectedCount = Object.values(itemGiftSelections).filter(arr => arr.length > 0).length
  const step3Summary = anyGiftSelected ? (
    <div className={styles.completedGroup}>
      <div className={styles.completedSection}>
        <span className={styles.completedLabel}>Gift Options</span>
        <span className={styles.completedValue}>
          {eligibleGiftItems.length > 1
            ? `Gift added to ${giftSelectedCount} of ${eligibleGiftItems.length} items`
            : (itemGiftSelections[eligibleGiftItems[0]?.id ?? ''] ?? [])
                .map(id => brandGiftOptions.find(o => o.id === id)?.name ?? '')
                .filter(Boolean)
                .join(', ')}
        </span>
      </div>
    </div>
  ) : undefined
  const step4Summary = (
    <div className={styles.completedGroup}>
      <div className={styles.completedSection}>
        <span className={styles.completedLabel}>Payment method</span>
        <span className={styles.completedValue}>
          {paymentMethod === 'credit-card' ? 'Credit Card' : paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'applepay' ? 'Apple Pay' : 'Not selected'}
        </span>
      </div>
    </div>
  )

  const summaryProps = {
    items, icons,
    taxAmount,
  }

  return (
    <div className={styles.page}>
      {/* Layout version switcher — presentation/demo only */}
      <div className={styles.versionToggle} role="group" aria-label="Checkout layout version">
        {(['v1', 'v2'] as const).map(v => (
          <button
            key={v}
            type="button"
            className={`${styles.versionToggleBtn} ${version === v ? styles.versionToggleBtnActive : ''}`}
            onClick={() => setVersion(v)}
            aria-pressed={version === v}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.checkoutHeaderWrap} data-sticky-top>
        <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />
      </div>

      {/* Mobile sticky order summary bar — top, below header */}
      <div className={styles.mobileSummaryTopBar} data-sticky-top onClick={() => setMobileSummaryOpen(true)} role="button" tabIndex={0} aria-label="View order summary" onKeyDown={e => e.key === 'Enter' && setMobileSummaryOpen(true)}>
        <div className={styles.mobileSummaryTopBarInner}>
          <div className={styles.mobileSummaryTopBarLeft}>
            <span className={styles.mobileSummaryTopBarTitle}>Order Summary</span>
            <span className={styles.mobileSummaryTopBarCount}>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>
          <div className={styles.mobileSummaryTopBarRight}>
            <span className={styles.mobileSummaryTopBarPrice}>{formatPrice(orderTotal)}</span>
            <span className={`${styles.mobileSummaryTopBarChevron} ${mobileSummaryOpen ? styles.mobileSummaryTopBarChevronOpen : ''}`}>
              <DropdownIcon size={24} />
            </span>
          </div>
        </div>
      </div>

      {/* Mobile summary backdrop */}
      <div
        className={`${styles.mobileSummaryOverlay} ${mobileSummaryOpen ? styles.mobileSummaryOverlayVisible : ''}`}
        aria-hidden="true"
        onClick={() => setMobileSummaryOpen(false)}
      />

      {/* Mobile summary bottom sheet */}
      <div className={`${styles.mobileSummarySheet} ${mobileSummaryOpen ? styles.mobileSummarySheetOpen : ''}`} role="dialog" aria-label="Order summary">
        <div className={styles.mobileSummarySheetHeader}>
          <h2 className={styles.mobileSummarySheetTitle}>Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})</h2>
          <button type="button" className={styles.mobileSummarySheetClose} aria-label="Close order summary" onClick={() => setMobileSummaryOpen(false)}>
            <XIcon size={24} />
          </button>
        </div>
        <div className={styles.mobileSummarySheetBody}>
          <OrderSummary {...summaryProps} hideHeader showDetails hideBenefits subtotal={subtotal} selectedShipping={selectedShipping} orderTotalDisplay={orderTotal} />
        </div>
      </div>

      <main id="main-content" className={styles.main}>
        <div className={styles.pageInner}>
          <div className={styles.layout}>

            {/* ══════════════ LEFT COLUMN ══════════════ */}
            <div className={styles.leftCol}>

              {/* Step breadcrumb — hidden via CSS, kept for accessibility */}
              <StepBreadcrumb
                currentStep={[...activeSteps][0] ?? 1}
                completedSteps={completedSteps}
                icons={icons}
                brand={brand}
                onEditStep={editStep}
              />

              {/* ── Step 1: Contact & Delivery ── */}
              <AccordionStep
                title="Contact & Delivery"
                stepNumber={1}
                isActive={isActive(1)}
                isCompleted={isCompleted(1)}
                completedSummary={step1Summary}
                onEdit={() => editStep(1)}
                preTitle={
                  <section className={styles.expressCheckout}>
                    <p className={styles.expressTitle}>Express Checkout</p>
                    <div className={styles.expressButtons}>
                      <button type="button" className={styles.expressBtn} aria-label="Pay with Apple Pay">
                        <img src="/images/payment/ApplePay.svg" alt="Apple Pay" height={20} style={{ filter: 'invert(1)' }} />
                      </button>
                    </div>
                    <div className={styles.expressDivider}><span>or</span></div>
                  </section>
                }
              >
                {/* Contact */}
                <div className={styles.formSubSection}>
                  <div className={styles.formSubHead}>
                    <h3 className={styles.formSubTitle}>Contact</h3>
                    <p className={styles.sectionSubtitle}>(Notifications will be sent to this email)</p>
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldWrap}>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={styles.input}
                        aria-label="Email address"
                        autoComplete="email"
                      />
                    </div>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={emailOptIn}
                        onChange={e => setEmailOptIn(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>
                        Yes, email me special offers and 20% off my next purchase!{' '}
                        <a href="#" className={styles.inlineLink}>Mailing Conditions</a>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Delivery */}
                <div className={styles.formSubSection}>
                  <h3 className={styles.formSubTitle}>Deliver to</h3>
                  <div className={styles.fieldGroup}>
                    <div className={styles.fieldWrap}>
                      <select
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className={styles.select}
                        aria-label="Country"
                      >
                        <option value="" disabled hidden>Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="IL">Israel</option>
                      </select>
                      <span className={styles.selectIcon} aria-hidden="true">
                        <DropdownIcon size={24} />
                      </span>
                    </div>

                    <div className={styles.twoCol}>
                      <div className={styles.fieldWrap}>
                        <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className={styles.input} aria-label="First name" autoComplete="given-name" />
                      </div>
                      <div className={styles.fieldWrap}>
                        <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className={styles.input} aria-label="Last name" autoComplete="family-name" />
                      </div>
                    </div>

                    <div className={styles.fieldWrap}>
                      <input type="text" placeholder="Street Address" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} className={styles.input} aria-label="Street address" autoComplete="address-line1" />
                    </div>

                    <div className={styles.fieldWrap}>
                      <input type="text" placeholder="Apt, suite, unit, building (optional)" value={aptSuite} onChange={e => setAptSuite(e.target.value)} className={styles.input} aria-label="Apartment, suite (optional)" autoComplete="address-line2" />
                    </div>

                    <div className={styles.fieldWrap}>
                      <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} className={styles.input} aria-label="City" autoComplete="address-level2" />
                    </div>

                    <div className={styles.twoCol}>
                      <div className={styles.fieldWrap}>
                        <input type="text" placeholder="State" value={addrState} onChange={e => setAddrState(e.target.value)} className={styles.input} aria-label="State" autoComplete="address-level1" />
                      </div>
                      <div className={styles.fieldWrap}>
                        <input type="text" placeholder="Zip Code" value={zipCode} onChange={e => setZipCode(e.target.value)} className={styles.input} aria-label="Zip code" autoComplete="postal-code" />
                      </div>
                    </div>

                    <div className={styles.fieldWrap}>
                      <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className={styles.input} aria-label="Phone number" autoComplete="tel" />
                    </div>
                    <p className={styles.sectionSubtitle}>(Delivery notifications will be sent to this number)</p>
                  </div>
                </div>

                {version === 'v1' && (
                  <div className={styles.stepContinueRow}>
                    <Button variant="primary" className={styles.continueBtn} disabled={!step1Valid} onClick={() => animateAndComplete(1)}>
                      Continue
                    </Button>
                  </div>
                )}
              </AccordionStep>

              {/* ── Step 2: Shipping Method ── */}
              <AccordionStep
                title="Shipping Method"
                stepNumber={2}
                isActive={isActive(2)}
                isCompleted={isCompleted(2)}
                completedSummary={step2Summary}
                onEdit={() => editStep(2)}
                subHeader={
                  <div className={styles.shippingInsurance}>
                    <span className={styles.insuranceIcon}><CheckmarkIcon size={24} /></span>
                    <span className={styles.checkboxText}>All methods are tracked &amp; insured</span>
                  </div>
                }
              >
                <div className={styles.shippingOptions} role="radiogroup" aria-label="Shipping method">
                  <label className={`${styles.shippingOption} ${selectedShipping === 'free' ? styles.shippingOptionSelected : ''}`}>
                    <input type="radio" name="shippingMethod" value="free" checked={selectedShipping === 'free'} onChange={() => setSelectedShipping('free')} className={styles.radioInput} />
                    <div className={styles.shippingOptionContent}>
                      <div className={styles.shippingOptionInfo}>
                        <span className={styles.shippingOptionName}>Free Shipping</span>
                        <span className={styles.shippingOptionDate}>Arrives 6-8 business days after production time</span>
                      </div>
                      <span className={styles.shippingOptionPrice}>FREE</span>
                    </div>
                  </label>

                  <label className={`${styles.shippingOption} ${selectedShipping === 'standard' ? styles.shippingOptionSelected : ''}`}>
                    <input type="radio" name="shippingMethod" value="standard" checked={selectedShipping === 'standard'} onChange={() => setSelectedShipping('standard')} className={styles.radioInput} />
                    <div className={styles.shippingOptionContent}>
                      <div className={styles.shippingOptionInfo}>
                        <span className={styles.shippingOptionName}>Standard Shipping</span>
                        <p className={styles.shippingOptionGuarantee}>Guaranteed to arrive by Christmas</p>
                        <span className={styles.shippingOptionDate}>Arrives 4-6 business days after production time</span>
                      </div>
                      <span className={styles.shippingOptionPrice}>$5</span>
                    </div>
                  </label>
                </div>

                <div className={styles.carriersRow}>
                  <img src="/images/carriers/ups.svg"   alt="UPS"   className={styles.carrierLogo} />
                  <img src="/images/carriers/usps.svg"  alt="USPS"  className={styles.carrierLogo} />
                  <img src="/images/carriers/fedex.svg" alt="FedEx" className={styles.carrierLogo} />
                  <img src="/images/carriers/dhl.svg"   alt="DHL"   className={styles.carrierLogo} />
                </div>
              </AccordionStep>

              {/* ── Step 3: Gift Options ── */}
              <AccordionStep
                title="Add Gifting Options"
                stepNumber={3}
                isActive={isActive(3)}
                isCompleted={isCompleted(3)}
                completedSummary={step3Summary}
                onEdit={() => editStep(3)}
                icon={<icons.GiftIcon size={32} />}
                editLabel={anyGiftSelected ? 'Edit' : 'Add'}
              >
                {/* Gift options — brand-aware checkbox row layout */}
                <div className={styles.giftRowList}>
                  {isTgr ? (
                    eligibleGiftItems.length === 1 ? (
                      /* TGR, 1 item — show both gift option rows; each independently selectable */
                      brandGiftOptions.map(option => {
                        const itemId  = eligibleGiftItems[0]?.id ?? ''
                        const isSaved = (itemGiftSelections[itemId] ?? []).includes(option.id)
                        return (
                          <GiftCheckRow
                            key={option.id}
                            image={option.image}
                            name={option.name}
                            description={option.description}
                            price={formatPrice(option.price)}
                            saved={isSaved}
                            message={getGiftNote(itemId, option.id)}
                            onClick={() => openGiftModal(itemId, option.id)}
                            onRemove={() => deselectGiftForItem(itemId, option.id)}
                            onEdit={() => openGiftModal(itemId, option.id)}
                            removeIcon={<icons.TrashCanIcon size={24} />}
                          />
                        )
                      })
                    ) : (
                      /* TGR, 2+ items — item rows that expand inline to reveal options */
                      eligibleGiftItems.map(item => {
                        const isExpanded = expandedGiftItemId === item.id
                        return (
                          <div key={item.id} className={styles.giftItemExpandRow}>
                            <GiftCheckRow
                              image={item.image}
                              name={item.name}
                              saved={false}
                              onClick={() => setExpandedGiftItemId(isExpanded ? null : item.id)}
                            />
                            {isExpanded && (
                              <div className={styles.giftSubOptions}>
                                {brandGiftOptions.map(option => {
                                  const isSaved = (itemGiftSelections[item.id] ?? []).includes(option.id)
                                  return (
                                    <GiftCheckRow
                                      key={option.id}
                                      image={option.image}
                                      name={option.name}
                                      description={option.description}
                                      price={formatPrice(option.price)}
                                      saved={isSaved}
                                      message={getGiftNote(item.id, option.id)}
                                      onClick={() => openGiftModal(item.id, option.id)}
                                      onRemove={() => deselectGiftForItem(item.id, option.id)}
                                      onEdit={() => openGiftModal(item.id, option.id)}
                                      removeIcon={<icons.TrashCanIcon size={24} />}
                                      isSubOption
                                    />
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )
                  ) : (
                    eligibleGiftItems.length === 1 ? (
                      /* Non-TGR, 1 item — show the single gift option row */
                      (() => {
                        const itemId  = eligibleGiftItems[0]?.id ?? ''
                        const isSaved = (itemGiftSelections[itemId] ?? []).length > 0
                        return (
                          <GiftCheckRow
                            image={brandGiftOptions[0].image}
                            name={brandGiftOptions[0].name}
                            description={brandGiftOptions[0].description}
                            price={formatPrice(brandGiftOptions[0].price)}
                            saved={isSaved}
                            message={getGiftNote(itemId, brandGiftOptions[0].id)}
                            onClick={() => openGiftModal(itemId, brandGiftOptions[0].id)}
                            onRemove={() => deselectGiftForItem(itemId, brandGiftOptions[0].id)}
                            onEdit={() => openGiftModal(itemId, brandGiftOptions[0].id)}
                            removeIcon={<icons.TrashCanIcon size={24} />}
                          />
                        )
                      })()
                    ) : (
                      /* Non-TGR, 2+ items — one row per cart item */
                      eligibleGiftItems.map(item => {
                        const isSaved = (itemGiftSelections[item.id] ?? []).length > 0
                        return (
                          <GiftCheckRow
                            key={item.id}
                            image={item.image}
                            name={item.name}
                            saved={isSaved}
                            message={getGiftNote(item.id, brandGiftOptions[0].id)}
                            onClick={() => openGiftModal(item.id, brandGiftOptions[0].id)}
                            onRemove={() => deselectGiftForItem(item.id, brandGiftOptions[0].id)}
                            onEdit={() => openGiftModal(item.id, brandGiftOptions[0].id)}
                            removeIcon={<icons.TrashCanIcon size={24} />}
                          />
                        )
                      })
                    )
                  )}
                </div>


                {version === 'v1' && (
                  <div className={styles.stepContinueRow}>
                    <Button variant="primary" className={styles.continueBtn} onClick={() => animateAndComplete(3)}>
                      Continue
                    </Button>
                  </div>
                )}
              </AccordionStep>

              {/* ── Step 4: Payment ── */}
              <AccordionStep
                title="Payment"
                stepNumber={4}
                isActive={isActive(4)}
                isCompleted={isCompleted(4)}
                completedSummary={step4Summary}
                onEdit={() => editStep(4)}
                headerRight={
                  <div className={styles.secureBadge}>
                    <LockIcon size={24} />
                    <span className={styles.secureBadgeText}>Secure</span>
                  </div>
                }
              >
                {/* Billing Address */}
                <div className={styles.formSubSection}>
                  <h3 className={styles.formSubTitle}>Billing Address</h3>
                  <div className={styles.fieldGroup}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" checked={billingSameAsShipping} onChange={e => setBillingSameAsShipping(e.target.checked)} className={styles.checkbox} />
                      <span className={styles.checkboxText}>Billing matches shipping address</span>
                    </label>
                    {!billingSameAsShipping && (
                      <div className={styles.fieldGroup}>
                        <div className={styles.twoCol}>
                          <div className={styles.fieldWrap}>
                            <input type="text" placeholder="First Name" value={billingFirstName} onChange={e => setBillingFirstName(e.target.value)} className={styles.input} aria-label="Billing first name" autoComplete="billing given-name" />
                          </div>
                          <div className={styles.fieldWrap}>
                            <input type="text" placeholder="Last Name" value={billingLastName} onChange={e => setBillingLastName(e.target.value)} className={styles.input} aria-label="Billing last name" autoComplete="billing family-name" />
                          </div>
                        </div>
                        <div className={styles.fieldWrap}>
                          <input type="text" placeholder="Street Address" value={billingStreetAddress} onChange={e => setBillingStreetAddress(e.target.value)} className={styles.input} aria-label="Billing street address" autoComplete="billing address-line1" />
                        </div>
                        <div className={styles.fieldWrap}>
                          <input type="text" placeholder="Apt, suite (optional)" value={billingAptSuite} onChange={e => setBillingAptSuite(e.target.value)} className={styles.input} aria-label="Billing apt, suite" autoComplete="billing address-line2" />
                        </div>
                        <div className={styles.fieldWrap}>
                          <input type="text" placeholder="City" value={billingCity} onChange={e => setBillingCity(e.target.value)} className={styles.input} aria-label="Billing city" autoComplete="billing address-level2" />
                        </div>
                        <div className={styles.twoCol}>
                          <div className={styles.fieldWrap}>
                            <input type="text" placeholder="State" value={billingState} onChange={e => setBillingState(e.target.value)} className={styles.input} aria-label="Billing state" autoComplete="billing address-level1" />
                          </div>
                          <div className={styles.fieldWrap}>
                            <input type="text" placeholder="Zip Code" value={billingZipCode} onChange={e => setBillingZipCode(e.target.value)} className={styles.input} aria-label="Billing zip code" autoComplete="billing postal-code" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Options */}
                <div className={styles.formSubSection}>
                  <h3 className={styles.formSubTitle}>Payment options</h3>
                  <div className={styles.fieldGroup}>
                    <div className={styles.paymentOptions} role="radiogroup" aria-label="Payment method">

                      {/* Credit Card — expandable fields when selected */}
                      <div className={styles.paymentOptionGroup}>
                        <label className={`${styles.paymentOption} ${paymentMethod === 'credit-card' ? styles.paymentOptionSelected : ''}`} onClick={e => { e.preventDefault(); setPaymentMethod(paymentMethod === 'credit-card' ? null : 'credit-card') }}>
                          <input type="radio" name="paymentMethod" value="credit-card" checked={paymentMethod === 'credit-card'} onChange={() => {}} className={styles.radioInputHidden} />
                          <span className={`${styles.customRadio} ${paymentMethod === 'credit-card' ? styles.customRadioSelected : ''}`} />
                          <span className={styles.paymentOptionName}>Credit Card</span>
                          <span className={styles.paymentOptionIcons}><img src="/images/payment/creditcard.svg" alt="Credit card" height={24} /></span>
                        </label>
                        {paymentMethod === 'credit-card' && (
                          <div className={styles.cardFields}>
                            <div className={styles.fieldWrap}>
                              <input type="text" placeholder="Credit card number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className={styles.input} aria-label="Credit card number" autoComplete="cc-number" />
                            </div>
                            <div className={styles.cardExpiryRow}>
                              <div className={styles.fieldWrap}>
                                <input type="text" placeholder="Expiry (MM / YY)" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className={styles.input} aria-label="Expiry date" autoComplete="cc-exp" />
                              </div>
                              <div className={styles.fieldWrap}>
                                <input type="text" placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className={styles.input} aria-label="CVV" autoComplete="cc-csc" maxLength={4} />
                              </div>
                            </div>
                            <div className={styles.fieldWrap}>
                              <input type="text" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} className={styles.input} aria-label="Name on card" autoComplete="cc-name" />
                            </div>
                          </div>
                        )}
                      </div>

                      <label className={`${styles.paymentOption} ${paymentMethod === 'paypal' ? styles.paymentOptionSelected : ''}`} onClick={e => { e.preventDefault(); setPaymentMethod(paymentMethod === 'paypal' ? null : 'paypal') }}>
                        <input type="radio" name="paymentMethod" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => {}} className={styles.radioInputHidden} />
                        <span className={`${styles.customRadio} ${paymentMethod === 'paypal' ? styles.customRadioSelected : ''}`} />
                        <span className={styles.paymentOptionName}>PayPal</span>
                        <span className={styles.paymentOptionIcons}><img src="/images/payment/PayPal.svg" alt="PayPal" height={24} /></span>
                      </label>

                      <label className={`${styles.paymentOption} ${paymentMethod === 'applepay' ? styles.paymentOptionSelected : ''}`} onClick={e => { e.preventDefault(); setPaymentMethod(paymentMethod === 'applepay' ? null : 'applepay') }}>
                        <input type="radio" name="paymentMethod" value="applepay" checked={paymentMethod === 'applepay'} onChange={() => {}} className={styles.radioInputHidden} />
                        <span className={`${styles.customRadio} ${paymentMethod === 'applepay' ? styles.customRadioSelected : ''}`} />
                        <span className={styles.paymentOptionName}>ApplePay</span>
                        <span className={styles.paymentOptionIcons}><img src="/images/payment/ApplePay.svg" alt="Apple Pay" height={24} /></span>
                      </label>

                      {/* Apply Store Credit — expandable row */}
                      <div className={styles.storeCreditOptionRow}>
                        <button
                          type="button"
                          className={styles.storeCreditOptionBtn}
                          onClick={() => setApplyStoreCredit(prev => !prev)}
                          aria-expanded={applyStoreCredit}
                        >
                          <span className={`${styles.storeCreditChevron} ${applyStoreCredit ? styles.storeCreditChevronOpen : ''}`}>
                            <ChevronIcon size={16} />
                          </span>
                          <span className={styles.paymentOptionName}>Apply Store Credit</span>
                        </button>
                        {applyStoreCredit && (
                          <div className={styles.storeCreditExpandedRow}>
                            <div className={styles.storeCreditInput}>
                              <input type="text" placeholder="Please enter code" value={storeCreditCode} onChange={e => setStoreCreditCode(e.target.value)} className={styles.input} aria-label="Store credit code" />
                            </div>
                            <Button variant="primary" className={styles.applyButton}>Apply</Button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Order Summary — collapsible, mobile only */}
                <div className={styles.paymentOrderSummary}>
                  <button
                    type="button"
                    className={styles.paymentSummaryHeader}
                    onClick={() => setSummaryOpen(prev => !prev)}
                    aria-expanded={summaryOpen}
                  >
                    <div className={styles.paymentSummaryHeaderLeft}>
                      <span className={`${styles.summaryToggleChevron} ${summaryOpen ? styles.summaryToggleChevronOpen : ''}`}>
                        <ChevronIcon size={16} />
                      </span>
                      <span className={styles.paymentSummaryTitle}>Order Summary</span>
                    </div>
                    <span className={styles.itemCount}>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                  </button>

                  {summaryOpen && (
                    <div className={styles.paymentSummaryBody}>
                      <div className={styles.promoRow}>
                        <span className={styles.promoQuestion}>Have a promo code?</span>
                        {promoApplied ? (
                          <div className={styles.promoAppliedWrap}>
                            <div className={styles.appliedPromoBox}>
                              <span className={styles.appliedPromoIcon}><CouponIcon size={16} /></span>
                              <span className={styles.appliedPromoCode}>{appliedPromoCode}</span>
                              <button type="button" className={styles.removePromoBtn} onClick={handleRemoveMobilePromo} aria-label="Remove promo code">
                                <XIcon size={16} />
                              </button>
                            </div>
                            <p className={styles.promoSuccessMsg}>You saved 20% with this coupon.</p>
                          </div>
                        ) : (
                          <div className={styles.storeCreditRow}>
                            <div className={styles.storeCreditInput}>
                              <input
                                type="text"
                                placeholder="Promo"
                                value={promoCode}
                                onChange={e => setPromoCode(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleApplyMobilePromo()}
                                className={styles.input}
                                aria-label="Promo code"
                              />
                            </div>
                            <Button variant="primary" className={styles.applyButton} onClick={handleApplyMobilePromo}>Apply</Button>
                          </div>
                        )}
                      </div>

                      <div className={styles.totalsRows}>
                        <div className={styles.totalRow}>
                          <span className={styles.totalLabel}>Subtotal:</span>
                          <span className={styles.totalValue}>{formatPrice(subtotal)}</span>
                        </div>
                        <div className={styles.totalRow}>
                          <span className={styles.totalLabel}>Shipping:</span>
                          <span className={styles.totalValue}>
                            {selectedShipping === 'free' ? 'Free' : formatPrice(shippingCost)}
                          </span>
                        </div>
                        {promoApplied && (
                          <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>Promotional Discounts:</span>
                            <span className={styles.promoDiscountValue}>
                              <CouponIcon size={14} />
                              -{formatPrice(discountAmount)}
                            </span>
                          </div>
                        )}
                        <div className={styles.totalRow}>
                          <span className={styles.totalLabel}>Tax:</span>
                          {taxAmount != null
                            ? <span className={styles.totalValue}>{formatPrice(taxAmount)}</span>
                            : <span className={styles.totalValueMuted}>Not calculated</span>
                          }
                        </div>
                      </div>

                      <div className={styles.summaryDivider} />

                      <div className={styles.orderTotalRow}>
                        <span className={styles.orderTotalLabel}>Order Total:</span>
                        <span className={styles.orderTotalValue}>{formatPrice(orderTotal)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Place Order */}
                <div className={styles.placeOrderSection}>
                  <Button
                    variant="primary"
                    className={styles.placeOrderButton}
                    onClick={() => completeStep(4)}
                    disabled={
                      paymentMethod === null ||
                      (paymentMethod === 'credit-card' && (!cardNumber.trim() || !cardCvv.trim() || !cardName.trim()))
                    }
                    style={
                      paymentMethod === 'paypal'   ? { background: '#0070BA', color: '#fff', borderColor: '#0070BA' } :
                      paymentMethod === 'applepay' ? { background: '#000000', color: '#fff', borderColor: '#000000' } :
                      undefined
                    }
                  >
                    {paymentMethod === 'paypal' ? 'Log in with PayPal' :
                     paymentMethod === 'applepay' ? (
                       <span className={styles.applePayBtnContent}>
                         Continue with
                         <img src="/images/payment/ApplePay.svg" alt="Apple Pay" className={styles.applePayBtnLogo} />
                       </span>
                     ) : 'Place Order'}
                  </Button>
                </div>
                {promoApplied && (
                  <p className={`${styles.savingsNote} ${styles.paymentSavingsNote}`}>You're saving {formatPrice(discountAmount)} on this order!</p>
                )}

                {/* Perks — mobile only, below CTA */}
                <ul className={styles.paymentPerks}>
                  <li className={styles.benefit}>
                    <span className={styles.benefitIcon}><ShippingIcon size={24} /></span>
                    <span>Free shipping on all orders</span>
                  </li>
                  <li className={styles.benefit}>
                    <span className={styles.benefitIcon}><ReturnIcon size={24} /></span>
                    <span>60-day extended returns</span>
                  </li>
                  <li className={styles.benefit}>
                    <span className={styles.benefitIcon}><WarrantyIcon size={24} /></span>
                    <span>2-year warranty</span>
                  </li>
                </ul>

              </AccordionStep>

              {/* You May Also Like — mobile (hidden) */}

            </div>
            {/* ══════════════ END LEFT COLUMN ══════════════ */}

            {/* ══════════════ RIGHT COLUMN ══════════════ */}
            <aside className={styles.rightCol}>
              <div className={styles.orderSummaryDesktop}>
                <OrderSummary {...summaryProps} showDetails subtotal={subtotal} selectedShipping={selectedShipping} />
              </div>
              {/* You May Also Like — desktop (hidden) */}
            </aside>
            {/* ══════════════ END RIGHT COLUMN ══════════════ */}

          </div>

          <footer className={styles.pageFooter}>
            <p className={styles.footerHelp}>
              Need some help?{' '}
              <a href="#" className={styles.footerLink}>Contact us</a>
              {' '}now and we'll be able to assist you!
            </p>
            <Link href={`/${brand}/cart`} className={styles.returnLink}>
              Return to Shopping Bag
            </Link>
            <p className={styles.copyright}>
              Copyright &copy; 2026 Oak and Luna | All rights reserved
            </p>
          </footer>

        </div>
      </main>

      {giftModalItemId !== null && (
        <GiftOptionsModal
          onClose={() => { setGiftModalItemId(null); setGiftModalOptionId(null) }}
          onAddToCart={(gift: SavedGift) => {
            if (giftModalItemId && giftModalOptionId) {
              selectGiftForItem(giftModalItemId, giftModalOptionId)
              saveGiftNote(giftModalItemId, giftModalOptionId, gift.note)
            }
            setGiftModalItemId(null)
            setGiftModalOptionId(null)
          }}
          onGenerateGiftNote={async () => 'Wishing you a wonderful day filled with joy!'}
        />
      )}

    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function CheckoutPageClient() {
  return <CheckoutPageInner />
}
