'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PERSONALIZE_PARAM, PERSONALIZE_PLACEMENTS, readPersonalizePlacement, type PersonalizePlacement } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for template PDPs: personalize on the page, or behind a
 * "Personalize" row that opens a panel. Lives in the URL (`?personalize=panel`)
 * like the other demo controls. Unset, the page opens on its template's own
 * version (OAL Inez: V5), else V1.
 */
export function PersonalizeToggle({ className, templateDefault }: { className?: string; templateDefault?: PersonalizePlacement }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readPersonalizePlacement(searchParams, templateDefault)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: PersonalizePlacement) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(PERSONALIZE_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // The chip names the version only; the open list says what each one is
  const label = PERSONALIZE_PLACEMENTS.find((f) => f.value === current)?.label ?? 'V1'

  return (
    <Dropdown label={`Personalize: ${label}`} title="Personalization" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {PERSONALIZE_PLACEMENTS.map(f => (
            <button key={f.value} type="button" className={styles.scenarioOption} aria-pressed={current === f.value} onClick={() => { select(f.value); close() }}>
              <span>{f.label}</span>
              <span className={styles.scenarioOptionDesc}>{f.description}</span>
              {f.desktopNote && <span className={styles.scenarioOptionNote}>{f.desktopNote}</span>}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
