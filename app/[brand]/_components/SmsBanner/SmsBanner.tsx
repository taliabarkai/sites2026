'use client'

import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'
import { Button } from '../Button'
import { SMS_SIGNUP } from '../../_config/siteContent'
import styles from './SmsBanner.module.css'

interface SmsBannerProps {
  icons: { SmsIcon: React.ComponentType<IconProps> }
  onSignUp: () => void
  /**
   * Overrides the shared headline. The confirmation page's copy lives in
   * SMS_SIGNUP and is not this page's to change, so a caller that wants
   * different words passes them rather than editing the constant.
   */
  title?: string
  /** Stacks the copy and runs the button full width, for a narrow column. */
  stacked?: boolean
  className?: string
}

/**
 * The SMS prompt as the confirmation page draws it: tinted band, mark on the
 * left, copy beside it, the call to action at the end.
 *
 * Copy comes from `SMS_SIGNUP`, the same constant that page reads, so the two
 * cannot drift apart.
 */
export function SmsBanner({ icons, onSignUp, title, stacked = false, className }: SmsBannerProps) {
  const { SmsIcon } = icons
  const heading = title ?? SMS_SIGNUP.title

  return (
    <section
      className={[styles.block, className].filter(Boolean).join(' ')}
      aria-label={heading}
    >
      <div className={`${styles.sms} ${stacked ? styles.smsStacked : ''}`}>
        <span className={styles.icon} aria-hidden="true"><SmsIcon size={60} /></span>
        <div className={styles.copy}>
          <p className={styles.title}>{heading}</p>
          <p className={styles.body}>{SMS_SIGNUP.body}</p>
        </div>
        <Button variant="primary" className={styles.button} onClick={onSignUp}>
          {SMS_SIGNUP.cta}
        </Button>
      </div>
    </section>
  )
}
