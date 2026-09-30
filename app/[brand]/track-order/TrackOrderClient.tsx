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
/**
 * `subtext` takes the shopper's first name: the line under the headline is
 * the one place on the page that speaks to them rather than about the order.
 */
const STATUS_COPY: Record<OrderStatus, { headline: string; subtext: (name: string) => string }> = {
  placed:           { headline: 'Your order is confirmed',    subtext: name => `We’ve got it, ${name}. You’ll hear from us as soon as it moves.` },
  creation:         { headline: 'Your jewelry is being made', subtext: name => `Each piece is made to order, ${name}, so this is the longest step.` },
  packing:          { headline: 'Packing & quality control',  subtext: name => `We’re checking it over and boxing it up, ${name}.` },
  shipped:          { headline: 'Your order has shipped',     subtext: name => `It’s on its way to you, ${name}.` },
  out_for_delivery: { headline: 'Out for delivery',           subtext: name => `It’s on the van and arriving today, ${name}.` },
  delivered:        { headline: 'Your order was delivered',   subtext: name => `We hope you love it, ${name}.` },
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
 * Parked, not removed: flip either to true to bring the card back. The markup
 * and styles stay where they are so this is a one-word change.
 */
const SHOW_LOOKUP_NEED_HELP   = false
const SHOW_RESULTS_NEED_HELP  = false
const SHOW_RESULTS_DETAILS    = false

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LookupState = 'idle' | 'loading' | 'notFound'

export function TrackOrderClient() {
  const pathname     = usePathname()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const brand        = getBrandFromPathname(pathname)
  const icons        = BRAND_ICONS[brand]
  /* Resolved through BRAND_ICONS like everything else — these three are named
     because the tracking block renders them directly. */
  const { ArrowIcon, CheckmarkIcon, ClipboardCopyIcon } = icons

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

  /*
   * Raised while a reset is navigating.
   *
   * `router.replace` does not land in the same tick as the state updates
   * beside it, so for one render the order is cleared while the URL still
   * names it — and the effect below, seeing exactly that, would fetch the
   * order straight back and undo the reset. Clearing on "the URL has no
   * order" instead is not an option: a submit sets the order first and
   * writes the URL after, so the same rule would wipe every lookup.
   */
  const resettingRef = useRef(false)

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
    if (resettingRef.current) {
      /* Lower the flag once the navigation has actually landed. */
      if (!urlOrder && !urlEmail) resettingRef.current = false
      return
    }
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

  /**
   * Back to the lookup exactly as it first loads.
   *
   * Every parameter goes, not just the order and the email: `state=error`
   * and the QA status override would otherwise follow the shopper back and
   * the "default" page would not be the default. Scroll goes to the top too,
   * since the link that gets here sits at the foot of a long page.
   */
  const resetLookup = () => {
    resettingRef.current = true
    setOrder(null)
    setState('idle')
    setErrors({})
    setOrderNumber('')
    setEmail('')
    setCopied(false)

    /* The fields are controlled, but the nodes are emptied directly as well:
       this is the same Chrome value restoration the mount effect guards
       against, which can otherwise put the old text straight back. */
    if (orderFieldRef.current) orderFieldRef.current.value = ''
    if (emailFieldRef.current) emailFieldRef.current.value = ''

    router.replace(pathname, { scroll: false })
    window.scrollTo({ top: 0 })
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
            subhead={STATUS_COPY[order.status].subtext(order.customer.firstName)}
            orderNumber={order.orderNumber}
            orderDate={order.orderDate}
            estDeliveryDate={order.estDeliveryDate}
            estDeliveryWeekday={order.estDeliveryWeekday}
            arrivingToday={order.arrivingToday}
            icons={icons}
          />

          <SmsBanner icons={icons} title="Join our SMS club" onSignUp={() => undefined} />

          <section className={styles.card} aria-labelledby="order-updates-title">
            <h2 id="order-updates-title" className={styles.sectionTitle}>Order Updates</h2>

            <OrderProgress status={order.status} icons={icons} className={styles.progress} />

            {/* Nothing to trace until the parcel has actually left. */}
            {hasTracking(order.status) && (
              <div className={styles.tracking}>
                <h3 className={styles.trackingTitle}>Shipping Updates</h3>

                <div className={styles.trackingRow}>
                  <div className={styles.trackingFact}>
                    <span className={styles.trackingLabel}>Tracking number</span>
                    <span className={styles.trackingNumberRow}>
                      <span className={styles.trackingNumber}>{order.carrier.trackingNumber}</span>
                      <button
                        type="button"
                        className={styles.copyButton}
                        onClick={copyTracking}
                      >
                        <span className={styles.srOnly}>
                          {copied ? 'Tracking number copied' : 'Copy tracking number'}
                        </span>
                        {copied
                          ? <CheckmarkIcon size={16} />
                          : <ClipboardCopyIcon size={16} />}
                      </button>
                    </span>
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
                    Track Your Package
                    <ArrowIcon size={24} className={styles.trackLinkArrow} />
                    <span className={styles.srOnly}> (opens in a new tab)</span>
                  </a>
                </div>
              </div>
            )}
          </section>

          {SHOW_RESULTS_NEED_HELP && (
            <section className={styles.card} aria-labelledby="results-help-title">
              <h2 id="results-help-title" className={styles.sectionTitle}>Need Help With Your Order?</h2>
              {needHelpTiles(['Shipping & Delivery', 'Change Order Details', 'Received Item Issues', 'Contact Us'])}
            </section>
          )}

          <div className={styles.continueRow}>
            <button type="button" className={styles.continueLink} onClick={resetLookup}>
              Track Another Order
            </button>
          </div>
        </div>

        <div className={styles.sideColumn}>
          {/* Collapsible here and only here: the confirmation page shows the
              order it has just taken in full, while this is a page you come
              back to, where the totals answer the question. */}
          <OrderSummary
            items={order.items}
            subtotal={order.totals.subtotal}
            shipping={order.totals.shipping}
            promoDiscount={order.totals.promoDiscount}
            shippingNote={order.shippingMethod.estimate}
            tax={order.totals.tax}
            total={order.totals.total}
            collapsible
            defaultOpen="desktop"
            icons={icons}
          />

          {SHOW_RESULTS_DETAILS && (
            <OrderDetails
              contact={{ email: order.email, phone: order.customer.phone }}
              shippingAddress={order.shippingAddress}
              shippingMethod={order.shippingMethod}
              paymentMethod={order.paymentMethod}
              maskPhone
              stacked
            />
          )}

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
      {/* The toggle previews a failed lookup, so it goes once there is an
          order on screen — there is no error state to show from there. */}
      <Header
        variant="white"
        brand={brand}
        navLinks={navLinks}
        topline={topline}
        sticky={false}
        showStateToggle={!order}
      />

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
