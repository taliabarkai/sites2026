'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import type { IconProps } from '@/src/components/icons/Icon'
import type { CartItem } from '../_context/CartContext'
import { Button } from '../_components/Button'
import { Header } from '../_components/Header'
import { useCart, WARRANTY_CENTS } from '../_context/CartContext'
import { createPlacedOrder, savePlacedOrder, DEMO_CONTACT } from '../_context/placedOrder'
import { getBrandFromPathname, BRAND_GIFT_CONFIG, type BrandKey } from '../_config/brands'
import { prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import { getGiftOptions } from '../_config/giftOptions'
import { DEMO_CART_ITEMS, ERROR_PREVIEW_CART_SIZE } from '../_config/demoCart'
import { GiftingOptions } from '../_components/cart/GiftingOptions'
import { CheckoutConflictAlert } from '../_components/checkout/CheckoutConflictAlert'
import type { GiftAssignment } from '../_components/cart/GiftingOptions'
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
  AiMagicIcon:   React.ComponentType<IconProps>
  WarningIcon:   React.ComponentType<IconProps>
}

const BRAND_ICONS: Record<string, BrandIcons> = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib:  ibIcons,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Express checkout (Apple Pay) and its "or" divider are hidden for now.
 * The markup below is intentionally kept — flip this to true to bring it back.
 */
const SHOW_EXPRESS_CHECKOUT = false

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
  /** Packaging applied to this item, shown as an "Includes:" line below it. */
  gift?:          { name: string; price: number }
}

function CheckoutItemRow({ item, icons, showGuarantee, onAddGift, gift }: CheckoutItemRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const hasOptions = item.selectedOptions && item.selectedOptions.length > 0
  const { ChevronIcon, GiftIcon } = icons

  return (
    <article className={styles.checkoutItem}>
      {/* Spans the row rather than sitting beside the image, so the promise
          reads as a banner over the whole line item. */}
      {showGuarantee && <p className={styles.deliveryGuarantee}>Guaranteed to arrive by Christmas</p>}
      <div className={styles.checkoutItemRow}>
        <div className={styles.itemImageWrap}>
          <img src={item.image} alt={item.name} className={styles.itemImage} />
        </div>
        <div className={styles.itemContent}>
          <div className={styles.itemInfoGroup}>
            <div className={styles.itemTitleRow}>
              <p className={styles.itemName}>{item.name}</p>
              <div className={styles.itemPrices}>
                {item.originalPrice && (
                  <span className={styles.priceOriginal}>{formatPrice(item.originalPrice)}</span>
                )}
                <span className={styles.priceSelling}>{formatPrice(item.price)}</span>
              </div>
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
                  <ChevronIcon size={24} />
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

      {/* Warranty add-on — single line below the item when the plan is selected
          (read-only on checkout: no remove control) */}
      {gift && (
        <div className={styles.summaryGiftRow}>
          <span className={styles.summaryGiftLabel}>
            <strong className={styles.summaryGiftIncludes}>Includes:</strong>
            {gift.name}
            <span className={styles.summaryGiftIcon} aria-hidden="true"><GiftIcon size={24} /></span>
          </span>
          <span className={styles.summaryGiftPrice}>{formatPrice(gift.price)}</span>
        </div>
      )}

      {item.warranty && (
        <div className={styles.warrantyRow}>
          <span className={styles.warrantyLabel}>
            <span className={styles.warrantyPlus} aria-hidden="true">+</span>
            5-Year Protection Plan
          </span>
          <span className={styles.warrantyPrice}>{formatPrice(WARRANTY_CENTS)}</span>
        </div>
      )}
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
  /** Gift packaging, totalled separately from merchandise. */
  giftTotal?:           number
  /** How many items are wrapped — shown beside the label once above one. */
  giftCount?:           number
  /** itemId -> packaging applied to it. */
  giftByItemId?:        Record<string, { name: string; price: number }>
  onOpenGiftModal?:     (itemId: string) => void
}

function OrderSummary({ items, icons, showDetails, subtotal = 0, selectedShipping = 'free', hideHeader, hideBenefits, taxAmount, orderTotalDisplay, onOpenGiftModal, giftByItemId, giftTotal = 0, giftCount = 0 }: OrderSummaryProps) {
  const [promoCode,    setPromoCode]    = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [appliedCode,  setAppliedCode]  = useState('')

  const { ShippingIcon, ReturnIcon, WarrantyIcon, CouponIcon, XIcon } = icons
  const shippingCost   = selectedShipping === 'standard' ? 500 : 0
  const discountAmount = promoApplied ? Math.round(subtotal * 0.20) : 0
  const orderTotal     = subtotal + giftTotal + shippingCost - discountAmount + (taxAmount ?? 0)
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
            gift={giftByItemId?.[item.id]}
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
            {giftTotal > 0 && (
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>
                  Gift packaging{giftCount > 1 ? ` (${giftCount})` : ''}:
                </span>
                <span className={styles.totalValue}>{formatPrice(giftTotal)}</span>
              </div>
            )}
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

// ─── Page Inner ────────────────────────────────────────────────────────────────

function CheckoutPageInner() {
  const pathname     = usePathname()
  const brand        = getBrandFromPathname(pathname)
  const router       = useRouter()
  const searchParams = useSearchParams()

  // Preview-only: ?state=error renders the session-conflict view, so the error
  // can be linked and shared for QA and design review. The real flow is wired
  // to the submit response instead — see the TODO on the alert below.
  const isErrorPreview = searchParams.get('state') === 'error'

  /**
   * Full document load of the same checkout with `state` dropped, so the page
   * genuinely re-reads rather than re-rendering the stale view. A plain
   * reload() would keep ?state=error and bring the alert straight back.
   * Against the real API this becomes a reload of the canonical checkout URL.
   */
  const reloadWithoutConflict = () => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete('state')
    const query = next.toString()
    window.location.href = query ? `${pathname}?${query}` : pathname
  }
  const icons    = BRAND_ICONS[brand]
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const topline  = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  const { items, subtotal, replaceItems } = useCart()

  const isTgr          = brand === 'tgr'
  const brandGiftOptions = getGiftOptions(brand)
  // Printed designs are brand-scoped and shared by every option flagged `designs`.
  const giftDesigns = BRAND_GIFT_CONFIG[brand as BrandKey]?.assets?.designOptions ?? []


  // Gifting assignments live here (lifted out of GiftingOptions) so the order
  // total can reflect them. One assignment per item, keyed by itemId.
  // Warranty lines are not giftable.
  const eligibleGiftItems = items.filter(item =>
    !item.name.toLowerCase().includes('warranty')
  )

  // Demo scenario: on TGR the third cart line carries only the Classic box, so
  // selecting it skips the option list and opens the panel straight away — the
  // same shortcut single-option brands get. Eligibility is per item, so this is
  // expressed as an allow-list on the option the third line cannot use.
  const soloOnlyItemId = brand === 'tgr' ? eligibleGiftItems[2]?.id : undefined

  const [giftAssignments, setGiftAssignments] = useState<GiftAssignment[]>([])

  // ── Step state machine ──────────────────────────────────────────────────────
  // Steps: 1=Contact & Delivery, 2=Shipping Method, 3=Gift Options, 4=Payment
  // Steps 2 and 3 activate simultaneously when step 1 is completed.
  const [activeSteps,    setActiveSteps]    = useState<Set<number>>(new Set([1]))
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // In v2 every step is expanded and nothing is shown as "completed" (collapsed).
  // Flat layout: every step is expanded, nothing is gated behind Continue.
  const isActive    = (_s: number) => true
  const isCompleted = (_s: number) => false

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

  // The error preview is only legible against a filled-in checkout — an empty
  // form would read as a validation error rather than a stale-session one.
  useEffect(() => {
    if (!isErrorPreview) return

    setEmail(DEMO_CONTACT.email)
    setCountry('US')
    setFirstName(DEMO_CONTACT.firstName)
    setLastName(DEMO_CONTACT.lastName)
    setStreetAddress(DEMO_CONTACT.line1)
    setCity(DEMO_CONTACT.city)
    setAddrState(DEMO_CONTACT.state)
    setZipCode(DEMO_CONTACT.zip)
    setPhone(DEMO_CONTACT.phone)

    setPaymentMethod('credit-card')
    setCardName(`${DEMO_CONTACT.firstName} ${DEMO_CONTACT.lastName}`)
    setCardNumber('4242 4242 4242 4242')
    setCardExpiry('04/29')
    setCardCvv('123')
  }, [isErrorPreview])

  // Opened straight from a shared ?state=error link the bag is empty, which
  // would render the conflict over a $0 order. Fill it to the same size the
  // toggle pins the preview to. Only ever seeds an empty cart.
  useEffect(() => {
    if (!isErrorPreview || items.length > 0) return
    replaceItems(DEMO_CART_ITEMS.slice(0, ERROR_PREVIEW_CART_SIZE))
  }, [isErrorPreview, items.length, replaceItems])

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
  // Gift packaging is part of the merchandise subtotal, so it sits inside the
  // taxable base rather than being tacked on after tax.
  const giftTotal      = giftAssignments.reduce(
    (sum, a) => sum + (brandGiftOptions.find(o => o.id === a.optionId)?.price ?? 0), 0)
  const giftedSubtotal = subtotal + giftTotal
  const taxAmount      = isCompleted(1) ? Math.round(giftedSubtotal * 0.08) : null
  const orderTotal     = giftedSubtotal + shippingCost - discountAmount + (taxAmount ?? 0)

  /**
   * Express Apple Pay authorized. Folds the cart and whatever the shopper has
   * filled in into an order, stashes it for the confirmation page, and goes
   * there. Tax is normally only priced once the address is known; express skips
   * that step, so it is computed on the same 8% basis here.
   */
  const handleApplePaySuccess = () => {
    // Nothing to pay for — leave the shopper on checkout rather than sending
    // them to a confirmation page with no order behind it.
    if (items.length === 0) return

    const orderTax = taxAmount ?? Math.round(subtotal * 0.08)

    savePlacedOrder(createPlacedOrder({
      items,
      customer: {
        firstName: firstName.trim() || DEMO_CONTACT.firstName,
        lastName:  lastName.trim()  || DEMO_CONTACT.lastName,
        email:     email.trim()     || DEMO_CONTACT.email,
        phone:     phone.trim()     || DEMO_CONTACT.phone,
      },
      address: {
        line1: [streetAddress.trim() || DEMO_CONTACT.line1, aptSuite.trim()].filter(Boolean).join(', '),
        city:  city.trim()      || DEMO_CONTACT.city,
        state: addrState.trim() || DEMO_CONTACT.state,
        zip:   zipCode.trim()   || DEMO_CONTACT.zip,
      },
      shipping: selectedShipping,
      paymentLabel: 'Apple Pay',
      totals: {
        subtotal,
        shipping: shippingCost,
        promoDiscount: discountAmount,
        tax: orderTax,
        total: subtotal + shippingCost - discountAmount + orderTax,
      },
    }))

    router.push(`/${brand}/thank-you`)
  }

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

  // Packaging shown per item in the order summary.
  const giftByItemId: Record<string, { name: string; price: number }> = {}
  for (const a of giftAssignments) {
    const opt = brandGiftOptions.find(o => o.id === a.optionId)
    if (opt) giftByItemId[a.itemId] = { name: opt.name, price: opt.price }
  }

  const summaryProps = {
    items, icons,
    taxAmount,
    giftByItemId,
    giftTotal,
    giftCount: giftAssignments.length,
  }

  return (
    <div className={styles.page}>

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
            <div className={styles.formCol}>

              {/* Sits in its own section above the bordered step box, not inside it.
                  TODO: replace `isErrorPreview` with the real conflict state once the
                  submit endpoint is live. When POST /checkout/order answers with a
                  session-conflict / stale-version response (409), hold that response
                  in state and render this alert with the server's own title and
                  message, keeping Place Order disabled until the page is re-read. */}
              {isErrorPreview && (
                <CheckoutConflictAlert
                  icons={icons}
                  className={styles.conflictAlert}
                  onRefresh={reloadWithoutConflict}
                />
              )}

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
                preTitle={SHOW_EXPRESS_CHECKOUT ? (
                  <section className={styles.expressCheckout}>
                    <p className={styles.expressTitle}>Express Checkout</p>
                    <div className={styles.expressButtons}>
                      <button type="button" className={styles.expressBtn} aria-label="Pay with Apple Pay" onClick={handleApplePaySuccess}>
                        <img src="/images/payment/ApplePay.svg" alt="Apple Pay" height={20} style={{ filter: 'invert(1)' }} />
                      </button>
                    </div>
                    <div className={styles.expressDivider}><span>or</span></div>
                  </section>
                ) : undefined}
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
              </AccordionStep>

              {/* ── Step 2: Shipping Method ── */}
              <AccordionStep
                title="Shipping Method"
                stepNumber={2}
                isActive={isActive(2)}
                isCompleted={isCompleted(2)}
                completedSummary={step2Summary}
                onEdit={() => editStep(2)}
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

              {/* ── Step 3: Gifting — options-first section ── */}
              <GiftingOptions
                options={brandGiftOptions.map(o => ({
                  id:              o.id,
                  name:            o.name,
                  description:     o.description,
                  longDescription: o.longDescription,
                  price:           o.price,
                  imageUrl:        o.image,
                  designs:         o.designs,
                  wantsName:       o.wantsName,
                  wantsPhoto:      o.wantsPhoto,
                  eligibleItemIds: soloOnlyItemId && o.id === 'personalized-gift-box'
                    ? eligibleGiftItems
                        .filter(i => i.id !== soloOnlyItemId)
                        .map(i => i.id)
                    : undefined,
                }))}
                designs={giftDesigns}
                items={eligibleGiftItems.map(i => ({ id: i.id, name: i.name, imageUrl: i.image }))}
                assignments={giftAssignments}
                onChange={setGiftAssignments}
                icons={{
                  GiftIcon:      icons.GiftIcon,
                  CheckmarkIcon: icons.CheckmarkIcon,
                  XIcon:         icons.XIcon,
                  AiMagicIcon:   icons.AiMagicIcon,
                  TrashCanIcon:  icons.TrashCanIcon,
                  PlusMinusIcon: icons.PlusMinusIcon,
                }}
                onGenerateNote={async () => 'Wishing you a wonderful day filled with joy!'}
              />

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

                      {/* Apply Store Credit — first, above the payment methods */}
                      <div className={styles.storeCreditOptionRow}>
                        <button
                          type="button"
                          className={styles.storeCreditOptionBtn}
                          onClick={() => setApplyStoreCredit(prev => !prev)}
                          aria-expanded={applyStoreCredit}
                        >
                          <span className={`${styles.storeCreditChevron} ${applyStoreCredit ? styles.storeCreditChevronOpen : ''}`}>
                            <ChevronIcon size={24} />
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
                        <ChevronIcon size={24} />
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

                {/* Repeat of the alert, directly above the disabled Place Order
                    button — anyone who scrolled past the first one meets the
                    blocked button here with no other explanation.
                    Not announced: the copy at the top of the form already is. */}
                {isErrorPreview && (
                  <CheckoutConflictAlert
                    icons={icons}
                    announce={false}
                    onRefresh={reloadWithoutConflict}
                  />
                )}

                {/* Place Order */}
                <div className={styles.placeOrderSection}>
                  <Button
                    variant="primary"
                    onClick={() => completeStep(4)}
                    /* A stale checkout cannot be submitted: the newer session has
                       already saved different data, so the order must be re-read. */
                    disabled={
                      isErrorPreview ||
                      paymentMethod === null ||
                      (paymentMethod === 'credit-card' && (!cardNumber.trim() || !cardCvv.trim() || !cardName.trim()))
                    }
                    aria-disabled={isErrorPreview || undefined}
                    className={`${styles.placeOrderButton}${isErrorPreview ? ` ${styles.placeOrderButtonBlocked}` : ''}`}
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


    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function CheckoutPageClient() {
  return <CheckoutPageInner />
}
