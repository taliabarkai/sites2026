'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { NESTED_ITEM_PARAM, NESTED_ITEM_STATES, readNestedItemOn } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for template PDPs: show the nested item — a second necklace at
 * 50% off above Add to Bag — or not (`?nested=on`). Off by default.
 */
export function NestedItemToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const on           = readNestedItemOn(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(NESTED_ITEM_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Nested item: ${on ? 'On' : 'Off'}`} title="Nested item" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {NESTED_ITEM_STATES.map(s => (
            <button key={s.value} type="button" aria-pressed={(s.value === 'on') === on} onClick={() => { select(s.value); close() }}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
