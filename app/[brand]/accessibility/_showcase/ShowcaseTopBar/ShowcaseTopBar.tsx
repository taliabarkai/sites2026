'use client'

import Link from 'next/link'
import { forwardRef, useSyncExternalStore } from 'react'
import { BRANDS, type BrandKey } from '../../../_config/brands'
import tokens from '../proposed-tokens.module.css'
import type { ShowcaseView } from '../ShowcaseView'
import styles from './ShowcaseTopBar.module.css'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  )
}

const VIEWS: { value: ShowcaseView; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
]

interface ShowcaseTopBarProps {
  brand: BrandKey
  /** The route after the brand; brand links keep it. */
  path: string
  name: string
  view: ShowcaseView
  onViewChange: (value: ShowcaseView) => void
  forceFocus: boolean
  onForceFocusChange: (value: boolean) => void
}

export const ShowcaseTopBar = forwardRef<HTMLElement, ShowcaseTopBarProps>(function ShowcaseTopBar(
  { brand, path, name, view, onViewChange, forceFocus, onForceFocusChange },
  ref,
) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <header ref={ref} className={styles.bar}>
      <div className={styles.inner}>
        <p className={styles.name}>{name}</p>

        <nav aria-label="Brand" className={styles.brands}>
          <ul className={styles.brandList}>
            {BRANDS.map((entry) => (
              <li key={entry.key}>
                <Link
                  href={`/${entry.key}/${path}${view === 'before' ? '?view=before' : ''}`}
                  className={`${styles.brandLink} ${tokens.ringUnderline}`}
                  aria-current={entry.key === brand ? 'page' : undefined}
                >
                  {entry.shortLabel}
                  <span className={styles.visuallyHidden}> {entry.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.controls}>
          {/* Native radios: arrow keys move between the two, Tab leaves the group. */}
          <fieldset className={styles.segmented}>
            <legend className={styles.segmentedLegend}>View</legend>
            <div className={styles.segments}>
              {VIEWS.map((option) => (
                <label key={option.value} className={styles.segment}>
                  <input
                    type="radio"
                    name="showcase-view"
                    value={option.value}
                    checked={view === option.value}
                    onChange={() => onViewChange(option.value)}
                    className={styles.segmentInput}
                  />
                  <span className={styles.segmentText}>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.switch}>
            <input
              type="checkbox"
              role="switch"
              className={styles.switchInput}
              checked={forceFocus}
              onChange={(event) => onForceFocusChange(event.target.checked)}
            />
            <span className={styles.switchText}>Show all focus states</span>
          </label>

          <p className={styles.motion}>
            Reduced motion: <strong className={styles.motionValue}>{reducedMotion ? 'On' : 'Off'}</strong>
            <span className={styles.visuallyHidden}> (follows your system setting)</span>
          </p>
        </div>
      </div>
    </header>
  )
})
