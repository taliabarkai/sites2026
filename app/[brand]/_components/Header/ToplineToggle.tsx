'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { TOPLINE_PARAM, readToplineShown } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for the final flows: the promo topline — the marketing bar
 * under the header — shown, or hidden (`?topline=hide`).
 */
export function ToplineToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const shown        = readToplineShown(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (show: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(TOPLINE_PARAM, show ? 'show' : 'hide')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Topline: ${shown ? 'On' : 'Off'}`} title="Topline" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          <button type="button" aria-pressed={shown} onClick={() => { select(true); close() }}>Show topline</button>
          <button type="button" aria-pressed={!shown} onClick={() => { select(false); close() }}>Hide topline</button>
        </div>
      )}
    </Dropdown>
  )
}
