'use client'

import { useState } from 'react'
import { DEFAULT_NEWSLETTER, SOCIAL_LINKS } from '../../_config/siteContent'
import { IconArrowRight } from '../icons/Icons'
import { InputAction } from '../InputAction'
import styles from './EmailSubscription.module.css'

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
        buttonIcon={<IconArrowRight />}
        onSubmit={handleSubmit}
        errorMessage={error || undefined}
        successMessage={success ? successMessage : undefined}
        groupLabel="Newsletter signup"
        inputLabel="Email address"
        className={styles.form}
      />

      <ul className={styles.socialList} aria-label="Social media">
        {SOCIAL_LINKS.map((item) => (
          <li key={item.label}>
            <a href={item.href} className={styles.socialLink}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
