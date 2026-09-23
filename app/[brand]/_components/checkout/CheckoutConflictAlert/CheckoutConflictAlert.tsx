'use client'

import { useEffect, useId, useRef, useState } from 'react'

import type { IconProps } from '@/src/components/icons/Icon'
import { Button } from '../../Button'
import styles from './CheckoutConflictAlert.module.css'

export interface CheckoutConflictAlertIcons {
  /** Outlined circle with an exclamation mark — brand-scoped, resolved by the caller. */
  WarningIcon: React.ComponentType<IconProps>
}

export interface CheckoutConflictAlertProps {
  icons:     CheckoutConflictAlertIcons
  /** Overridable so a real 409 response can supply the server's own copy. */
  title?:    string
  message?:  string
  /** Defaults to a full page reload, which is what re-reads the newer checkout. */
  onRefresh?: () => void
  /**
   * The primary instance announces itself as a live region and pulls focus.
   * A repeat of the same alert further down the page must set this false:
   * two live regions would have a screen reader read the conflict twice, and
   * two mount effects would fight over scroll position and focus.
   */
  announce?: boolean
  className?: string
}

const DEFAULT_TITLE   = 'Your cart was updated'
const DEFAULT_MESSAGE =
  'A newer version of this checkout exists with different details. Please refresh to continue.'

/**
 * Blocks submission when the checkout in this tab is stale — a newer session
 * (an abandoned-cart email, a second tab) has already saved different data, so
 * placing the order from here would write against a version the server has
 * moved past. The only safe way forward is to re-read the checkout.
 *
 * Takes its copy and its refresh handler as props so the real conflict response
 * can drive it, rather than it being tied to the preview toggle.
 */
export function CheckoutConflictAlert({
  icons,
  title   = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
  onRefresh,
  announce = true,
  className,
}: CheckoutConflictAlertProps) {
  const { WarningIcon } = icons
  const titleId = useId()
  const ref     = useRef<HTMLDivElement>(null)

  // Held until the new document takes over, so the button shows the reload is
  // under way instead of sitting inert during the navigation.
  const [isRefreshing, setIsRefreshing] = useState(false)

  // The alert is injected above the fold of a long form; on mobile it can land
  // off-screen entirely. Pull it into view and take focus so it is not missed.
  useEffect(() => {
    if (!announce) return

    const el = ref.current
    if (!el) return

    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.focus({ preventScroll: true })
  }, [announce])

  const handleRefresh = () => {
    if (isRefreshing) return
    setIsRefreshing(true)

    // Double rAF: the first frame lets React flush the spinner, the second
    // fires once it has actually painted. Navigating straight from the click
    // handler tears the document down before that paint ever lands, so the
    // button would sit on "Refresh page" through the whole reload.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (onRefresh) {
          onRefresh()
          return
        }
        window.location.reload()
      })
    })
  }

  return (
    <div
      ref={ref}
      // Only the announcing copy is a live region and a focus target; the
      // repeat is a plain labelled group so its button stays reachable.
      {...(announce ? { role: 'alert', tabIndex: -1 } : { role: 'group' })}
      aria-labelledby={titleId}
      className={[styles.alert, className].filter(Boolean).join(' ')}
    >
      <div className={styles.body}>
        {/* Decorative: the title and message already carry the meaning. Sized in
            CSS rather than via `size`, so the span can stay the aria-hidden host. */}
        <span className={styles.icon} aria-hidden="true">
          <WarningIcon />
        </span>

        <div className={styles.text}>
          <h2 id={titleId} className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </div>
      </div>

      {/* Design-system button, recoloured to the error red via the module class. */}
      <Button
        variant="primary"
        className={styles.button}
        onClick={handleRefresh}
        disabled={isRefreshing}
        aria-live="polite"
        leadingIcon={isRefreshing ? <span className={styles.spinner} aria-hidden="true" /> : undefined}
      >
        {isRefreshing ? 'Refreshing' : 'Refresh page'}
      </Button>
    </div>
  )
}
