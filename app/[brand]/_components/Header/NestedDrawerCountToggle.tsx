'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  NESTED_DRAWER_COUNTS,
  NESTED_DRAWER_PARAM,
  readNestedDrawerCount,
} from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for the nested items Drawer product: how many companion
 * products the drawer holds. Lives in the URL (`?charms=6`) like the other
 * demo controls, so a configuration can be sent as a link.
 */
export function NestedDrawerCountToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const count        = readNestedDrawerCount(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (n: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(NESTED_DRAWER_PARAM, String(n))
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Charms ${count}`} title="Charms in section" className={className}>
      {close => (
        <div className={styles.scenarioRow}>
          {NESTED_DRAWER_COUNTS.map(n => (
            <button
              key={n}
              type="button"
              aria-label={`Show ${n} charms`}
              aria-pressed={count === n}
              onClick={() => { select(n); close() }}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
