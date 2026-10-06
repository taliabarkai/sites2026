'use client'

import { ShowcaseCard } from '../ShowcaseCard'
import { useBrandIcons } from '../useBrandIcons'
import styles from './TargetSizeCard.module.css'

export function TargetSizeCard() {
  const { MagnifyingGlassIcon, ShoppingBagIcon, TrashCanIcon } = useBrandIcons()

  return (
    <ShowcaseCard
      id="target-size"
      title="Target size"
      criteria={['2.5.8 Target Size (Minimum)']}
      notes={{
        before: 'A reference: target sizes look the same in both views.',
        after: 'A reference: target sizes look the same in both views.',
      }}
      dos={[
        'Make every tappable area at least 24×24px; aim for 44×44px.',
        'Grow the hit area with padding, so a 16px icon can still have a 44px target.',
        'Leave at least 24px between the centers of small targets that sit side by side.',
      ]}
      donts={[
        "Don't size the button to the icon.",
        "Don't put small icon buttons edge to edge, like Edit and Remove with no gap.",
      ]}
    >
      <div className={styles.examples}>
        {/* Shown, not usable: a real 16px button would itself fail 2.5.8. */}
        <figure className={styles.example}>
          <div className={styles.stage} aria-hidden="true">
            <span className={`${styles.target} ${styles.tooSmall}`}>
              <TrashCanIcon className={styles.iconSmall} />
            </span>
          </div>
          <figcaption className={styles.caption}>
            <strong className={styles.size}>16 × 16</strong> Too small: the target is only the icon.
          </figcaption>
        </figure>

        <figure className={styles.example}>
          <div className={styles.stage}>
            <button type="button" aria-label="Remove from bag" className={`${styles.target} ${styles.minimum}`}>
              <TrashCanIcon className={styles.iconSmall} />
            </button>
          </div>
          <figcaption className={styles.caption}>
            <strong className={styles.size}>24 × 24</strong> The AA minimum. Padding around a 16px icon.
          </figcaption>
        </figure>

        <figure className={styles.example}>
          <div className={styles.stage}>
            <button type="button" aria-label="Search" className={`${styles.target} ${styles.recommended}`}>
              <MagnifyingGlassIcon className={styles.icon} />
            </button>
          </div>
          <figcaption className={styles.caption}>
            <strong className={styles.size}>44 × 44</strong> Recommended, especially on touch screens.
          </figcaption>
        </figure>

        <figure className={styles.example}>
          <div className={styles.stage}>
            <button type="button" aria-label="Bag, 2 items" className={`${styles.target} ${styles.recommended}`}>
              <ShoppingBagIcon className={styles.icon} />
            </button>
          </div>
          <figcaption className={styles.caption}>
            <strong className={styles.size}>44 × 44</strong> Header icons: the dashed line is the target.
          </figcaption>
        </figure>
      </div>
    </ShowcaseCard>
  )
}
