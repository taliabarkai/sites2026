'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  STATE_PARAM,
  TRACK_ORDER_STATES,
  readTrackOrderState,
  type TrackOrderState,
} from '../../_config/demoParams'
import styles from './Header.module.css'

/** What each segment says, and what it is previewing. */
const SEGMENTS: Record<TrackOrderState, { label: string; description: string }> = {
  default:   { label: 'Default',   description: 'Show the default lookup' },
  error:     { label: 'Error',     description: 'Preview the not-found state' },
  duplicate: { label: 'Duplicate', description: 'Preview the duplicate-order state' },
}

/**
 * Demo control for the Track My Order page: the lookup as it normally
 * behaves, the not-found state, or the duplicate-order state.
 *
 * Shares the `state` parameter the checkout's error preview already uses, so
 * one key means "show me this page going wrong" wherever it appears.
 */
export function TrackOrderStateToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const current      = readTrackOrderState(searchParams)

  /** Rewrites only this key; the order and email on the URL survive. */
  const select = (next: TrackOrderState) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === 'default') params.delete(STATE_PARAM)
    else params.set(STATE_PARAM, next)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className={className} role="group" aria-label="Page state">
      {TRACK_ORDER_STATES.map(state => (
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
