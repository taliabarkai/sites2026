'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MOBILE_LAYOUT_PARAM, MOBILE_LAYOUTS, readMobileLayout } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for the final live preview: on mobile, the product info
 * (breadcrumbs, title, price, reviews) above the gallery — the default, as
 * live preview's V2 — or below it (`?mobileLayout=gallery-above`).
 */
export function MobileLayoutToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readMobileLayout(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(MOBILE_LAYOUT_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const label = MOBILE_LAYOUTS.find((l) => l.value === current)?.label ?? ''

  return (
    <Dropdown label={`Mobile: ${label}`} title="Mobile layout" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {MOBILE_LAYOUTS.map(l => (
            <button key={l.value} type="button" aria-pressed={current === l.value} onClick={() => { select(l.value); close() }}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
