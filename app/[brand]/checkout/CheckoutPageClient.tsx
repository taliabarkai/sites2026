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
import { useCart } from '../_context/CartContext'
import type { CartItem } from '../_context/CartContext'
import { Button } from '../_components/Button'
import { Header } from '../_components/Header'
import { GiftOptionsModal } from '../_components/FloatingCart/GiftOptionsModal'
import type { SavedGift } from '../_components/FloatingCart/GiftOptionsModal'
import { GiftPackagingPanel } from '../_components/GiftPackagingPanel/GiftPackagingPanel'
import { getBrandFromPathname, getGiftOptionsMode, getBrandGiftAssets } from '../_config/brands'
import { prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
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
  title:            string
  isActive:         boolean
  isCompleted:      boolean
  completedSummary?: React.ReactNode
  onEdit:           () => void
  children:         React.ReactNode
}

function AccordionStep({ title, isActive, isCompleted, completedSummary, onEdit, children }: AccordionStepProps) {
  if (!isActive && !isCompleted) return null

  if (isCompleted && !isActive) {
    return (
      <div className={styles.accordionStep}>
        <div className={styles.accordionCompletedCard}>
          <div className={styles.accordionCompletedHeader}>
            <h2 className={styles.accordionCompletedTitle}>{title}</h2>
            <button type="button" className={styles.accordionEditBtn} onClick={onEdit}>Edit</button>
          </div>
          {completedSummary && (
            <div className={styles.accordionCompletedDetails}>{completedSummary}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.accordionStep}>
      <div className={styles.accordionHeader}>
        <h2 className={styles.accordionTitle}>{title}</h2>
      </div>

      {isActive && (
        <div className={styles.accordionBody}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Checkout Item Row ────────────────────────────────────────────────────────

interface CheckoutItemRowProps {
  item:               CartItem
  brand:              string
  icons:              BrandIcons
  onOpenGiftPanel:    (itemId: string) => void
  onOpenGiftModal:    (itemId: string) => void
  savedGifts:         Record<string, SavedGift>
  onRemoveSavedGift:  (itemId: string) => void
}

function CheckoutItemRow({ item, brand, icons, onOpenGiftPanel, onOpenGiftModal, savedGifts, onRemoveSavedGift }: CheckoutItemRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const hasOptions = item.selectedOptions && item.selectedOptions.length > 0
  const { ChevronIcon, GiftIcon, PlusMinusIcon, CheckmarkIcon } = icons
  const { updateGiftPackaging } = useCart()
  const isMultiple = getGiftOptionsMode(brand as Parameters<typeof getGiftOptionsMode>[0]) === 'multiple'
  const giftAssets = isMultiple ? getBrandGiftAssets(brand as Parameters<typeof getBrandGiftAssets>[0]) : null
  const savedGift  = savedGifts[item.id]

  return (
    <article className={styles.checkoutItem}>
      <p className={styles.deliveryGuarantee}>Guaranteed to arrive by Christmas</p>
      <div className={styles.checkoutItemRow}>
        <div className={styles.itemImageWrap}>
          <img src={item.image} alt={item.name} className={styles.itemImage} />
        </div>
        <div className={styles.itemContent}>
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

          <div className={styles.itemGiftGroup}>
        {/* Single-mode gift area */}
        {!isMultiple && (
          savedGift ? (
            <div className={styles.giftSaved}>
              <div className={styles.giftSavedRow}>
                <div className={styles.giftSavedImageWrap}>
                  <img src={savedGift.image} alt="Gift packaging" className={styles.giftSavedImage} />
                </div>
                <div className={styles.giftSavedBody}>
                  <div className={styles.giftSavedNameRow}>
                    <span className={styles.giftSavedName}>{savedGift.name}</span>
                    <span className={styles.giftSavedPrice}>{savedGift.price}</span>
                  </div>
                  <div className={styles.giftConfiguredActions}>
                    <button type="button" className={styles.giftConfiguredEdit} onClick={() => onOpenGiftModal(item.id)}>Edit</button>
                    <span className={styles.giftActionsDivider} aria-hidden="true" />
                    <button type="button" className={styles.giftConfiguredEdit} onClick={() => onRemoveSavedGift(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="upsell-primary"
              leadingIcon={<GiftIcon size={24} />}
              trailingIcon={<PlusMinusIcon size={24} />}
              onClick={() => onOpenGiftModal(item.id)}
            >
              Add Gift Packaging
            </Button>
          )
        )}

        {/* Multi-mode gift area */}
        {isMultiple && (
          item.giftPackaging ? (
            <div className={styles.giftSaved}>
              <div className={styles.giftSavedRow}>
                <div className={styles.giftSavedImageWrap}>
                  <img
                    src={
                      item.giftPackaging.type === 'classic'
                        ? giftAssets!.classicGiftImage
                        : (giftAssets?.designOptions.find(d => d.key === item.giftPackaging!.selectedDesign)?.image ?? giftAssets!.personalizedGiftImage)
                    }
                    alt="Gift packaging"
                    className={styles.giftSavedImage}
                  />
                </div>
                <div className={styles.giftSavedBody}>
                  <div className={styles.giftSavedNameRow}>
                    <span className={styles.giftSavedName}>
                      {item.giftPackaging.type === 'classic'
                        ? 'Classic Gift Set'
                        : `Personalized Gift Box${item.giftPackaging.selectedDesign
                            ? ` · ${giftAssets?.designOptions.find(d => d.key === item.giftPackaging!.selectedDesign)?.label ?? item.giftPackaging.selectedDesign}`
                            : ''}${item.giftPackaging.recipientName ? ` · ${item.giftPackaging.recipientName}` : ''}`
                      }
                    </span>
                    <span className={styles.giftSavedPrice}>{formatPrice(item.giftPackaging.price)}</span>
                  </div>
                  <div className={styles.giftConfiguredActions}>
                    <button type="button" className={styles.giftConfiguredEdit} onClick={() => onOpenGiftPanel(item.id)}>Edit</button>
                    <span className={styles.giftActionsDivider} aria-hidden="true" />
                    <button type="button" className={styles.giftConfiguredEdit} onClick={() => updateGiftPackaging(item.id, undefined)}>Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="upsell-primary"
              leadingIcon={<GiftIcon size={24} />}
              trailingIcon={<PlusMinusIcon size={24} />}
              onClick={() => onOpenGiftPanel(item.id)}
            >
              Add Gift Packaging
            </Button>
          )
        )}
          </div>{/* end itemGiftGroup */}
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
  items:             CartItem[]
  icons:             BrandIcons
  brand:             string
  onOpenGiftPanel:   (itemId: string) => void
  onOpenGiftModal:   (itemId: string) => void
  savedGifts:        Record<string, SavedGift>
  onRemoveSavedGift: (itemId: string) => void
  showDetails?:      boolean
  subtotal?:         number
  selectedShipping?: 'free' | 'standard'
  hideHeader?:       boolean
  hideBenefits?:     boolean
  taxAmount?:        number | null
}

function OrderSummary({ items, icons, brand, onOpenGiftPanel, onOpenGiftModal, savedGifts, onRemoveSavedGift, showDetails, subtotal = 0, selectedShipping = 'free', hideHeader, hideBenefits, taxAmount }: OrderSummaryProps) {
  const [promoCode,    setPromoCode]    = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [appliedCode,  setAppliedCode]  = useState('')

  const { ShippingIcon, ReturnIcon, WarrantyIcon, CouponIcon, XIcon } = icons
  const shippingCost   = selectedShipping === 'standard' ? 500 : 0
  const discountAmount = promoApplied ? Math.round(subtotal * 0.20) : 0
  const orderTotal     = subtotal + shippingCost - discountAmount + (taxAmount ?? 0)

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
            brand={brand}
            icons={icons}
            onOpenGiftPanel={onOpenGiftPanel}
            onOpenGiftModal={onOpenGiftModal}
            savedGifts={savedGifts}
            onRemoveSavedGift={onRemoveSavedGift}
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
            <span className={styles.orderTotalValue}>{formatPrice(orderTotal)}</span>
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
  const pathname = usePathname()
  const brand    = getBrandFromPathname(pathname)
  const icons    = BRAND_ICONS[brand]
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const topline  = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
  }

  const { items, subtotal, updateGiftPackaging } = useCart()

  // ── Step state machine ──────────────────────────────────────────────────────
  const [currentStep,    setCurrentStep]    = useState<1 | 2 | 3>(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const isActive    = (s: number) => s === currentStep
  const isCompleted = (s: number) => completedSteps.has(s)

  const editStep = (step: number) => setCurrentStep(step as 1 | 2 | 3)

  const completeStep = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]))
    if (step < 3) setCurrentStep((step + 1) as 1 | 2 | 3)
  }

  // ── Mobile summary sheet ────────────────────────────────────────────────────
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)

  // ── Gift panel / modal — page level ────────────────────────────────────────
  const [giftPanelItemId, setGiftPanelItemId] = useState<string | null>(null)
  const [giftModalItemId, setGiftModalItemId] = useState<string | null>(null)
  const [savedGifts,      setSavedGifts]      = useState<Record<string, SavedGift>>({})

  const handleSaveGift = (itemId: string, gift: SavedGift) => {
    setSavedGifts(prev => ({ ...prev, [itemId]: gift }))
    setGiftModalItemId(null)
  }
  const handleRemoveSavedGift = (itemId: string) => {
    setSavedGifts(prev => { const n = { ...prev }; delete n[itemId]; return n })
  }
  const handleGenerateGiftNote = async () => ''

  const giftPanelItem = giftPanelItemId ? items.find(i => i.id === giftPanelItemId) : null

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
  const [paymentMethod,    setPaymentMethod]    = useState<'credit-card' | 'paypal' | 'applepay'>('credit-card')
  const [promoCode,        setPromoCode]        = useState('')
  const [promoApplied,     setPromoApplied]     = useState(false)
  const [appliedPromoCode, setAppliedPromoCode] = useState('')

  const { DropdownIcon, TooltipIcon, CheckmarkIcon, LockIcon, XIcon, CouponIcon, ShippingIcon, ReturnIcon, WarrantyIcon } = icons

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
  const step3Summary = (
    <div className={styles.completedGroup}>
      <div className={styles.completedSection}>
        <span className={styles.completedLabel}>Payment method</span>
        <span className={styles.completedValue}>
          {paymentMethod === 'credit-card' ? 'Credit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Apple Pay'}
        </span>
      </div>
    </div>
  )

  const summaryProps = {
    items, icons, brand,
    onOpenGiftPanel: setGiftPanelItemId,
    onOpenGiftModal: setGiftModalItemId,
    savedGifts,
    onRemoveSavedGift: handleRemoveSavedGift,
    taxAmount,
  }

  return (
    <div className={styles.page}>
      <div className={styles.checkoutHeaderWrap}>
        <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />
      </div>

      {/* Mobile sticky order summary bar — top, below header */}
      <div className={styles.mobileSummaryTopBar} onClick={() => setMobileSummaryOpen(true)} role="button" tabIndex={0} aria-label="View order summary" onKeyDown={e => e.key === 'Enter' && setMobileSummaryOpen(true)}>
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

      {/* Gift panel — page level portal */}
      {giftPanelItemId && giftPanelItem && (
        <GiftPackagingPanel
          onClose={() => setGiftPanelItemId(null)}
          onAddToCart={(gift) => { updateGiftPackaging(giftPanelItemId, gift); setGiftPanelItemId(null) }}
          initialGift={giftPanelItem.giftPackaging}
          productName={giftPanelItem.name}
        />
      )}

      {/* Gift modal — page level */}
      {giftModalItemId && (
        <GiftOptionsModal
          onClose={() => setGiftModalItemId(null)}
          onAddToCart={(gift) => handleSaveGift(giftModalItemId, gift)}
          onGenerateGiftNote={handleGenerateGiftNote}
        />
      )}

      {/* Mobile summary backdrop */}
      <div
        className={`${styles.mobileSummaryOverlay} ${mobileSummaryOpen ? styles.mobileSummaryOverlayVisible : ''}`}
        aria-hidden="true"
        onClick={() => setMobileSummaryOpen(false)}
      />

      {/* Mobile summary bottom sheet */}
      <div className={`${styles.mobileSummarySheet} ${mobileSummaryOpen ? styles.mobileSummarySheetOpen : ''}`} role="dialog" aria-label="Order summary">
        <div className={styles.mobileSummarySheetHeader}>
          <h2 className={styles.mobileSummarySheetTitle}>Order Summary ({items.length})</h2>
          <button type="button" className={styles.mobileSummarySheetClose} aria-label="Close order summary" onClick={() => setMobileSummaryOpen(false)}>
            <XIcon size={24} />
          </button>
        </div>
        <div className={styles.mobileSummarySheetBody}>
          <OrderSummary {...summaryProps} hideHeader showDetails hideBenefits subtotal={subtotal} selectedShipping={selectedShipping} />
        </div>
      </div>

      <main id="main-content" className={styles.main}>
        <div className={styles.pageInner}>
          <div className={styles.layout}>

            {/* ══════════════ LEFT COLUMN ══════════════ */}
            <div className={styles.leftCol}>

              {/* Express checkout — hidden once step 1 is completed */}
              {!isCompleted(1) && (
                <section className={styles.expressCheckout}>
                  <p className={styles.expressTitle}>Express Checkout</p>
                  <div className={styles.expressButtons}>
                    <button type="button" className={styles.expressBtn} aria-label="Pay with Apple Pay">
                      <img src="/images/payment/ApplePay.svg" alt="Apple Pay" height={20} style={{ filter: 'invert(1)' }} />
                    </button>
                  </div>
                  <div className={styles.expressDivider}><span>or</span></div>
                </section>
              )}

              {/* Step breadcrumb */}
              <StepBreadcrumb
                currentStep={currentStep}
                completedSteps={completedSteps}
                icons={icons}
                brand={brand}
                onEditStep={editStep}
              />

              {/* ── Step 1: Contact & Delivery ── */}
              <AccordionStep
                title="Contact & Delivery"
                isActive={isActive(1)}
                isCompleted={isCompleted(1)}
                completedSummary={step1Summary}
                onEdit={() => editStep(1)}
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

                <div className={styles.stepContinueRow}>
                  <Button variant="primary" className={styles.continueBtn} disabled={!step1Valid} onClick={() => completeStep(1)}>
                    Continue to Shipping
                  </Button>
                </div>
              </AccordionStep>

              {/* ── Step 2: Shipping Method ── */}
              <AccordionStep
                title="Shipping Method"
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

                <div className={styles.shippingInsurance}>
                  <span className={styles.insuranceIcon}><CheckmarkIcon size={24} /></span>
                  <span className={styles.checkboxText}>All methods are tracked &amp; insured</span>
                </div>

                <div className={styles.carriersRow}>
                  <img src="/images/carriers/ups.svg"   alt="UPS"   className={styles.carrierLogo} />
                  <img src="/images/carriers/usps.svg"  alt="USPS"  className={styles.carrierLogo} />
                  <img src="/images/carriers/fedex.svg" alt="FedEx" className={styles.carrierLogo} />
                  <img src="/images/carriers/dhl.svg"   alt="DHL"   className={styles.carrierLogo} />
                </div>

                <div className={styles.stepContinueRow}>
                  <Button variant="primary" className={styles.continueBtn} onClick={() => completeStep(2)}>
                    Continue to Payment
                  </Button>
                </div>
              </AccordionStep>

              {/* Mini order summary — mobile only, shown after shipping is confirmed */}
              {isCompleted(2) && (
                <div className={styles.mobileInterStepSummary}>
                  <div className={styles.summaryHeader}>
                    <h2 className={styles.summaryTitle}>Order Summary</h2>
                    <span className={styles.itemCount}>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className={styles.promoRow}>
                    <span className={styles.promoQuestion}>
                      <CouponIcon size={16} />
                      Have a promo code?
                    </span>
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
                            placeholder="Promo code"
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
                  {promoApplied && (
                    <p className={styles.savingsNote}>You're saving {formatPrice(discountAmount)} on this order!</p>
                  )}
                </div>
              )}

              {/* ── Step 3: Payment ── */}
              <AccordionStep
                title="Payment"
                isActive={isActive(3)}
                isCompleted={isCompleted(3)}
                completedSummary={step3Summary}
                onEdit={() => editStep(3)}
              >
                {/* Billing Address */}
                <div className={styles.formSubSection}>
                  <div className={styles.formSubHead}>
                    <h3 className={styles.formSubTitle}>Billing Address</h3>
                  </div>
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
                  <div className={styles.formSubHead}>
                    <h3 className={styles.formSubTitle}>Payment Options</h3>
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.paymentOptions} role="radiogroup" aria-label="Payment method">
                      <label className={`${styles.paymentOption} ${paymentMethod === 'credit-card' ? styles.paymentOptionSelected : ''}`}>
                        <input type="radio" name="paymentMethod" value="credit-card" checked={paymentMethod === 'credit-card'} onChange={() => setPaymentMethod('credit-card')} className={styles.radioInput} />
                        <span className={styles.paymentOptionName}>Credit Card</span>
                        <span className={styles.paymentOptionIcons}><img src="/images/payment/creditcard.svg" alt="Credit card" height={24} /></span>
                      </label>
                      <label className={`${styles.paymentOption} ${paymentMethod === 'paypal' ? styles.paymentOptionSelected : ''}`}>
                        <input type="radio" name="paymentMethod" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className={styles.radioInput} />
                        <span className={styles.paymentOptionName}>PayPal</span>
                        <span className={styles.paymentOptionIcons}><img src="/images/payment/PayPal.svg" alt="PayPal" height={24} /></span>
                      </label>
                      <label className={`${styles.paymentOption} ${paymentMethod === 'applepay' ? styles.paymentOptionSelected : ''}`}>
                        <input type="radio" name="paymentMethod" value="applepay" checked={paymentMethod === 'applepay'} onChange={() => setPaymentMethod('applepay')} className={styles.radioInput} />
                        <span className={styles.paymentOptionName}>Apple Pay</span>
                        <span className={styles.paymentOptionIcons}><img src="/images/payment/ApplePay.svg" alt="Apple Pay" height={24} /></span>
                      </label>
                    </div>

                    <div className={styles.storeCreditSection}>
                      <label className={styles.checkboxLabel}>
                        <input type="checkbox" checked={applyStoreCredit} onChange={e => setApplyStoreCredit(e.target.checked)} className={styles.checkbox} />
                        <span className={styles.checkboxText}>Apply Store Credit</span>
                      </label>
                      {applyStoreCredit && (
                        <div className={styles.storeCreditRow}>
                          <div className={styles.storeCreditInput}>
                            <input type="text" placeholder="Please enter code" value={storeCreditCode} onChange={e => setStoreCreditCode(e.target.value)} className={styles.input} aria-label="Store credit code" />
                          </div>
                          <Button variant="primary" className={styles.applyButton}>Apply</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Place Order */}
                <div className={styles.placeOrderSection}>
                  <Button variant="primary" className={styles.placeOrderButton} onClick={() => completeStep(3)}>
                    Place Order
                  </Button>
                  <p className={styles.secureNote}>
                    <LockIcon size={24} />
                    All transactions are secure and encrypted
                  </p>
                </div>

                {/* Benefits — below secure note, mobile only */}
                <ul className={`${styles.benefits} ${styles.benefitsMobileBelow}`}>
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


    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function CheckoutPageClient() {
  return <CheckoutPageInner />
}
