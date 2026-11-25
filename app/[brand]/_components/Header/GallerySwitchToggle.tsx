'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { GALLERY_SWITCH_PARAM, GALLERY_SWITCHES, readGallerySwitch } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for the final flow V2 (mobile): how the shopper switches
 * between their personalization and the photos — the pill (A), text in the
 * pagination row (B, B2), or the View Photos link (D) (`?switch=text`, …).
 */
export function GallerySwitchToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readGallerySwitch(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(GALLERY_SWITCH_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Switch: ${current === 'text' ? 'B – Text' : current === 'stack' ? 'B2 – Stacked' : current === 'link' ? 'D – Link' : 'A – Pill'}`} title="Preview / photos switch" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {GALLERY_SWITCHES.map(s => (
            <button key={s.value} type="button" aria-pressed={current === s.value} onClick={() => { select(s.value); close() }}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
