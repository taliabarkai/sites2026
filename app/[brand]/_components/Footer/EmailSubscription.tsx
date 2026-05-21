'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { DEFAULT_NEWSLETTER, SOCIAL_LINKS } from '../../_config/siteContent'
import { getBrandFromPathname } from '../../_config/brands'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { InputAction } from '../InputAction'
import styles from './EmailSubscription.module.css'

const BRAND_ICONS = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib: ibIcons,
} as const

export interface EmailSubscriptionProps {
  eyebrow?: string
  title?: string
  description?: string
  emailPlaceholder?: string
  successMessage?: string
  errorMessage?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EmailSubscription({
  eyebrow = DEFAULT_NEWSLETTER.eyebrow,
  title = DEFAULT_NEWSLETTER.title,
  description = DEFAULT_NEWSLETTER.description,
  emailPlaceholder = DEFAULT_NEWSLETTER.emailPlaceholder,
  successMessage = DEFAULT_NEWSLETTER.successMessage,
  errorMessage = DEFAULT_NEWSLETTER.errorMessage,
}: EmailSubscriptionProps) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const { ArrowIcon } = BRAND_ICONS[brand]

  const handleSubmit = (value: string) => {
    if (!EMAIL_PATTERN.test(value.trim())) {
      setError(errorMessage)
      setSuccess(false)
      return
    }

    setError('')
    setSuccess(true)
  }

  return (
    <section className={styles.section} aria-labelledby="footer-newsletter-title">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id="footer-newsletter-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.description}>{description}</p>

      <InputAction
        inputType="email"
        placeholder={emailPlaceholder}
        buttonIcon={<ArrowIcon size={24} />}
        onSubmit={handleSubmit}
        errorMessage={error || undefined}
        successMessage={success ? successMessage : undefined}
        groupLabel="Newsletter signup"
        inputLabel="Email address"
        className={styles.form}
      />
    </section>
  )
}
