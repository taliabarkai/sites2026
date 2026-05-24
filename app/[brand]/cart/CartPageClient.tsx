'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import type { IconProps } from '@/src/components/icons/Icon'
import { CartProvider, useCart } from '../_context/CartContext'
import type { CartItem } from '../_context/CartContext'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { Button } from '../_components/Button'
import { InputAction } from '../_components/InputAction'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import styles from './CartPage.module.css'

// ─── Brand icons ──────────────────────────────────────────────────────────────

interface BrandIcons {
  TrashCanIcon:  React.ComponentType<IconProps>
  ChevronIcon:   React.ComponentType<IconProps>
  GiftIcon:      React.ComponentType<IconProps>
  PlusMinusIcon: React.ComponentType<IconProps>
  ArrowIcon:     React.ComponentType<IconProps>
  ShippingIcon:  React.ComponentType<IconProps>
  WarrantyIcon:  React.ComponentType<IconProps>
  ReturnIcon:    React.ComponentType<IconProps>
  CheckmarkIcon: React.ComponentType<IconProps>
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
  isPersonalized: boolean
}

const UPSELL_PRODUCTS: UpsellProduct[] = [
  {
    id: 'lock-luna-charm',
    name: 'Lock & Luna Charm with Moissanite - Gold',
    price: 10500,
    image: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-6.jpg',
    isPersonalized: false,
  },
  {
    id: 'herringbone-chain',
    name: 'Herringbone Slim Chain Necklace - Gold Vermeil',
    price: 9500,
    originalPrice: 11500,
    image: 'https://cdn.oakandluna.com/digital-asset/products/herringbone-thin-chain-necklace-gold-vermeil-4.jpg',
    isPersonalized: false,
  },
  {
    id: 'singapore-chain-name',
    name: 'Singapore Chain Name Necklace - Gold Vermeil',
    price: 11000,
    image: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-8.jpg',
    isPersonalized: true,
  },
  {
    id: 'inez-heart-necklace',
    name: 'Inez Initial Heart Necklace with Diamond - Gold',
    price: 13000,
    originalPrice: 15000,
    image: 'https://cdn.oakandluna.com/digital-asset/product/red-heart-inez-initial-necklace-with-diamond-gold-vermeil-2.jpg',
    isPersonalized: false,
  },
  {
    id: 'multiple-name-necklace',
    name: 'Multiple Name Necklace - Gold Vermeil',
    price: 12500,
    image: 'https://cdn.oakandluna.com/digital-asset/products/multiple-name-necklace-vermeil-gold-plated-1.jpg',
    isPersonalized: true,
  },
]

// ─── Progress Steps ────────────────────────────────────────────────────────────

function ProgressSteps() {
  const steps = ['My Bag', 'Contact Information', 'Payment & Shipping']
  return (
    <div className={styles.progressSteps} aria-label="Checkout steps">
      {steps.map((label, i) => (
        <div key={label} className={styles.stepWrapper}>
          {i > 0 && <div className={styles.stepLine} aria-hidden="true" />}
          <div className={styles.step}>
            <div
              className={styles.stepCircle}
              data-active={i === 0 ? 'true' : 'false'}
              aria-current={i === 0 ? 'step' : undefined}
            >
              <span className={styles.stepNumber}>{i + 1}</span>
            </div>
            <span className={styles.stepLabel} data-active={i === 0 ? 'true' : 'false'}>
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Cart Item Row ─────────────────────────────────────────────────────────────

interface CartItemRowProps {
  item:     CartItem
  onRemove: (id: string) => void
  icons:    BrandIcons
}

function CartItemRow({ item, onRemove, icons }: CartItemRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const hasOptions = item.selectedOptions && item.selectedOptions.length > 0
  const { TrashCanIcon, ChevronIcon } = icons

  return (
    <article className={styles.cartItem}>
      <img src={item.image} alt={item.name} className={styles.itemImage} />
      <div className={styles.itemContent}>
        <div className={styles.itemTopRow}>
          <p className={styles.itemName}>{item.name}</p>
          <div className={styles.itemActions}>
            {item.isPersonalized && (
              <>
                <button type="button" className={styles.editLink}>Edit</button>
                <span className={styles.actionDivider} aria-hidden="true">|</span>
              </>
            )}
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
            >
              <TrashCanIcon size={24} />
            </button>
          </div>
        </div>

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
            View details
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
      <div className={styles.upsellInfo}>
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
          className={styles.upsellCardButton}
        >
          {product.isPersonalized ? 'Personalize Me' : 'Add To Bag'}
        </Button>
      </div>
    </div>
  )
}

// ─── Page Inner ────────────────────────────────────────────────────────────────

function CartPageInner() {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
  }

  const { items, subtotal, removeItem } = useCart()
  const icons = BRAND_ICONS[brand]

  const [selectedShipping, setSelectedShipping] = useState<'free' | 'express'>('free')
  const [promoOpen, setPromoOpen] = useState(false)

  const carouselRef = useRef<HTMLDivElement>(null)
  const scrollCarousel = (dir: 'prev' | 'next') => {
    carouselRef.current?.scrollBy({ left: dir === 'next' ? 220 : -220, behavior: 'smooth' })
  }

  const totalOriginalValue = items.reduce((sum, item) => sum + (item.originalPrice ?? item.price), 0)
  const savings    = totalOriginalValue - subtotal
  const shippingCost = selectedShipping === 'express' ? 1500 : 0
  const orderTotal   = subtotal + shippingCost

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content">
        <div className={styles.pageInner}>
        {/* <ProgressSteps /> */}

        <div className={styles.layout}>

          {/* ── Left: My Bag ─────────────────────────────────────── */}
          <section className={styles.bagSection} aria-labelledby="bag-heading">
            <h1 id="bag-heading" className={styles.bagTitle}>
              My Bag{' '}
              <span className={styles.bagCount}>
                ( {items.length} {items.length === 1 ? 'item' : 'items'} )
              </span>
            </h1>

            <div className={styles.cartItems}>
              {items.map(item => (
                <CartItemRow key={item.id} item={item} onRemove={removeItem} icons={icons} />
              ))}
            </div>

            <div className={styles.giftButtonRow}>
              <Button
                variant="upsell-primary"
                leadingIcon={<icons.GiftIcon size={24} />}
                trailingIcon={<icons.PlusMinusIcon size={24} />}
              >
                Is It a Gift?
              </Button>
            </div>

            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <span className={styles.subtotalAmount}>{formatPrice(subtotal)}</span>
            </div>
          </section>

          {/* ── Left: Upsell Carousel ─────────────────────────────── */}
          <section className={styles.upsellSection} aria-labelledby="upsell-heading">
            <div className={styles.upsellHeader}>
              <h2 id="upsell-heading" className={styles.sectionTitle}>Get Everything You Need</h2>
              <div className={styles.upsellArrows}>
                <button
                  type="button"
                  className={`${styles.arrowButton} ${styles.arrowPrev}`}
                  onClick={() => scrollCarousel('prev')}
                  aria-label="Scroll left"
                >
                  <icons.ArrowIcon size={24} />
                </button>
                <button
                  type="button"
                  className={styles.arrowButton}
                  onClick={() => scrollCarousel('next')}
                  aria-label="Scroll right"
                >
                  <icons.ArrowIcon size={24} />
                </button>
              </div>
            </div>

            <div className={styles.upsellCarousel} ref={carouselRef}>
              {UPSELL_PRODUCTS.map(product => (
                <UpsellCard key={product.id} product={product} icons={icons} />
              ))}
            </div>
          </section>

          {/* ── Right Column — before continueShoppingRow in DOM so it appears
               between upsell and "Continue Shopping" on mobile, while
               grid-area places it in the right column on desktop ─────── */}
          <aside className={styles.rightCol}>

            {/* Shipping Options
            <section className={styles.shippingSection} aria-labelledby="shipping-heading">
              <div className={styles.shippingSectionHeader}>
                <h2 id="shipping-heading" className={styles.sectionTitle}>Shipping Options</h2>
                <span className={styles.shipTo}>Ship to: 🇺🇸</span>
              </div>

              <div className={styles.shippingOptions} role="radiogroup" aria-label="Shipping method">
                <label className={`${styles.shippingOption} ${selectedShipping === 'free' ? styles.shippingOptionSelected : ''}`}>
                  <input
                    type="radio"
                    name="shipping"
                    value="free"
                    checked={selectedShipping === 'free'}
                    onChange={() => setSelectedShipping('free')}
                    className={styles.radioInput}
                  />
                  <div className={styles.shippingOptionContent}>
                    <div className={styles.shippingOptionInfo}>
                      <span className={styles.shippingOptionName}>Free Shipping</span>
                      <span className={styles.shippingOptionDate}>Get it by Wed, Jun 3 – Thu, Jun 4</span>
                    </div>
                    <span className={styles.shippingOptionPrice}>Free</span>
                  </div>
                </label>

                <label className={`${styles.shippingOption} ${selectedShipping === 'express' ? styles.shippingOptionSelected : ''}`}>
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={selectedShipping === 'express'}
                    onChange={() => setSelectedShipping('express')}
                    className={styles.radioInput}
                  />
                  <div className={styles.shippingOptionContent}>
                    <div className={styles.shippingOptionInfo}>
                      <span className={styles.shippingOptionName}>Express Shipping</span>
                      <span className={styles.shippingOptionDate}>Get it by Mon, May 27 – Tue, May 28</span>
                    </div>
                    <span className={styles.shippingOptionPrice}>$15</span>
                  </div>
                </label>
              </div>

              <div className={styles.shippingInsurance}>
                <span className={styles.insuranceIcon}>
                  <icons.CheckmarkIcon size={16} />
                </span>
                <span>All methods are tracked &amp; insured</span>
              </div>

              <div className={styles.carriersRow}>
                <img src="/images/carriers/usps.svg" alt="USPS" className={styles.carrierLogo} />
                <img src="/images/carriers/fedex.svg" alt="FedEx" className={styles.carrierLogo} />
                <img src="/images/carriers/dhl.svg" alt="DHL" className={styles.carrierLogo} />
              </div>
            </section> */}

            {/* Promo Code */}
            <div className={styles.promoSection}>
              <button
                type="button"
                className={styles.promoToggle}
                onClick={() => setPromoOpen(prev => !prev)}
                aria-expanded={promoOpen}
              >
                <span className={styles.promoLabel}>Promotional Code</span>
                <span className={styles.promoIcon} aria-hidden="true">{promoOpen ? '−' : '+'}</span>
              </button>
              {promoOpen && (
                <div className={styles.promoInput}>
                  <InputAction
                    placeholder="Enter promo code"
                    buttonLabel="Apply"
                    onSubmit={() => {}}
                    groupLabel="Promotional code"
                    inputLabel="Promo code"
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            <section className={styles.orderSummary} aria-labelledby="summary-heading">
              <h2 id="summary-heading" className={styles.sectionTitle}>Order Summary</h2>

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Subtotal:</span>
                  <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Shipping:</span>
                  <span className={styles.summaryValueBold}>
                    {selectedShipping === 'free' ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Tax:</span>
                  <span className={styles.summaryValueBold}>Calculated at checkout</span>
                </div>
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryTotal}>
                <span className={styles.totalLabel}>Order Total:</span>
                <span className={styles.totalValue}>{formatPrice(orderTotal)}</span>
              </div>

              <Button variant="add-to-cart" href={`/${brand}/checkout`} className={styles.checkoutButton}>
                CONTINUE TO CHECKOUT
              </Button>

              {savings > 0 && (
                <p className={styles.savingsNote}>You're saving {formatPrice(savings)} on this order!</p>
              )}

              <ul className={styles.benefits}>
                <li className={styles.benefit}>
                  <span className={styles.benefitIcon}>
                    <icons.ShippingIcon size={24} />
                  </span>
                  <span>Free Shipping</span>
                </li>
                <li className={styles.benefit}>
                  <span className={styles.benefitIcon}>
                    <icons.WarrantyIcon size={24} />
                  </span>
                  <span>2 Year Warranty</span>
                </li>
                <li className={styles.benefit}>
                  <span className={styles.benefitIcon}>
                    <icons.ReturnIcon size={24} />
                  </span>
                  <span>Free 60-Day Extended Returns</span>
                </li>
              </ul>
            </section>

          </aside>

          {/* ── Left: Continue Shopping — after aside so it appears last on
               mobile; grid-area places it in the left column on desktop ── */}
          <div className={styles.continueShoppingRow}>
            <Link href={`/${brand}/category`} className={styles.continueShoppingLink}>
              Continue Shopping
            </Link>
          </div>

        </div>
        </div>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function CartPageClient() {
  return (
    <CartProvider>
      <CartPageInner />
    </CartProvider>
  )
}
