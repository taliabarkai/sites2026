'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { USP_STRIP_PARAM, USP_STRIP_STYLES, readUspStripStyle } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for the free-preview product's USP strip: rotating with dots,
 * a scrolling marquee, or the original static strip (`?usp=marquee`).
 */
export function UspStripToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readUspStripStyle(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(USP_STRIP_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentLabel = USP_STRIP_STYLES.find(s => s.value === current)?.label ?? ''
  return (
    <Dropdown label={`USP: ${currentLabel.split(' (')[0]}`} title="USP strip" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {USP_STRIP_STYLES.map(s => (
            <button key={s.value} type="button" aria-pressed={s.value === current} onClick={() => { select(s.value); close() }}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
