'use client'

import { useId, useState } from 'react'
import { Button } from '../../../_components/Button'
import { ShowcaseCard } from '../ShowcaseCard'
import { useShowcaseView } from '../ShowcaseView'
import tokens from '../proposed-tokens.module.css'
import styles from './ReflowCard.module.css'

type Frame = '320' | 'zoom'

const FRAMES: { value: Frame; label: string }[] = [
  { value: '320', label: '320px wide' },
  { value: 'zoom', label: '200% zoom' },
]

export function ReflowCard() {
  const id = useId()
  const { ring } = useShowcaseView()
  const [frame, setFrame] = useState<Frame>('320')
  const [spacing, setSpacing] = useState(false)

  return (
    <ShowcaseCard
      id="typography-reflow"
      title="Typography and reflow"
      criteria={['1.4.4 Resize Text', '1.4.10 Reflow', '1.4.12 Text Spacing']}
      notes={{
        before: 'A reference: the preview behaves the same in both views.',
        after: 'A reference: the preview behaves the same in both views.',
      }}
      dos={[
        'Let text wrap and containers grow; size boxes by their content.',
        'Test every page at 320px wide and at 200% zoom.',
        'Use the typography tokens, so line height scales with the text.',
      ]}
      donts={[
        "Don't give text containers a fixed height; increased spacing will clip them.",
        "Don't make the page scroll sideways at 320px. Data tables are the one exception.",
        "Don't truncate product names with an ellipsis and no way to read the rest.",
      ]}
    >
      <div className={styles.layout}>
        <div className={styles.controls}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Preview</legend>
            {FRAMES.map((option) => (
              <label key={option.value} className={styles.choice}>
                <input
                  type="radio"
                  name={`${id}-frame`}
                  value={option.value}
                  checked={frame === option.value}
                  onChange={() => setFrame(option.value)}
                  className={styles.input}
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          <label className={styles.choice}>
            <input
              type="checkbox"
              checked={spacing}
              onChange={(event) => setSpacing(event.target.checked)}
              className={styles.input}
            />
            Apply the text spacing test
          </label>
          <p className={styles.hint}>
            Line height 1.5×, paragraph spacing 2×, letter spacing 0.12×, word spacing 0.16× — nothing should
            clip or overlap.
          </p>
        </div>

        {/* At 200% the frame is 640px wide with its content zoomed 2×, so the
            layout reflows at 320 CSS pixels, as it would on a zoomed laptop. */}
        <div className={styles.viewport}>
          <div className={`${styles.frame} ${frame === 'zoom' ? styles.frameZoom : ''}`}>
            <div className={`${styles.content} ${frame === 'zoom' ? styles.zoomed : ''} ${spacing ? styles.spaced : ''}`}>
              <p className={styles.eyebrow}>New in</p>
              <p className={styles.productName}>Custom Birth Flower Name Necklace in 14k Gold Vermeil</p>
              <p className={styles.price}>$89.00</p>
              <p className={styles.description}>
                Her name, hand-finished beside the flower of her birth month. Choose a length that sits where
                she likes it: 16&Prime; at the collarbone or 18&Prime; just below.
              </p>
              <label htmlFor={`${id}-engraving`} className={styles.fieldLabel}>
                Name to engrave
              </label>
              <input
                id={`${id}-engraving`}
                defaultValue="Josephine"
                className={`${styles.field} ${ring(tokens.ringField)}`}
              />
              <Button variant="primary" className={`${styles.cta} ${ring(tokens.ringFilled)}`}>
                Add to bag
              </Button>
              <p className={styles.description}>
                Ships in 3–5 business days.{' '}
                <a href="#typography-reflow" className={`${styles.link} ${ring(tokens.ringLink)}`}>
                  Shipping and returns
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </ShowcaseCard>
  )
}
