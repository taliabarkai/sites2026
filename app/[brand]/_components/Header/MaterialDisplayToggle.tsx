'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MATERIAL_DISPLAY_PARAM, MATERIAL_DISPLAYS, readMaterialDisplay } from '../../_config/demoParams'
import { getBrandFromPathname } from '../../_config/brands'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for template PDPs: the material picker as the standard
 * carousel or the carousel's standard image-only tiles (`?material=image`).
 * Unset, OAL shows the image-only tiles and the other brands the carousel.
 */
export function MaterialDisplayToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readMaterialDisplay(searchParams, getBrandFromPathname(pathname))

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(MATERIAL_DISPLAY_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Material: ${current === 'image' ? 'Image only' : 'Carousel'}`} title="Material display" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {MATERIAL_DISPLAYS.map(d => (
            <button key={d.value} type="button" aria-pressed={current === d.value} onClick={() => { select(d.value); close() }}>
              {d.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
