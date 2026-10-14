import { Button } from '../Button'
import { TRUSTPILOT } from '../../_config/siteContent'
import styles from './ShareTheLove.module.css'

export interface ShareTheLoveProps {
  /** Id for the heading — the section is labelled by it. */
  headingId?: string
  /** Layout and surface from the page (card, panel background, order). */
  className?: string
}

/**
 * "Share the Love" — asks for a Trustpilot review: title, a line of copy,
 * the review CTA and the Trustpilot score artwork. Used on the order
 * confirmation and on the customer feedback success screen.
 */
export function ShareTheLove({ headingId = 'share-title', className }: ShareTheLoveProps) {
  return (
    <section className={`${styles.root} ${className ?? ''}`} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>Share the Love</h2>
      <p className={styles.copy}>
        Tell us about your experience<br />and make an impact!
      </p>
      <Button variant="secondary" className={styles.button} href={TRUSTPILOT.reviewUrl}>
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
}
