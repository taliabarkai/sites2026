'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  NESTED_TRIGGER_PARAM,
  NESTED_TRIGGER_STYLES,
  readNestedTriggerStyle,
  type NestedTriggerStyle,
} from '../../_config/demoParams'

/** What each segment says, and what it is previewing. */
const SEGMENTS: Record<NestedTriggerStyle, { label: string; description: string }> = {
  field: { label: 'Field', description: 'Show the drawer trigger as a bordered field' },
  link:  { label: 'Link',  description: 'Show the drawer trigger as a text link' },
}

/**
 * Demo control for the nested items Drawer product: which PDP trigger opens
 * the drawer. The two designs are being compared, so it stays open as a
 * segmented control rather than a dropdown (`?trigger=link`).
 */
export function NestedTriggerToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readNestedTriggerStyle(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (next: NestedTriggerStyle) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(NESTED_TRIGGER_PARAM, next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={className} role="group" aria-label="Drawer trigger">
      <span aria-hidden="true">Trigger</span>
      {NESTED_TRIGGER_STYLES.map(style => (
        <button
          key={style}
          type="button"
          aria-label={SEGMENTS[style].description}
          aria-pressed={current === style}
          onClick={() => select(style)}
        >
          {SEGMENTS[style].label}
        </button>
      ))}
    </div>
  )
}
