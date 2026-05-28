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
import { GiftPackagingPanel } from '../_components/GiftPackagingPanel/GiftPackagingPanel'
import { getBrandFromPathname, getGiftOptionsMode, getBrandGiftAssets } from '../_config/brands'
import { prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import styles from './CheckoutPageV1.module.css'

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

// ─── Checkout Item Row ────────────────────────────────────────────────────────

interface CheckoutItemRowProps {
  item:  CartItem
  brand: string
  icons: BrandIcons
}

function CheckoutItemRow({ item, brand, icons }: CheckoutItemRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [giftPanelOpen, setGiftPanelOpen] = useState(false)
  const hasOptions = item.selectedOptions && item.selectedOptions.length > 0
  const { ChevronIcon, GiftIcon, PlusMinusIcon } = icons
  const { updateGiftPackaging } = useCart()
  const isMultiple = getGiftOptionsMode(brand as Parameters<typeof getGiftOptionsMode>[0]) === 'multiple'
  const giftAssets = isMultiple ? getBrandGiftAssets(brand as Parameters<typeof getBrandGiftAssets>[0]) : null

  const handleGenerateGiftNote = async () => ''

  return (
    <article className={styles.checkoutItem}>
      {/* Single-mode gift modal */}
      {!isMultiple && giftModalOpen && (
        <GiftOptionsModal
          onClose={() => setGiftModalOpen(false)}
          onAddToCart={() => setGiftModalOpen(false)}
          onGenerateGiftNote={handleGenerateGiftNote}
        />
      )}

      {/* Multi-mode gift panel */}
      {isMultiple && giftPanelOpen && (
        <GiftPackagingPanel
          onClose={() => setGiftPanelOpen(false)}
          onAddToCart={(gift) => {
            updateGiftPackaging(item.id, gift)
            setGiftPanelOpen(false)
          }}
          initialGift={item.giftPackaging}
        />
      )}

      <div className={styles.itemImageWrap}>
        <img src={item.image} alt={item.name} className={styles.itemImage} />
      </div>
      <div className={styles.itemContent}>
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

        {/* Single-mode: always show Add Gift Packaging button */}
        {!isMultiple && (
          <Button
            variant="upsell-primary"
            leadingIcon={<GiftIcon size={24} />}
            trailingIcon={<PlusMinusIcon size={24} />}
            onClick={() => setGiftModalOpen(true)}
          >
            Add Gift Packaging
          </Button>
        )}

        {/* Multi-mode: show configured state or add trigger */}
        {isMultiple && (
          item.giftPackaging ? (
            <div className={styles.giftConfigured}>
              <span className={styles.giftConfiguredName}>
                {item.giftPackaging.type === 'classic'
                  ? 'Classic Gift Set'
                  : `Personalized Gift Box${item.giftPackaging.selectedDesign
                      ? ` · ${giftAssets?.designOptions.find(d => d.key === item.giftPackaging!.selectedDesign)?.label ?? item.giftPackaging.selectedDesign}`
                      : ''}${item.giftPackaging.recipientName ? ` · ${item.giftPackaging.recipientName}` : ''}`
                }
              </span>
              <button type="button" className={styles.giftConfiguredEdit} onClick={() => setGiftPanelOpen(true)}>
                Edit
              </button>
            </div>
          ) : (
            <Button
              variant="upsell-primary"
              leadingIcon={<GiftIcon size={24} />}
              trailingIcon={<PlusMinusIcon size={24} />}
              onClick={() => setGiftPanelOpen(true)}
            >
              Add Gift Packaging
            </Button>
          )
        )}
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

function YouMayAlsoLike({ icons }: { icons: BrandIcons }) {
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
  items:           CartItem[]
  subtotal:        number
  selectedShipping: 'free' | 'standard'
  icons:           BrandIcons
  brand:           string
  collapsible?:    boolean
}

function OrderSummary({ items, subtotal, selectedShipping, icons, brand, collapsible }: OrderSummaryProps) {
  const [open, setOpen] = useState(!collapsible)
  const [promoVisible, setPromoVisible] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const { ChevronIcon, ShippingIcon, ReturnIcon, WarrantyIcon, CouponIcon } = icons
  const giftedCount = items.filter(item => item.giftPackaging).length

  const shippingCost = selectedShipping === 'standard' ? 500 : 0
  const orderTotal = subtotal + shippingCost

  return (
    <section className={styles.orderSummary} aria-labelledby="summary-heading">
      {/* Header */}
      <div
        className={collapsible ? styles.summaryHeaderCollapsible : styles.summaryHeader}
        onClick={collapsible ? () => setOpen(prev => !prev) : undefined}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? open : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={collapsible ? (e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(prev => !prev) } : undefined}
      >
        <div className={styles.summaryTitleRow}>
          <h2 id="summary-heading" className={styles.summaryTitle}>
            Order Summary
            {collapsible && (
              <span className={open ? styles.chevronOpen : styles.chevronClosed} aria-hidden="true">
                <ChevronIcon size={16} />
              </span>
            )}
          </h2>
        </div>
        <span className={styles.itemCount}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
        {collapsible && giftedCount > 0 && (
          <span className={styles.summarySubtitle}>
            {giftedCount} of {items.length} {items.length === 1 ? 'item' : 'items'} gifted · Tap to review
          </span>
        )}
      </div>

      {/* Cart items — collapsed when collapsible and closed */}
      {open && (
        <div className={styles.summaryItems}>
          {items.map(item => (
            <CheckoutItemRow key={item.id} item={item} brand={brand} icons={icons} />
          ))}
        </div>
      )}

      {/* Promo code — below summary items */}
      <div className={styles.promoRow}>
        <span className={styles.promoQuestion}>
          <CouponIcon size={16} />
          Have a promo code?
        </span>
        {promoVisible && (
          <div className={styles.storeCreditRow}>
            <div className={styles.storeCreditInput}>
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                className={styles.input}
                aria-label="Promo code"
              />
            </div>
            <Button variant="primary" className={styles.applyButton}>
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Totals — always visible */}
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
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Tax:</span>
          <span className={styles.totalValueMuted}>Not calculated</span>
        </div>
      </div>

      <div className={styles.summaryDivider} />

      <div className={styles.orderTotalRow}>
        <span className={styles.orderTotalLabel}>Order Total:</span>
        <span className={styles.orderTotalValue}>{formatPrice(orderTotal)}</span>
      </div>

      <div className={styles.summaryDivider} />

      {/* Benefits — always visible */}
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
    </section>
  )
}

// ─── Page Inner ────────────────────────────────────────────────────────────────

function CheckoutPageInner() {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const icons = BRAND_ICONS[brand]
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
  }

  const { items, subtotal } = useCart()

  // Contact section state
  const [email, setEmail] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(false)

  // Deliver to state
  const [country, setCountry] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [aptSuite, setAptSuite] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)

  // Billing address state (shown when billingSameAsShipping is false)
  const [billingFirstName, setBillingFirstName] = useState('')
  const [billingLastName, setBillingLastName] = useState('')
  const [billingStreetAddress, setBillingStreetAddress] = useState('')
  const [billingAptSuite, setBillingAptSuite] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingState, setBillingState] = useState('')
  const [billingZipCode, setBillingZipCode] = useState('')

  // Shipping method state
  const [selectedShipping, setSelectedShipping] = useState<'free' | 'standard'>('free')

  // Payment state
  const [applyStoreCredit, setApplyStoreCredit] = useState(false)
  const [storeCreditCode, setStoreCreditCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'paypal' | 'applepay'>('credit-card')

  const { DropdownIcon, TooltipIcon, CheckmarkIcon, LockIcon } = icons

  return (
    <div className={styles.page}>

      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content" className={styles.main}>
        <div className={styles.pageInner}>
          <div className={styles.layout}>

            {/* ══════════════ LEFT COLUMN ══════════════ */}
            <div className={styles.leftCol}>

              {/* ── Contact ── */}
              <section className={styles.formSection} aria-labelledby="contact-heading">
                <div className={styles.sectionHead}>
                  <h2 id="contact-heading" className={styles.sectionTitle}>Contact</h2>
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
              </section>

              {/* ── Deliver to ── */}
              <section className={styles.formSection} aria-labelledby="deliver-heading">
                <h2 id="deliver-heading" className={styles.sectionTitle}>Deliver to</h2>

                <div className={styles.fieldGroup}>
                  {/* Country dropdown */}
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
                      <DropdownIcon size={16} />
                    </span>
                  </div>

                  {/* First Name / Last Name */}
                  <div className={styles.twoCol}>
                    <div className={styles.fieldWrap}>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className={styles.input}
                        aria-label="First name"
                        autoComplete="given-name"
                      />
                    </div>
                    <div className={styles.fieldWrap}>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className={styles.input}
                        aria-label="Last name"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div className={styles.fieldWrap}>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={streetAddress}
                      onChange={e => setStreetAddress(e.target.value)}
                      className={styles.input}
                      aria-label="Street address"
                      autoComplete="address-line1"
                    />
                  </div>

                  {/* Apt, suite */}
                  <div className={styles.fieldWrap}>
                    <input
                      type="text"
                      placeholder="Apt, suite, unit, building (optional)"
                      value={aptSuite}
                      onChange={e => setAptSuite(e.target.value)}
                      className={styles.input}
                      aria-label="Apartment, suite, unit (optional)"
                      autoComplete="address-line2"
                    />
                  </div>

                  {/* City */}
                  <div className={styles.fieldWrap}>
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className={styles.input}
                      aria-label="City"
                      autoComplete="address-level2"
                    />
                  </div>

                  {/* State / Zip Code */}
                  <div className={styles.twoCol}>
                    <div className={styles.fieldWrap}>
                      <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={e => setState(e.target.value)}
                        className={styles.input}
                        aria-label="State"
                        autoComplete="address-level1"
                      />
                    </div>
                    <div className={styles.fieldWrap}>
                      <input
                        type="text"
                        placeholder="Zip Code"
                        value={zipCode}
                        onChange={e => setZipCode(e.target.value)}
                        className={styles.input}
                        aria-label="Zip code"
                        autoComplete="postal-code"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className={styles.fieldWrap}>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className={styles.input}
                      aria-label="Phone number"
                      autoComplete="tel"
                    />
                    <span className={styles.fieldIconRight} aria-label="Why we need your phone number">
                      <TooltipIcon size={16} />
                    </span>
                  </div>

                </div>
              </section>

              {/* ── Shipping Method ── */}
              <section className={styles.formSection} aria-labelledby="shipping-heading">
                <h2 id="shipping-heading" className={styles.sectionTitle}>Shipping Method</h2>

                <div className={styles.shippingOptions} role="radiogroup" aria-label="Shipping method">
                  <label className={`${styles.shippingOption} ${selectedShipping === 'free' ? styles.shippingOptionSelected : ''}`}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="free"
                      checked={selectedShipping === 'free'}
                      onChange={() => setSelectedShipping('free')}
                      className={styles.radioInput}
                    />
                    <div className={styles.shippingOptionContent}>
                      <div className={styles.shippingOptionInfo}>
                        <span className={styles.shippingOptionName}>Free Shipping</span>
                        <span className={styles.shippingOptionDate}>Arrives 6-8 business days after production time</span>
                      </div>
                      <span className={styles.shippingOptionPrice}>FREE</span>
                    </div>
                  </label>

                  <label className={`${styles.shippingOption} ${selectedShipping === 'standard' ? styles.shippingOptionSelected : ''}`}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={selectedShipping === 'standard'}
                      onChange={() => setSelectedShipping('standard')}
                      className={styles.radioInput}
                    />
                    <div className={styles.shippingOptionContent}>
                      <div className={styles.shippingOptionInfo}>
                        <span className={styles.shippingOptionName}>Standard Shipping</span>
                        <span className={styles.shippingOptionDate}>Arrives 4-6 business days after production time</span>
                      </div>
                      <span className={styles.shippingOptionPrice}>$5</span>
                    </div>
                  </label>
                </div>

                <div className={styles.shippingInsurance}>
                  <span className={styles.insuranceIcon}>
                    <CheckmarkIcon size={24} />
                  </span>
                  <span className={styles.checkboxText}>All methods are tracked &amp; insured</span>
                </div>

                <div className={styles.carriersRow}>
                  <img src="/images/carriers/ups.svg"  alt="UPS"  className={styles.carrierLogo} />
                  <img src="/images/carriers/usps.svg" alt="USPS" className={styles.carrierLogo} />
                  <img src="/images/carriers/fedex.svg" alt="FedEx" className={styles.carrierLogo} />
                  <img src="/images/carriers/dhl.svg"  alt="DHL"  className={styles.carrierLogo} />
                </div>
              </section>

              {/* ── You May Also Like — mobile only (between Shipping and Order Summary) ── */}
              <div className={styles.upsellMobile}>
                <YouMayAlsoLike icons={icons} />
              </div>

              {/* ── Order Summary — mobile collapsible ── */}
              <div className={styles.orderSummaryMobile}>
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  selectedShipping={selectedShipping}
                  icons={icons}
                  brand={brand}
                  collapsible
                />
              </div>

              {/* ── Payment ── */}
              <section className={styles.formSection} aria-labelledby="payment-heading">
                <h2 id="payment-heading" className={styles.sectionTitle}>Payment</h2>

                <div className={styles.fieldGroup}>
                  {/* Billing matches shipping — first item below Payment title */}
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={e => setBillingSameAsShipping(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>Billing matches shipping address</span>
                  </label>

                  {/* Billing Address form — shown when unchecked */}
                  {!billingSameAsShipping && (
                    <div className={styles.fieldGroup}>
                      <div className={styles.twoCol}>
                        <div className={styles.fieldWrap}>
                          <input
                            type="text"
                            placeholder="First Name"
                            value={billingFirstName}
                            onChange={e => setBillingFirstName(e.target.value)}
                            className={styles.input}
                            aria-label="Billing first name"
                            autoComplete="billing given-name"
                          />
                        </div>
                        <div className={styles.fieldWrap}>
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={billingLastName}
                            onChange={e => setBillingLastName(e.target.value)}
                            className={styles.input}
                            aria-label="Billing last name"
                            autoComplete="billing family-name"
                          />
                        </div>
                      </div>
                      <div className={styles.fieldWrap}>
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={billingStreetAddress}
                          onChange={e => setBillingStreetAddress(e.target.value)}
                          className={styles.input}
                          aria-label="Billing street address"
                          autoComplete="billing address-line1"
                        />
                      </div>
                      <div className={styles.fieldWrap}>
                        <input
                          type="text"
                          placeholder="Apt, suite, unit, building (optional)"
                          value={billingAptSuite}
                          onChange={e => setBillingAptSuite(e.target.value)}
                          className={styles.input}
                          aria-label="Billing apartment, suite, unit (optional)"
                          autoComplete="billing address-line2"
                        />
                      </div>
                      <div className={styles.fieldWrap}>
                        <input
                          type="text"
                          placeholder="City"
                          value={billingCity}
                          onChange={e => setBillingCity(e.target.value)}
                          className={styles.input}
                          aria-label="Billing city"
                          autoComplete="billing address-level2"
                        />
                      </div>
                      <div className={styles.twoCol}>
                        <div className={styles.fieldWrap}>
                          <input
                            type="text"
                            placeholder="State"
                            value={billingState}
                            onChange={e => setBillingState(e.target.value)}
                            className={styles.input}
                            aria-label="Billing state"
                            autoComplete="billing address-level1"
                          />
                        </div>
                        <div className={styles.fieldWrap}>
                          <input
                            type="text"
                            placeholder="Zip Code"
                            value={billingZipCode}
                            onChange={e => setBillingZipCode(e.target.value)}
                            className={styles.input}
                            aria-label="Billing zip code"
                            autoComplete="billing postal-code"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment method radio group */}
                  <div className={styles.paymentOptions} role="radiogroup" aria-label="Payment method">
                    <label className={`${styles.paymentOption} ${paymentMethod === 'credit-card' ? styles.paymentOptionSelected : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit-card"
                        checked={paymentMethod === 'credit-card'}
                        onChange={() => setPaymentMethod('credit-card')}
                        className={styles.radioInput}
                      />
                      <span className={styles.paymentOptionName}>Credit Card</span>
                      <span className={styles.paymentOptionIcons}>
                        <img src="/images/payment/creditcard.svg" alt="Credit card" height={24} />
                      </span>
                    </label>

                    <label className={`${styles.paymentOption} ${paymentMethod === 'paypal' ? styles.paymentOptionSelected : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                        className={styles.radioInput}
                      />
                      <span className={styles.paymentOptionName}>PayPal</span>
                      <span className={styles.paymentOptionIcons}>
                        <img src="/images/payment/PayPal.svg" alt="PayPal" height={24} />
                      </span>
                    </label>

                    <label className={`${styles.paymentOption} ${paymentMethod === 'applepay' ? styles.paymentOptionSelected : ''}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="applepay"
                        checked={paymentMethod === 'applepay'}
                        onChange={() => setPaymentMethod('applepay')}
                        className={styles.radioInput}
                      />
                      <span className={styles.paymentOptionName}>ApplePay</span>
                      <span className={styles.paymentOptionIcons}>
                        <img src="/images/payment/ApplePay.svg" alt="Apple Pay" height={24} />
                      </span>
                    </label>
                  </div>

                  {/* Store credit — below ApplePay */}
                  <div className={styles.storeCreditSection}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={applyStoreCredit}
                        onChange={e => setApplyStoreCredit(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>Apply Store Credit</span>
                    </label>

                    {applyStoreCredit && (
                      <div className={styles.storeCreditRow}>
                        <div className={styles.storeCreditInput}>
                          <input
                            type="text"
                            placeholder="Please enter code"
                            value={storeCreditCode}
                            onChange={e => setStoreCreditCode(e.target.value)}
                            className={styles.input}
                            aria-label="Store credit code"
                          />
                        </div>
                        <Button variant="primary" className={styles.applyButton}>
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Place Order — desktop only inside form; mobile is sticky bar */}
                <div className={styles.placeOrderDesktop}>
                  <Button variant="primary" className={styles.placeOrderButton}>
                    Place Order
                  </Button>
                  <p className={styles.secureNote}>
                    <LockIcon size={24} />
                    All transactions are secure and encrypted
                  </p>
                </div>
              </section>

            </div>
            {/* ══════════════ END LEFT COLUMN ══════════════ */}

            {/* ══════════════ RIGHT COLUMN ══════════════ */}
            <aside className={styles.rightCol}>

              {/* Order Summary — desktop */}
              <div className={styles.orderSummaryDesktop}>
                <OrderSummary
                  items={items}
                  subtotal={subtotal}
                  selectedShipping={selectedShipping}
                  icons={icons}
                  brand={brand}
                />
              </div>

              {/* You May Also Like — desktop */}
              <div className={styles.upsellDesktop}>
                <YouMayAlsoLike icons={icons} />
              </div>

            </aside>
            {/* ══════════════ END RIGHT COLUMN ══════════════ */}

          </div>

          {/* ── Footer links ── */}
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

      {/* ── Mobile sticky Place Order bar ── */}
      <div className={styles.mobileStickyBar} aria-label="Place order">
        <Button variant="primary" className={styles.mobilePlaceOrderButton}>
          PLACE ORDER
        </Button>
      </div>

    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function CheckoutPageClient() {
  return <CheckoutPageInner />
}
