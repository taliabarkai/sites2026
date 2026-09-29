'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'

import { AuthModal, type AuthTab } from '../_components/AuthModal'
import { Button } from '../_components/Button'
import { Field } from '../_components/Field'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { OrderDetails } from '../_components/OrderDetails'
import { OrderProgress } from '../_components/OrderProgress'
import { OrderStatusHeader } from '../_components/OrderStatusHeader'
import { OrderSummary } from '../_components/OrderSummary'
import { PromoCard } from '../_components/PromoCard'
import { SmsBanner } from '../_components/SmsBanner'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
  SMS_SIGNUP,
  TRUSTPILOT,
} from '../_config/siteContent'
import { readIsErrorState } from '../_config/demoParams'
import { getTrackedOrder, type TrackedOrder } from '../_lib/getTrackedOrder'
import type { AuthUser } from '../_lib/mockAuth'
import { hasTracking, type OrderStatus } from '../_lib/orderStatus'
import styles from './TrackOrderPage.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const


/** What the header says, per status. */
const STATUS_COPY: Record<OrderStatus, { headline: string; subtext: string }> = {
  placed:           { headline: 'Your order is confirmed!',   subtext: 'We’ve got it. You’ll hear from us as soon as it moves.' },
  creation:         { headline: 'Your jewelry is being made', subtext: 'Each piece is made to order, so this is the longest step.' },
  packing:          { headline: 'Packing & quality control',  subtext: 'We’re checking it over and boxing it up.' },
  shipped:          { headline: 'Your order has shipped!',     subtext: 'It’s with the carrier and on its way to you.' },
  out_for_delivery: { headline: 'Out for delivery',           subtext: 'It’s on the van and arriving today.' },
  delivered:        { headline: 'Your order was delivered',   subtext: 'We hope you love it.' },
}

/** The one action worth offering at each stage. */
function ctaFor(status: OrderStatus, brand: string, onTrack: () => void) {
  switch (status) {
    case 'placed':
    case 'creation':
      return { label: 'Change Order Details', href: withBrandPrefix(brand, '/contact-us') }
    case 'packing':
      return { label: 'View Order Updates', onClick: onTrack }
    case 'shipped':
    case 'out_for_delivery':
      return { label: 'Track Package', onClick: onTrack }
    case 'delivered':
      return { label: 'Leave a Review', href: TRUSTPILOT.reviewUrl }
  }
}

/**
 * Parked, not removed: flip to true to bring the lookup page's Need Help card
 * back. The markup and styles stay where they are. The results view keeps its
 * own Need Help card, which this does not touch.
 */
const SHOW_LOOKUP_NEED_HELP = false

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LookupState = 'idle' | 'loading' | 'notFound'

export function TrackOrderClient() {
  const pathname     = usePathname()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const brand        = getBrandFromPathname(pathname)
  const icons        = BRAND_ICONS[brand]

  const navLinks      = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:    withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref:   withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  /* The looked-up order lives in the URL, so a refresh or a shared link lands
     back on the same result rather than an empty form. */
  const urlOrder  = searchParams.get('order') ?? ''
  const urlEmail  = searchParams.get('email') ?? ''
  const urlStatus = searchParams.get('status')
  /* The header's Default/Error toggle. Every lookup resolves in a prototype,
     so this is what makes the not-found state reachable. */
  const isErrorState = readIsErrorState(searchParams)

  const [orderNumber, setOrderNumber] = useState(urlOrder)
  const [email, setEmail]             = useState(urlEmail)
  const [errors, setErrors]           = useState<{ order?: string; email?: string }>({})
  const [state, setState]             = useState<LookupState>('idle')
  const [order, setOrder]             = useState<TrackedOrder | null>(null)
  const [copied, setCopied]           = useState(false)

  /* Signed-in state lives here for now. TODO: replace with the real session
     once an auth layer exists — the modal already hands back a user. */
  const [user, setUser]         = useState<AuthUser | null>(null)
  const [authTab, setAuthTab]   = useState<AuthTab | null>(null)

  const updatesRef = useRef<HTMLElement>(null)
  const orderFieldRef = useRef<HTMLInputElement>(null)
  const emailFieldRef = useRef<HTMLInputElement>(null)

  /*
   * Chrome restores what was typed into a form when the page is reloaded, and
   * it does so before React hydrates. The controlled value still matches the
   * first render, so React sees nothing to change and the restored text stays
   * on screen — which is why a refresh kept showing the last attempt.
   *
   * Clearing the DOM nodes on mount is what actually makes a refresh start
   * clean; a URL carrying a real lookup is the one case worth keeping.
   */
  useEffect(() => {
    if (!urlOrder && orderFieldRef.current) orderFieldRef.current.value = ''
    if (!urlEmail && emailFieldRef.current) emailFieldRef.current.value = ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollToUpdates = useCallback(() => {
    updatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  /* One lookup path, whether it came from the form or straight off the URL. */
  const runLookup = useCallback(async (nextOrder: string, nextEmail: string) => {
    setState('loading')
    const found = isErrorState
      ? null
      : await getTrackedOrder(nextOrder, nextEmail, { statusOverride: urlStatus })
    if (!found) {
      setOrder(null)
      setState('notFound')
      return null
    }
    setOrder(found)
    setState('idle')
    return found
  }, [urlStatus, isErrorState])

  /* The toggle is a preview, so flipping it shows the state at once rather
     than waiting for another submit: Error drops any result and raises the
     banner, Default clears it again. */
  useEffect(() => {
    if (isErrorState) {
      setOrder(null)
      setState('notFound')
    } else {
      setState(current => (current === 'notFound' ? 'idle' : current))
    }
  }, [isErrorState])

  /* A URL carrying both parts is a result to restore, not a form to fill.
     Skipped once that very order is already on screen, so writing the URL
     after a successful lookup does not fetch it a second time. */
  useEffect(() => {
    if (isErrorState) return
    if (!urlOrder || !urlEmail) return
    if (
      order &&
      order.orderNumber === urlOrder &&
      order.email.toLowerCase() === urlEmail.toLowerCase()
    ) return
    void runLookup(urlOrder, urlEmail)
  }, [urlOrder, urlEmail, order, runLookup, isErrorState])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const nextErrors: { order?: string; email?: string } = {}
    if (!orderNumber.trim()) nextErrors.order = 'Enter your order number'
    if (!email.trim()) nextErrors.email = 'Enter your email address'
    else if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = 'Enter a valid email address'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const nextOrder = orderNumber.trim().replace(/^#/, '')
    const nextEmail = email.trim()
    const found = await runLookup(nextOrder, nextEmail)

    /* Only a found order goes into the URL. A result should survive a refresh
       and be linkable; a failed attempt should not — reloading it would put
       the shopper back in front of the same error with their typing still in
       the fields, when what they want is a clean form. */
    if (!found) return

    const params = new URLSearchParams(searchParams.toString())
    params.set('order', nextOrder)
    params.set('email', nextEmail)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const openAuth  = (tab: AuthTab) => setAuthTab(tab)
  const closeAuth = () => setAuthTab(null)

  const resetLookup = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('order')
    params.delete('email')
    setOrder(null)
    setState('idle')
    setErrors({})
    setOrderNumber('')
    setEmail('')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  /**
   * The async clipboard API is refused often enough — an insecure origin, a
   * click the browser does not count as a gesture — that the old textarea
   * trick is kept behind it. "Copied" is only announced on a real success;
   * saying so when nothing was copied would be worse than staying quiet.
   */
  const copyTracking = async () => {
    if (!order) return
    const value = order.carrier.trackingNumber

    const viaClipboardApi = async () => {
      if (!navigator.clipboard?.writeText) return false
      try {
        await navigator.clipboard.writeText(value)
        return true
      } catch {
        return false
      }
    }

    const viaTextarea = () => {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = value
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(textarea)
        return ok
      } catch {
        return false
      }
    }

    if (!(await viaClipboardApi()) && !viaTextarea()) return

    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  /** Each topic as its own tile, so the four read as choices rather than a list. */
  const needHelpTiles = (topics: string[]) => (
    <ul className={styles.helpGrid}>
      {topics.map(topic => (
        <li key={topic}>
          <Link href={withBrandPrefix(brand, '/contact-us')} className={styles.helpTile}>
            <span>{topic}</span>
            <span className={styles.helpArrow} aria-hidden="true"><icons.ArrowIcon size={20} /></span>
          </Link>
        </li>
      ))}
    </ul>
  )

  // ── Lookup ─────────────────────────────────────────────────────────────────

  const lookup = (
    <div className={styles.lookupLayout}>
      <section className={styles.lookupCard} aria-labelledby="track-title">
        <h1 id="track-title" className={styles.title}>Track My Order</h1>
        <p className={styles.subtitle}>
          Enter your order number and the email you used at checkout
        </p>

        {state === 'notFound' && (
          <div className={styles.errorBanner} role="alert">
            <p className={styles.errorTitle}>We couldn&rsquo;t find an order with those details.</p>
            <p className={styles.errorHint}>
              Double-check the order number in your confirmation email and make sure the
              email matches the one used at checkout.
            </p>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Field
            ref={orderFieldRef}
            label="Order Number"
            placeholder="Order Number"
            value={orderNumber}
            onChange={event => setOrderNumber(event.target.value)}
            required
            aria-required="true"
            autoComplete="off"
            error={errors.order}
            invalid={state === 'notFound'}
          />
          <Field
            ref={emailFieldRef}
            label="Email Address"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
            aria-required="true"
            autoComplete="off"
            error={errors.email}
            invalid={state === 'notFound'}
            hint="Your order number is in your order confirmation email"
          />

          <Button
            variant="primary"
            type="submit"
            className={styles.submit}
            disabled={state === 'loading'}
          >
            {state === 'loading' ? 'Checking…' : 'Check Status'}
          </Button>
        </form>

        <div className={styles.divider}><span className={styles.dividerLabel}>or</span></div>

        <Button variant="secondary" className={styles.secondary} onClick={() => openAuth('signin')}>
          Sign In To See All Orders
        </Button>

        <p className={styles.signUpLine}>
          First time signing in?{' '}
          <button type="button" className={styles.inlineLinkButton} onClick={() => openAuth('create')}>
            Create an account
          </button>
        </p>
      </section>

      {/* Swappable: the reference leaves this section's content open, so it is
          a Need Help block until the real content lands. */}
      {SHOW_LOOKUP_NEED_HELP && (
        <section className={styles.helpCard} aria-labelledby="need-help-title">
          <h2 id="need-help-title" className={styles.helpTitle}>Need Help?</h2>
          {needHelpTiles(['Shipping & Delivery', 'Change Order Details', 'Contact Us'])}
        </section>
      )}
    </div>
  )

  // ── Results ────────────────────────────────────────────────────────────────

  const results = order && (
    <>
      <div className={styles.resultsLayout}>
        <div className={styles.mainColumn}>
          <OrderStatusHeader
            status={order.status}
            headline={STATUS_COPY[order.status].headline}
            orderNumber={order.orderNumber}
            orderDate={order.orderDate}
            estDeliveryDate={order.estDeliveryDate}
            estDeliveryWeekday={order.estDeliveryWeekday}
            arrivingToday={order.arrivingToday}
            icons={icons}
            link={{ label: 'View Updates', onClick: scrollToUpdates }}
          />

          <section ref={updatesRef} className={styles.card} aria-labelledby="shipping-updates-title">
            <h2 id="shipping-updates-title" className={styles.sectionTitle}>Shipping Updates</h2>

            <OrderProgress status={order.status} icons={icons} className={styles.progress} />

            {/* Nothing to trace until the parcel has actually left. */}
            {hasTracking(order.status) && (
              <div className={styles.tracking}>
                <div className={styles.trackingFact}>
                  <span className={styles.trackingLabel}>Carrier</span>
                  <span className={styles.trackingValue}>{order.carrier.name}</span>
                </div>
                <div className={styles.trackingFact}>
                  <span className={styles.trackingLabel}>Tracking #</span>
                  <span className={styles.trackingValue}>{order.carrier.trackingNumber}</span>
                </div>
                {/* An anchor, not the Button component: Button renders a
                    next/link for href and forwards nothing but onClick, so
                    target would be dropped. */}
                <a
                  className={styles.trackLink}
                  href={order.carrier.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Track Package
                  <span className={styles.srOnly}> (opens in a new tab)</span>
                </a>
              </div>
            )}
          </section>

          <section className={styles.card} aria-labelledby="results-help-title">
            <h2 id="results-help-title" className={styles.sectionTitle}>Need Help With Your Order?</h2>
            {needHelpTiles(['Shipping & Delivery', 'Change Order Details', 'Received Item Issues', 'Contact Us'])}
          </section>

          <div className={styles.continueRow}>
            <button type="button" className={styles.continueLink} onClick={resetLookup}>
              Track Another Order
            </button>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <SmsBanner icons={icons} title="Join our SMS club" stacked onSignUp={() => undefined} />

          {/* Collapsible here and only here: the confirmation page shows the
              order it has just taken in full, while this is a page you come
              back to, where the totals answer the question. */}
          <OrderSummary
            items={order.items}
            subtotal={order.totals.subtotal}
            shipping={order.totals.shipping}
            promoDiscount={order.totals.promoDiscount}
            tax={order.totals.tax}
            total={order.totals.total}
            collapsible
            icons={icons}
          />

          <OrderDetails
            contact={{ email: order.email, phone: order.customer.phone }}
            shippingAddress={order.shippingAddress}
            shippingMethod={order.shippingMethod}
            paymentMethod={order.paymentMethod}
            maskPhone
            stacked
          />

          {/* Only worth asking once the piece is actually in their hands. */}
          {order.status === 'delivered' && (
            <PromoCard
              title="Share the Love"
              body="Tell us about your experience and make an impact!"
              cta={{ label: 'Leave a review', href: TRUSTPILOT.reviewUrl, variant: 'secondary' }}
              footer={
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/images/trustpilot.svg"
                  alt={`Trustpilot ${TRUSTPILOT.score} out of ${TRUSTPILOT.outOf}`}
                  className={styles.trustpilot}
                />
              }
            />
          )}

        </div>
      </div>
    </>
  )

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} sticky={false} />

      <main id="main-content" className={styles.main}>
        <div className={styles.inner}>
          {order ? results : lookup}
        </div>
      </main>

      <Footer columns={footerColumns} />

      <AuthModal
        open={authTab !== null}
        defaultTab={authTab ?? 'signin'}
        onClose={closeAuth}
        icons={icons}
        termsHref={withBrandPrefix(brand, '/terms')}
        privacyHref={withBrandPrefix(brand, '/privacy')}
        onAuthenticated={nextUser => {
          setUser(nextUser)
          /* No order-history page to send them to yet, so the next best thing
             is not asking for an address they just typed. TODO: replace with a
             redirect to order history once it exists. */
          setEmail(nextUser.email)
          closeAuth()
        }}
      />
    </div>
  )
}

export default TrackOrderClient
