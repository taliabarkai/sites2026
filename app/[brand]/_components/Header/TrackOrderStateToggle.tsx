'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { STATE_PARAM, readIsErrorState } from '../../_config/demoParams'
import styles from './Header.module.css'

/**
 * Demo control for the Track My Order page: the lookup as it normally behaves,
 * or the not-found state.
 *
 * Shares the `state` parameter the checkout's error preview already uses, so
 * one key means "show me this page going wrong" wherever it appears.
 */
export function TrackOrderStateToggle({ className }: { className?: string }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const isError      = readIsErrorState(searchParams)

  /** Rewrites only this key; the order and email on the URL survive. */
  const setError = (next: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next) params.set(STATE_PARAM, 'error')
    else params.delete(STATE_PARAM)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <div className={className} role="group" aria-label="Page state">
      <button
        type="button"
        aria-label="Show the default lookup"
        aria-pressed={!isError}
        onClick={() => setError(false)}
      >
        Default
      </button>
      <button
        type="button"
        aria-label="Preview the not-found state"
        aria-pressed={isError}
        onClick={() => setError(true)}
      >
        Error
      </button>
    </div>
  )
}
