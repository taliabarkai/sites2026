'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  NESTED_DESCRIPTION_PARAM,
  NESTED_DESCRIPTION_STATES,
  readNestedDescriptionState,
  type NestedDescriptionState,
} from '../../_config/demoParams'

/** What each segment says, and what it is previewing. */
const SEGMENTS: Record<NestedDescriptionState, { label: string; description: string }> = {
  show: { label: 'Show', description: 'Show the description under the drawer trigger' },
  hide: { label: 'Hide', description: 'Hide the description under the drawer trigger' },
}

/**
 * Demo control for the nested items Drawer product: whether the trigger shows
 * its optional description line (`?desc=hide`).
 */
export function NestedDescriptionToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readNestedDescriptionState(searchParams)

  /** Rewrites only this key; anything else on the URL survives. */
  const select = (next: NestedDescriptionState) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(NESTED_DESCRIPTION_PARAM, next)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className={className} role="group" aria-label="Drawer trigger description">
      <span aria-hidden="true">Description</span>
      {NESTED_DESCRIPTION_STATES.map(state => (
        <button
          key={state}
          type="button"
          aria-label={SEGMENTS[state].description}
          aria-pressed={current === state}
          onClick={() => select(state)}
        >
          {SEGMENTS[state].label}
        </button>
      ))}
    </div>
  )
}
