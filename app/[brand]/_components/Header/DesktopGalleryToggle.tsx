'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DESKTOP_GALLERY_PARAM, DESKTOP_GALLERY_MODES, readDesktopGallery } from '../../_config/demoParams'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for Final-Poc and V3 on desktop: the gallery as the photos two
 * across (the preview growing in on top), or the first image in focus with the
 * rest below (`?dgallery=hero`).
 */
export function DesktopGalleryToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const mode         = readDesktopGallery(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(DESKTOP_GALLERY_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Gallery: ${mode === 'hero' ? 'First image' : '2-column grid'}`} title="Gallery" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {DESKTOP_GALLERY_MODES.map(m => (
            <button key={m.value} type="button" aria-pressed={mode === m.value} onClick={() => { select(m.value); close() }}>
              {m.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
