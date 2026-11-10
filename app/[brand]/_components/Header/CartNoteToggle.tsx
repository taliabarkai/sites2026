'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CART_NOTE_PARAM, CART_NOTE_VARIANTS, readCartNoteVariant } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for the free-preview bag note: V1 a line above the item, V2 a
 * ribbon over its image (`?cartnote=v2`). The floating cart's "View Bag"
 * carries the URL along, so the bag page shows the same version.
 */
export function CartNoteToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readCartNoteVariant(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(CART_NOTE_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Cart note: ${current.toUpperCase()}`} title="Free-preview cart note" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {CART_NOTE_VARIANTS.map(v => (
            <button key={v.value} type="button" aria-pressed={v.value === current} onClick={() => { select(v.value); close() }}>
              {v.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
