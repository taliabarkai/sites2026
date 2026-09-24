'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import type { IconProps } from '@/src/components/icons/Icon'
import { useCart, WARRANTY_CENTS } from '../_context/CartContext'
import type { CartItem, GiftPackaging } from '../_context/CartContext'
import { useDemoCartSync } from '../_context/useDemoCartSync'
import { GiftTray, GiftTrayPanel } from '../_components/cart/GiftTray'
import { Usps } from '../_components/cart/Usps'
import { optionsForItem, type GiftOption } from '../_components/cart/GiftingOptions/types'
/* The very panels the checkout uses — the cart page makes the same offer, so
   it collects the same fields in the same place. Which one is on follows the
   prototype's existing gifting switch. */
import { GiftingDrawer } from '../_components/cart/GiftingOptions/GiftingDrawer'
import { GiftPanel } from '../_components/cart/GiftingV2/GiftPanel'
import { getGiftOptions } from '../_config/giftOptions'
import { BRAND_GIFT_CONFIG } from '../_config/brands'
import { readFlow, readGiftingVariant } from '../_config/demoParams'
import { getBrandFeatures, getFlowConfig } from '../_config/flow'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { Button } from '../_components/Button'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import styles from './CartPage.module.css'
/* Promo styling comes straight from the checkout's sheet: the same control,
   the same rules, so the two pages cannot drift apart. */
import checkoutStyles from '../checkout/CheckoutPage.module.css'

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
  CouponIcon:    React.ComponentType<IconProps>
  /* The protection plan's checkbox, shared with the floating cart's V1 row. */
  CheckboxIcon:  React.ComponentType<IconProps>
  /* Required by the shared gift-option card and the checkout's gifting panels,
     both of which the cart page reuses. */
  XIcon:         React.ComponentType<IconProps>
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

/** The add-on as the floating cart sells it — same words, same price. */
const PLAN_TITLE = '5-Year Jewelry Protection Plan'

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

/**
 * Parked, not removed: flip either to true to bring the section back. The
 * markup, data and styles all stay where they are.
 */
const SHOW_UPSELL_CAROUSEL = false
const SHOW_CONTINUE_SHOPPING = false

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

/** One item's packaging, being configured. Mirrors what the panel collects. */
interface GiftDraft {
  itemId:   string
  optionId: string
  note:     string
  design:   string | null
  pname:    string
  photo:    boolean
}

interface CartItemRowProps {
  item:     CartItem
  onRemove: (id: string) => void
  icons:    BrandIcons
  /** The packaging this line can take — its own, or the brand's catalogue. */
  giftOptions:  GiftOption[]
  onSelectGift: (itemId: string, option: GiftOption) => void
  onRemoveGift: (itemId: string) => void
  /** False on brands whose products no plan covers. */
  showWarranty: boolean
  onToggleWarranty: (itemId: string) => void
}

function CartItemRow({ item, onRemove, icons, giftOptions, onSelectGift, onRemoveGift, showWarranty, onToggleWarranty }: CartItemRowProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  // Lifted out of the tray so the control and its cards can sit in different
  // rows: the control belongs with the copy, the cards below the whole row.
  const [trayOpen, setTrayOpen] = useState(false)

  const giftTray = (
    <GiftTray
      itemName={item.name}
      options={giftOptions}
      selectedOptionId={item.giftPackaging?.optionId}
      icons={icons}
      open={trayOpen}
      onToggle={() => setTrayOpen(o => !o)}
      onSelect={option => onSelectGift(item.id, option)}
      onRemove={() => onRemoveGift(item.id)}
    />
  )
  // Built once, placed twice — the cards belong under the price on desktop and
  // across the whole row on mobile. Only one placement is ever displayed.
  const giftPanel = trayOpen && !item.giftPackaging && giftOptions.length > 0 ? (
    <GiftTrayPanel
      options={giftOptions}
      icons={icons}
      onSelect={option => { onSelectGift(item.id, option); setTrayOpen(false) }}
    />
  ) : null

  // The floating cart's V1 checkbox row, on the bag page so a plan added there
  // is visible — and removable — here too. Both write the same cart state, so
  // the two surfaces cannot disagree.
  const warrantyRow = !showWarranty ? null : item.warranty ? (
    // Added: the offer is settled, so it reads as a line on the bag — the same
    // tick, name, price and bin as the packaging added above it, rather than a
    // ticked checkbox still phrased as an invitation.
    <div className={styles.warrantyAdded}>
      <span className={styles.warrantyAddedCheck} aria-hidden="true">
        <icons.CheckmarkIcon size={16} />
      </span>
      <span className={styles.warrantyAddedName}>{PLAN_TITLE}</span>
      <span className={styles.warrantyAddedPrice}>{formatPrice(WARRANTY_CENTS)}</span>
      <button
        type="button"
        className={styles.warrantyAddedRemove}
        aria-label={`Remove the ${PLAN_TITLE} from ${item.name}`}
        onClick={() => onToggleWarranty(item.id)}
      >
        <icons.TrashCanIcon size={20} />
      </button>
    </div>
  ) : (
    <div className={styles.itemWarrantyRow}>
      <button
        type="button"
        role="checkbox"
        aria-checked={false}
        className={styles.warrantyToggle}
        onClick={() => onToggleWarranty(item.id)}
      >
        <span className={styles.warrantyCheckbox} aria-hidden="true">
          <icons.CheckboxIcon size={24} />
        </span>
        <span className={styles.warrantyLabel}>
          Add a {PLAN_TITLE} for{' '}
          <span className={styles.warrantyPrice}>{formatPrice(WARRANTY_CENTS)}</span>
        </span>
      </button>
    </div>
  )

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

        {/* Desktop: the control sits with the copy, centred against the image. */}
        <div className={styles.itemGiftTrayInline}>
          {giftTray}
          {warrantyRow}
        </div>

        {/* Desktop: the cards follow the control in flow, so the gap between
            them is the tray's own and not whatever the image's row left over.
            They run past the image's foot, which is fine — the copy column
            starts to its right. */}
        {giftPanel && <div className={styles.itemGiftPanelInline}>{giftPanel}</div>}
      </div>

      {/* Mobile: a row of its own across the full width — the copy column
          beside the image is barely half a phone wide and the control wraps
          inside it. Same component, same lifted state, so the two placements
          cannot disagree; only one is ever displayed. */}
      <div className={styles.itemGiftTrayRow}>
        {giftTray}
        {warrantyRow}
      </div>

      {/* Mobile: a row of its own under the image, where the copy column is too
          narrow for a card. */}
      {giftPanel && <div className={styles.itemGiftPanel}>{giftPanel}</div>}
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
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  const { items, subtotal, removeItem, updateGiftPackaging, toggleWarranty } = useCart()
  const icons = BRAND_ICONS[brand]
  const searchParams = useSearchParams()

  // The bag is one shared store, so without this the previous brand's products
  // follow you here. Same rule the checkout uses.
  useDemoCartSync()

  // Printed designs are brand-scoped and shared by every option flagged `designs`.
  const giftDesigns = BRAND_GIFT_CONFIG[brand]?.assets?.designOptions ?? []
  const giftingVariant = readGiftingVariant(searchParams)
  const flowConfig = getFlowConfig(readFlow(searchParams))
  const features   = getBrandFeatures(brand)

  /** Every step forward carries the configuration, or the demo resets itself. */
  const query = searchParams.toString()
  const checkoutHref = `/${brand}/checkout${query ? `?${query}` : ''}`

  // Phase 3 has no bag page. Arriving here by link or by switching flow while
  // standing on it would strand the shopper on a page that flow does not have,
  // so move them on rather than render it.
  const router = useRouter()
  useEffect(() => {
    if (!flowConfig.hasCartPage) router.replace(checkoutHref)
  }, [flowConfig.hasCartPage, checkoutHref, router])

  const brandGiftOptions: GiftOption[] = getGiftOptions(brand).map(o => ({
    id:            o.id,
    name:          o.name,
    description:   o.description,
    price:         o.price,
    originalPrice: o.originalPrice,
    imageUrl:      o.image,
    designs:       o.designs,
    wantsName:     o.wantsName,
    wantsPhoto:    o.wantsPhoto,
  }))

  /** An item's own packaging when it brings some, else the brand's catalogue. */
  const giftOptionsFor = (item: CartItem): GiftOption[] =>
    optionsForItem(
      { id: item.id, name: item.name, imageUrl: item.image,
        giftOptions: item.giftOptions?.map(o => ({
          id: o.id, name: o.name, description: o.description, price: o.price,
          originalPrice: o.originalPrice, imageUrl: o.image,
          designs: o.designs, wantsName: o.wantsName, wantsPhoto: o.wantsPhoto,
        })) },
      brandGiftOptions,
    )

  // Choosing a packaging opens the panel rather than saving on the spot: the
  // note, the design and the name are the point of the offer, and there is
  // nowhere else on this page to write them.
  const [giftDraft, setGiftDraft] = useState<GiftDraft | null>(null)

  const handleSelectGift = (itemId: string, option: GiftOption) => {
    const existing = items.find(i => i.id === itemId)?.giftPackaging
    const sameOption = existing?.optionId === option.id
    setGiftDraft({
      itemId,
      optionId: option.id,
      // Designs are cosmetic, so the first is a safe default and saves a click.
      design: option.designs ? (sameOption ? existing.selectedDesign ?? null : giftDesigns[0]?.key ?? null) : null,
      note:   sameOption ? existing.giftNote ?? '' : '',
      pname:  sameOption ? existing.recipientName ?? '' : '',
      photo:  false,
    })
  }

  const handleRemoveGift = (itemId: string) => updateGiftPackaging(itemId, undefined)

  const draftItem   = giftDraft ? items.find(i => i.id === giftDraft.itemId) ?? null : null
  const draftOption = giftDraft && draftItem
    ? giftOptionsFor(draftItem).find(o => o.id === giftDraft.optionId) ?? null
    : null

  const giftingIcons = {
    GiftIcon:      icons.GiftIcon,
    CheckmarkIcon: icons.CheckmarkIcon,
    XIcon:         icons.XIcon,
    AiMagicIcon:   icons.AiMagicIcon,
    TrashCanIcon:  icons.TrashCanIcon,
    PlusMinusIcon: icons.PlusMinusIcon,
  }

  const generateGiftNote = async () => 'Wishing you a wonderful day filled with joy!'

  const closeGiftDraft = () => setGiftDraft(null)

  const saveGiftDraft = () => {
    if (!giftDraft || !draftOption) return
    const gift: GiftPackaging = {
      // The two legacy types predate the catalogue; the id is what identifies
      // the option now, and the name saves every reader a lookup.
      type:     draftOption.id.includes('personalized') ? 'personalized' : 'classic',
      optionId: draftOption.id,
      name:     draftOption.name,
      price:    draftOption.price,
      originalPrice: draftOption.originalPrice,
      giftNote:       giftDraft.note || undefined,
      selectedDesign: giftDraft.design ?? undefined,
      recipientName:  giftDraft.pname || undefined,
    }
    updateGiftPackaging(giftDraft.itemId, gift)
    closeGiftDraft()
  }

  /** What the packaging on this bag costs, kept beside the merchandise total. */
  const giftTotal = items.reduce((sum, item) => sum + (item.giftPackaging?.price ?? 0), 0)

  const [selectedShipping, setSelectedShipping] = useState<'free' | 'express'>('free')
  const [promoCode,    setPromoCode]    = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [appliedCode,  setAppliedCode]  = useState('')

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

  const carouselRef = useRef<HTMLDivElement>(null)
  const scrollCarousel = (dir: 'prev' | 'next') => {
    carouselRef.current?.scrollBy({ left: dir === 'next' ? 220 : -220, behavior: 'smooth' })
  }

  const totalOriginalValue = items.reduce((sum, item) => sum + (item.originalPrice ?? item.price), 0)
  const savings    = totalOriginalValue - subtotal
  // Only a flow that asks here can charge here.
  const shippingCost   = flowConfig.shipping === 'cart' && selectedShipping === 'express' ? 1500 : 0
  const discountAmount = promoApplied ? Math.round(subtotal * 0.20) : 0
  const orderTotal     = subtotal + giftTotal + shippingCost - discountAmount

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
                <CartItemRow
                  key={item.id}
                  item={item}
                  onRemove={removeItem}
                  icons={icons}
                  giftOptions={giftOptionsFor(item)}
                  onSelectGift={handleSelectGift}
                  onRemoveGift={handleRemoveGift}
                  showWarranty={features.warranty}
                  onToggleWarranty={toggleWarranty}
                />
              ))}
            </div>

            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <span className={styles.subtotalAmount}>{formatPrice(subtotal + giftTotal)}</span>
            </div>
          </section>

          {/* ── Left: Upsell Carousel ─────────────────────────────── */}
          {SHOW_UPSELL_CAROUSEL && (
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
          )}

          {/* ── Right Column — before continueShoppingRow in DOM so it appears
               between upsell and "Continue Shopping" on mobile, while
               grid-area places it in the right column on desktop ─────── */}
          <aside className={styles.rightCol}>

            {/* Shipping Options — Phase 1 only; Phases 2 and 3 ask at checkout. */}
            {flowConfig.shipping === 'cart' && (
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
            </section>
            )}

            {/* Order Summary */}
            <section className={styles.orderSummary} aria-labelledby="summary-heading">
              <h2 id="summary-heading" className={styles.sectionTitle}>Order Summary</h2>

              {/* The checkout's promo control, inside the card and above the
                  figures it changes — not a separate accordion above it. */}
              <div className={`${checkoutStyles.promoRow} ${styles.cartPromoRow}`}>
                <span className={checkoutStyles.promoQuestion}>
                  <icons.CouponIcon size={16} />
                  Have a promo code?
                </span>
                {promoApplied ? (
                  <div className={checkoutStyles.promoAppliedWrap}>
                    <div className={checkoutStyles.appliedPromoBox}>
                      <span className={checkoutStyles.appliedPromoIcon}>
                        <icons.CouponIcon size={16} />
                      </span>
                      <span className={checkoutStyles.appliedPromoCode}>{appliedCode}</span>
                      <button
                        type="button"
                        className={checkoutStyles.removePromoBtn}
                        onClick={handleRemovePromo}
                        aria-label="Remove promo code"
                      >
                        <icons.XIcon size={16} />
                      </button>
                    </div>
                    <p className={checkoutStyles.promoSuccessMsg}>You saved 20% with this coupon.</p>
                  </div>
                ) : (
                  <div className={checkoutStyles.storeCreditRow}>
                    <div className={checkoutStyles.storeCreditInput}>
                      <input
                        type="text"
                        placeholder="Promo code"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        className={checkoutStyles.input}
                        aria-label="Promo code"
                      />
                    </div>
                    <Button
                      variant="primary"
                      className={checkoutStyles.applyButton}
                      onClick={handleApplyPromo}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Subtotal:</span>
                  <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
                </div>
                {giftTotal > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Gift packaging:</span>
                    <span className={styles.summaryValue}>{formatPrice(giftTotal)}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Shipping:</span>
                  <span className={styles.summaryValueBold}>
                    {flowConfig.shipping === 'cart'
                      ? (selectedShipping === 'free' ? 'Free' : formatPrice(shippingCost))
                      : 'Calculated at checkout'}
                  </span>
                </div>
                {promoApplied && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Promotional Discounts:</span>
                    <span className={styles.summaryValue}>−{formatPrice(discountAmount)}</span>
                  </div>
                )}
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

              <Button variant="add-to-cart" href={checkoutHref} className={styles.checkoutButton}>
                Continue to Checkout
              </Button>

              {savings > 0 && (
                <p className={styles.savingsNote}>You're saving {formatPrice(savings)} on this order!</p>
              )}

              {/* One page per flow shows these — here when there is a cart
                  page, on checkout when there is not. */}
              {flowConfig.usps === 'cart' && (
                <Usps icons={icons} showWarranty={features.warranty} />
              )}
            </section>

          </aside>

          {/* ── Left: Continue Shopping — after aside so it appears last on
               mobile; grid-area places it in the left column on desktop ── */}
          {SHOW_CONTINUE_SHOPPING && (
            <div className={styles.continueShoppingRow}>
              <Link href={`/${brand}/category`} className={styles.continueShoppingLink}>
                Continue Shopping
              </Link>
            </div>
          )}

        </div>
        </div>
      </main>

      {/* Item and packaging are both settled by the time this opens, so either
          panel goes straight to the fields — no item step, no picker. */}
      {giftDraft && draftOption && draftItem && (
        giftingVariant === 'v2' ? (
          <GiftPanel
            icons={{ ...giftingIcons, WarningIcon: icons.WarningIcon }}
            option={draftOption}
            eligibleItems={[]}
            selectedItem={{ id: draftItem.id, name: draftItem.name, imageUrl: draftItem.image }}
            designs={giftDesigns}
            draft={{
              optionId: giftDraft.optionId,
              itemId:   giftDraft.itemId,
              history:  ['config'],
              note:     giftDraft.note,
              design:   giftDraft.design,
              pname:    giftDraft.pname,
              photo:    giftDraft.photo,
            }}
            onDraftChange={next => setGiftDraft({
              itemId: next.itemId ?? giftDraft.itemId,
              optionId: next.optionId,
              note: next.note, design: next.design, pname: next.pname, photo: next.photo,
            })}
            onAddToBag={saveGiftDraft}
            onClose={closeGiftDraft}
            onGenerateNote={generateGiftNote}
          />
        ) : (
          <GiftingDrawer
            icons={giftingIcons}
            designs={giftDesigns}
            option={draftOption}
            item={{ id: draftItem.id, name: draftItem.name, imageUrl: draftItem.image }}
            note={giftDraft.note}
            design={giftDraft.design}
            pname={giftDraft.pname}
            photo={giftDraft.photo}
            onNoteChange={note => setGiftDraft(d => d && ({ ...d, note }))}
            onDesignChange={design => setGiftDraft(d => d && ({ ...d, design }))}
            onNameChange={pname => setGiftDraft(d => d && ({ ...d, pname }))}
            onPhotoChange={photo => setGiftDraft(d => d && ({ ...d, photo }))}
            onAddToBag={saveGiftDraft}
            onClose={closeGiftDraft}
            onGenerateNote={generateGiftNote}
          />
        )
      )}

      <Footer columns={footerColumns} />
    </div>
  )
}

// ─── Export ────────────────────────────────────────────────────────────────────

export default function CartPageClient() {
  return <CartPageInner />
}
