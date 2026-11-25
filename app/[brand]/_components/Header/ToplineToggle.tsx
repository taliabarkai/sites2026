'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { TOPLINE_PARAM, TOPLINE_MODES, readToplineMode } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for the final flows: the promo topline — the marketing bar
 * under the header — scrolling away, sticky at the top of the screen, or
 * hidden (`?topline=sticky`, `?topline=hide`).
 */
export function ToplineToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const mode         = readToplineMode(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(TOPLINE_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Topline: ${mode === 'sticky' ? 'Sticky' : mode === 'hide' ? 'Off' : 'On'}`} title="Topline" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {TOPLINE_MODES.map(m => (
            <button key={m.value} type="button" aria-pressed={mode === m.value} onClick={() => { select(m.value); close() }}>
              {m.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
