'use client'

import type { ReactNode } from 'react'
import { Button } from '../Button'
import styles from './PromoCard.module.css'

interface PromoCardProps {
  title: string
  body?: ReactNode
  /** Sits above the copy: the SMS mark, a loyalty key, whatever the card is for. */
  icon?: ReactNode
  cta?: {
    label:    string
    href?:    string
    onClick?: () => void
    variant?: 'primary' | 'secondary'
  }
  /** Artwork under the CTA, e.g. the Trustpilot lockup. */
  footer?: ReactNode
  className?: string
}

/**
 * One offer in a card: SMS signup, the loyalty programme, a review prompt.
 *
 * The three share a shape, so they share a component — which of them shows,
 * and when, is the page's business rather than the card's.
 */
export function PromoCard({ title, body, icon, cta, footer, className }: PromoCardProps) {
  return (
    <section
      className={[styles.card, className].filter(Boolean).join(' ')}
      aria-label={title}
    >
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}

      <h2 className={styles.title}>{title}</h2>
      {body && <p className={styles.body}>{body}</p>}

      {cta && (
        <Button
          variant={cta.variant ?? 'primary'}
          className={styles.cta}
          href={cta.href}
          onClick={cta.onClick}
        >
          {cta.label}
        </Button>
      )}

      {footer}
    </section>
  )
}
