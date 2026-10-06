'use client'

import { useId, type ReactNode } from 'react'
import { Button } from '../../../_components/Button'
import tokens from '../proposed-tokens.module.css'
import { ShowcaseCard } from '../ShowcaseCard'
import { useShowcaseView } from '../ShowcaseView'
import styles from './FocusRingCard.module.css'

const SPEC = [
  { term: 'Width', value: '2px', token: '--focus-ring-width' },
  { term: 'Gap', value: "None — the ring sits on the element's edge", token: '--focus-ring-offset' },
  { term: 'Color on light surfaces', value: 'Primary text color', token: '--focus-ring-color' },
  { term: 'Color on dark surfaces', value: 'Inverse text color', token: '--focus-ring-color-inverse' },
  { term: 'Shape', value: "Follows the element's corners", token: 'border-radius' },
  { term: 'Motion', value: 'Eases in over 150ms, instant with reduced motion', token: '--transition-fast' },
]

const SWATCHES = [
  { name: '18k gold vermeil', color: 'var(--gold-vermeil-18k)' },
  { name: 'Sterling silver', color: 'var(--sterling-silver-925)' },
  { name: '14k rose gold', color: 'var(--rose-gold-14k)' },
]

const NAV = ['Necklaces', 'Bracelets', 'Rings']

/** One component type. The treatment is named only in After — Before is one ring for all. */
function FocusType({ name, treatment, children }: { name: string; treatment: string; children: ReactNode }) {
  const { isAfter } = useShowcaseView()
  return (
    <div className={styles.type}>
      <span className={styles.typeLabel}>
        {name}
        {isAfter && `: ${treatment}`}
      </span>
      {children}
    </div>
  )
}

export function FocusRingCard() {
  const fieldId = useId()
  const { isAfter, ring } = useShowcaseView()

  return (
    <ShowcaseCard
      id="focus-ring"
      title="Focus ring"
      criteria={['2.4.7 Focus Visible', '2.4.13 Focus Appearance (AAA)', '1.4.11 Non-text Contrast']}
      notes={{
        before: 'One 0.5px ring for every component type, as on production today.',
        after: 'A 2px ring on the element’s edge, tailored to each component type.',
      }}
      dos={[
        "Keep the same core everywhere: a 2px solid ring on the element's edge.",
        'Use the treatment for the component type: field, swatch, filled button, link or over a photo.',
        'Switch to the inverse color on dark surfaces.',
      ]}
      donts={[
        "Don't remove the outline with outline: none or outline: 0.",
        "Don't rely on a border-color change alone to show focus.",
        "Don't mark the current page with an underline where focus is an underline.",
      ]}
    >
      <div className={styles.live}>
        <p className={styles.body}>
          Press Tab to move through these, or turn on &ldquo;Show all focus states&rdquo; in the top bar.
        </p>

        <div className={styles.types}>
          <FocusType name="Buttons" treatment="one thicker edge, a light line inside a fill">
            <div className={styles.row}>
              <Button variant="primary" className={ring(tokens.ringFilled)}>
                Add to bag
              </Button>
              <Button variant="secondary">Add engraving</Button>
            </div>
          </FocusType>

          <FocusType name="Text fields" treatment="ring, plus a darker border">
            <div className={styles.field}>
              <label htmlFor={fieldId} className={styles.fieldLabel}>
                Engraving text
              </label>
              <input
                id={fieldId}
                placeholder="Up to 12 characters"
                className={`${styles.input} ${ring(tokens.ringField)}`}
              />
            </div>
          </FocusType>

          <FocusType name="Nav links" treatment="a 3px underline appears">
            <nav aria-label="Example categories">
              <ul className={styles.nav}>
                {NAV.map((label) => (
                  <li key={label}>
                    <a href="#focus-ring" className={`${styles.navLink} ${ring(tokens.ringUnderline)}`}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </FocusType>

          <FocusType name="Text buttons" treatment="the underline thickens">
            <div className={styles.row}>
              <Button variant="link" className={ring(tokens.ringLink)}>
                Edit
              </Button>
              <Button variant="link" className={ring(tokens.ringLink)}>
                Remove
              </Button>
            </div>
          </FocusType>

          <FocusType name="Inline links" treatment="the underline thickens">
            <p className={styles.body}>
              Every necklace ships in a gift box. See{' '}
              <a href="#focus-ring" className={`${styles.link} ${ring(tokens.ringLink)}`}>
                shipping and returns
              </a>{' '}
              for delivery times.
            </p>
          </FocusType>

          <FocusType name="Swatches" treatment="the outer edge thickens">
            <div className={styles.swatches}>
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch.name}
                  type="button"
                  aria-label={swatch.name}
                  className={`${styles.swatch} ${ring(tokens.ringSwatch)}`}
                  style={{ background: swatch.color }}
                />
              ))}
            </div>
          </FocusType>

          <FocusType name="Over a photo" treatment="a light band outside the ring">
            <div className={styles.photo}>
              <Button variant="primary" className={ring(tokens.ringMedia)}>
                Shop necklaces
              </Button>
            </div>
          </FocusType>

          <FocusType name="Dark surface" treatment="the same treatments, in white">
            <div className={`${tokens.inverse} ${styles.dark}`}>
              <a href="#focus-ring" className={`${styles.navLink} ${styles.onDark} ${ring(tokens.ringUnderline)}`}>
                Gift cards
              </a>
              <a href="#focus-ring" className={`${styles.link} ${ring(tokens.ringLink)}`}>
                Track my order
              </a>
            </div>
          </FocusType>
        </div>

        {isAfter && (
          <dl className={styles.spec}>
            {SPEC.map((item) => (
              <div key={item.term} className={styles.specRow}>
                <dt className={styles.specTerm}>{item.term}</dt>
                <dd className={styles.specValue}>
                  {item.value} <code className={styles.token}>{item.token}</code>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </ShowcaseCard>
  )
}
