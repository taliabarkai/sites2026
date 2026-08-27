'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import { Button } from '../_components/Button'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
  SMS_SIGNUP,
  TRUSTPILOT,
} from '../_config/siteContent'
import { BRAND_LOYALTY } from '../_config/loyalty'
import type { LoyaltyPerkIcon } from '../_config/loyalty'
import { createSampleOrder, loadPlacedOrder } from '../_context/placedOrder'
import type { FulfillmentStatus, PlacedOrder } from '../_context/placedOrder'
import styles from './ConfirmationPage.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  const dollars = cents / 100
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`
}

// ─── Data ─────────────────────────────────────────────────────────────────────

/** The fulfillment journey, in order. The stepper fills up to the current one. */
const FULFILLMENT_STEPS: Array<{ key: FulfillmentStatus; label: string }> = [
  { key: 'order_placed',     label: 'Order Placed' },
  { key: 'jewelry_creation', label: 'Jewelry Creation' },
  { key: 'packing_qc',       label: 'Packing & Quality Control' },
  { key: 'shipped',          label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmationPageClient() {
  const pathname = usePathname()
  const brand    = getBrandFromPathname(pathname)

  const icons = BRAND_ICONS[brand]
  const { CheckmarkIcon, SmsIcon, DeliveryBoxIcon, GiftIcon, KeyIcon, CouponIcon } = icons

  /* Which icon each perk names. The first three come from the brand's own set;
     the rest are TGR artwork, and only TGR's programme asks for them. */
  const perkIcons: Record<LoyaltyPerkIcon, typeof GiftIcon> = {
    deliveryBox: DeliveryBoxIcon,
    gift:        GiftIcon,
    key:         KeyIcon,
    trackOrder:  tgrIcons.TrackOrderIcon,
    freeGifts:   tgrIcons.FreeGiftsIcon,
    earnPoints:  tgrIcons.EarnPointsIcon,
  }

  /* The order lives in session storage, so it can only be read on the client —
     hence the null first pass. Opening the page without one (a shared link, a
     fresh tab) falls back to a sample order for this brand: the URL is meant to
     be shared, so it has to stand on its own rather than redirect to checkout. */
  const [order, setOrder] = useState<PlacedOrder | null>(null)

  useEffect(() => {
    setOrder(loadPlacedOrder() ?? createSampleOrder(brand))
  }, [brand])

  const navLinks      = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:    withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref:   withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} sticky={false} />
        <main id="main-content" className={styles.pending} aria-busy="true" />
        <Footer columns={footerColumns} />
      </div>
    )
  }

  const { customer, items, shippingAddress, shippingMethod, paymentMethod, totals, loyalty } = order
  const activeStep = FULFILLMENT_STEPS.findIndex((step) => step.key === order.fulfillmentStatus)

  // ── Blocks ──────────────────────────────────────────────────────────────────
  // Rendered into two columns for desktop; the stylesheet flattens those and
  // reorders the blocks for mobile, where Order Summary and Share the Love are
  // interleaved into the flow rather than stacked at the end.

  const confirmationHeader = (
    <section className={`${styles.card} ${styles.blockHeader}`} aria-labelledby="confirmation-title">
      <span className={styles.badge} aria-hidden="true">
        <CheckmarkIcon size={22} color="var(--colors-text-inverse)" />
      </span>
      <h1 id="confirmation-title" className={styles.title}>Your order is confirmed!</h1>
      <p className={styles.lede}>
        Thanks for shopping with us, {customer.firstName}. You&rsquo;ll receive an email confirmation soon.
      </p>
      <p className={styles.meta}>
        <span className={styles.metaLabel}>Order Number:</span>{' '}
        <span className={styles.metaValue}>{order.order.orderNumber}</span>
      </p>
      <p className={styles.meta}>
        <span className={styles.metaLabel}>Est. Delivery Date:</span>{' '}
        <span className={styles.metaValue}>{order.order.estDeliveryDate}</span>
      </p>
    </section>
  )

  const smsBanner = (
    <section className={styles.blockSms} aria-label={SMS_SIGNUP.title}>
      <div className={styles.sms}>
        <span className={styles.smsIcon} aria-hidden="true"><SmsIcon size={60} /></span>
        <div className={styles.smsCopy}>
          <p className={styles.smsTitle}>{SMS_SIGNUP.title}</p>
          <p className={styles.smsBody}>{SMS_SIGNUP.body}</p>
        </div>
        <Button variant="primary" className={styles.smsButton} href="#">
          {SMS_SIGNUP.cta}
        </Button>
      </div>
    </section>
  )

  const orderDetails = (
    <section className={`${styles.card} ${styles.blockDetails}`} aria-labelledby="order-details-title">
      <h2 id="order-details-title" className={styles.sectionTitle}>Order Details</h2>

      <div className={styles.detailsGrid}>
        <div className={styles.detailsCol}>
          <div className={styles.detailGroup}>
            <h3 className={styles.detailHeading}>Contact Information</h3>
            <p className={styles.detailLine}>{customer.email}</p>
            <p className={styles.detailLine}>{customer.phone}</p>
          </div>
          <div className={styles.detailGroup}>
            <h3 className={styles.detailHeading}>Shipping Address</h3>
            <p className={styles.detailLine}>{shippingAddress.name}</p>
            <p className={styles.detailLine}>{shippingAddress.line1}</p>
            <p className={styles.detailLine}>{shippingAddress.cityStateZip}</p>
          </div>
        </div>

        <div className={styles.detailsCol}>
          <div className={styles.detailGroup}>
            <h3 className={styles.detailHeading}>Shipping Method</h3>
            <p className={styles.detailLine}>{shippingMethod.name}</p>
            <p className={styles.detailLine}>{shippingMethod.estimate}</p>
          </div>
          <div className={styles.detailGroup}>
            <h3 className={styles.detailHeading}>Payment Method</h3>
            <p className={styles.detailLine}>{paymentMethod.label}</p>
          </div>
        </div>
      </div>

      <p className={styles.helpLine}>
        If you need any help, feel free to{' '}
        <Link href={withBrandPrefix(brand, '/contact-us')} className={styles.inlineLink}>Contact Us</Link>.
      </p>
    </section>
  )

  const orderSummary = (
    <section className={`${styles.card} ${styles.blockSummary}`} aria-labelledby="order-summary-title">
      <div className={styles.summaryHead}>
        <h2 id="order-summary-title" className={styles.sectionTitle}>Order Summary</h2>
        <p className={styles.itemCount}>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
      </div>

      <ul className={styles.itemList}>
        {items.map((item, index) => (
          /* Keyed by position — the same product can be in an order twice with
             different personalisation. */
          <li key={`${item.name}-${index}`} className={styles.item}>
            <div className={styles.itemTop}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name} className={styles.itemImage} loading="lazy" />
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
              </div>
            </div>

            {item.attributes.length > 0 && (
              <dl className={styles.attributes}>
                {item.attributes.map((attribute) => (
                  <div key={attribute.label} className={styles.attributeRow}>
                    <dt className={styles.attributeLabel}>{attribute.label}:</dt>
                    <dd className={styles.attributeValue}>{attribute.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ul>

      <dl className={styles.totals}>
        <div className={styles.totalRow}>
          <dt>Subtotal:</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className={styles.totalRow}>
          <dt>Shipping:</dt>
          <dd>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</dd>
        </div>
        {totals.promoDiscount > 0 && (
          <div className={styles.totalRow}>
            <dt>Promotional Discounts:</dt>
            <dd className={styles.discount}>
              <CouponIcon size={16} />
              -{formatPrice(totals.promoDiscount)}
            </dd>
          </div>
        )}
        <div className={styles.totalRow}>
          <dt>Tax:</dt>
          <dd>{formatPrice(totals.tax)}</dd>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <dt>Order Total:</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>
    </section>
  )

  /* LAL, IB and MYKA run no loyalty programme, so the section is dropped */
  const program = BRAND_LOYALTY[brand]

  const keyClub = program && (
    <section className={`${styles.card} ${styles.blockKeyClub}`} aria-labelledby="key-club-title">
      <div className={styles.keyClubMain}>
        <h2 id="key-club-title" className={styles.sectionTitle}>{program.title}</h2>
        <p className={styles.keyClubCopy}>
          {program.unlockBefore}{' '}
          <span className={program.emphasizeBalance ? styles.keyClubBalance : undefined}>
            {loyalty.keysEarned} {program.unlockUnit}
          </span>{' '}
          {program.unlockAfter}
        </p>
        <Button variant="primary" className={styles.keyClubButton} href="#">
          {program.cta}
        </Button>
      </div>

      <ul className={styles.perks}>
        {program.perks.map((perk) => {
          const PerkIcon = perkIcons[perk.icon]
          return (
            <li key={perk.label} className={styles.perk}>
              <span className={styles.perkIcon} aria-hidden="true"><PerkIcon size={48} /></span>
              <span className={styles.perkLabel}>{perk.label}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )

  const orderUpdates = (
    <section className={`${styles.card} ${styles.blockUpdates}`} aria-labelledby="order-updates-title">
      <h2 id="order-updates-title" className={styles.sectionTitle}>Order Updates</h2>
      <p className={styles.meta}>
        Estimated Delivery Date:{' '}
        <span className={styles.updatesDate}>{order.order.estDeliveryDate}</span>
      </p>

      <ol className={styles.stepper}>
        {FULFILLMENT_STEPS.map((step, index) => {
          const reached = index <= activeStep
          return (
            <li
              key={step.key}
              className={`${styles.step} ${reached ? styles.stepReached : ''}`}
              aria-current={index === activeStep ? 'step' : undefined}
            >
              <span className={styles.stepCircle} aria-hidden="true">
                {reached && <CheckmarkIcon size={12} color="var(--colors-text-inverse)" />}
              </span>
              <span className={styles.stepLabel}>{step.label}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )

  const shareTheLove = (
    <section className={`${styles.card} ${styles.blockShare}`} aria-labelledby="share-title">
      <h2 id="share-title" className={styles.sectionTitle}>Share the Love</h2>
      <p className={styles.shareCopy}>
        Tell us about your experience<br />and make an impact!
      </p>
      <Button variant="secondary" className={styles.shareButton} href={TRUSTPILOT.reviewUrl}>
        Leave a review
      </Button>

      {/* Supplied as one piece of Trustpilot artwork — mark, stars and score */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/trustpilot.svg"
        alt={`Trustpilot ${TRUSTPILOT.score} out of ${TRUSTPILOT.outOf}`}
        className={styles.trustpilot}
      />
    </section>
  )

  const continueShopping = (
    <div className={styles.blockContinue}>
      <Link href={`/${brand}`} className={styles.continueLink}>Continue Shopping</Link>
    </div>
  )

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} sticky={false} />

      <main id="main-content" className={styles.main}>
        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            {confirmationHeader}
            {smsBanner}
            {orderDetails}
            {keyClub}
            {orderUpdates}
            {continueShopping}
          </div>

          <div className={styles.sideColumn}>
            {orderSummary}
            {shareTheLove}
          </div>
        </div>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}

export default ConfirmationPageClient
