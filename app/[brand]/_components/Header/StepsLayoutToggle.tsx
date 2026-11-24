'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { STEPS_LAYOUT_PARAM, STEPS_LAYOUTS, readStepsLayout } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for the final flows on LAL (Music Memories): the options in two
 * tabs — Personalize, then Frame Options — or all in one form (`?steps=single`).
 */
export function StepsLayoutToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readStepsLayout(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(STEPS_LAYOUT_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Layout: ${current === 'single' ? 'Single' : 'Tabs'}`} title="Options layout" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {STEPS_LAYOUTS.map(l => (
            <button key={l.value} type="button" aria-pressed={current === l.value} onClick={() => { select(l.value); close() }}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
