'use client'

import { FormEvent, useState } from 'react'
import { DEFAULT_NEWSLETTER, SOCIAL_LINKS } from '../../_config/siteContent'
import { Button } from '../Button'
import { IconArrowRight } from '../icons/Icons'
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
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSuccess(false)

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(errorMessage)
      return
    }

    setError('')
    setSuccess(true)
    setEmail('')
  }

  return (
    <section className={styles.section} aria-labelledby="footer-newsletter-title">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id="footer-newsletter-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.description}>{description}</p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.srOnly} htmlFor="footer-email">
          Email address
        </label>
        <input
          id="footer-email"
          name="email"
          type="email"
          autoComplete="email"
          className={styles.input}
          placeholder={emailPlaceholder}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (error) setError('')
            if (success) setSuccess(false)
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'footer-email-error' : success ? 'footer-email-success' : undefined}
        />
        <Button type="submit" variant="primary" size="iconOnly" className={styles.submit} aria-label="Subscribe">
          <IconArrowRight />
        </Button>
      </form>

      {error && (
        <p id="footer-email-error" className={styles.messageError} role="alert">
          {error}
        </p>
      )}
      {success && (
        <p id="footer-email-success" className={styles.messageSuccess} role="status">
          {successMessage}
        </p>
      )}

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
