'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { GALLERY_LAYOUTS, GALLERY_PARAM, readGalleryLayout } from '../../_config/demoParams'
import type { GalleryDisplay } from '../../product/_templates'
import { Dropdown } from './CartSizeToggle'
import styles from './Header.module.css'

/**
 * Demo control for template PDPs: which desktop gallery to draw. Lives in the
 * URL (`?gallery=overlay`) like the other demo controls, so a layout can be
 * sent as a link. Unset, the page shows its template's own layout.
 */
export function GalleryLayoutToggle({ templateDefault, className }: { templateDefault: GalleryDisplay; className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readGalleryLayout(searchParams) ?? GALLERY_LAYOUTS.find((l) => l.display === templateDefault)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(GALLERY_PARAM, value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Dropdown label={`Gallery: ${current?.label ?? 'Default'}`} title="Desktop gallery" className={className}>
      {close => (
        <div className={`${styles.scenarioRow} ${styles.scenarioList}`}>
          {GALLERY_LAYOUTS.map(l => (
            <button
              key={l.value}
              type="button"
              aria-pressed={current?.value === l.value}
              onClick={() => { select(l.value); close() }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </Dropdown>
  )
}
