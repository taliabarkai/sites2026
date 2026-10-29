'use client'

import { useEffect, useState } from 'react'

/** Where a stretch of the page sits against the viewport. */
export type ScrollRangePosition = 'below' | 'in' | 'above'

/**
 * Where the stretch from the top of `from` to the bottom of `to` sits against
 * the viewport — still below the fold, on screen, or scrolled past — kept
 * current on scroll and resize. Null until both elements are mounted, or when
 * `from` isn't given. `bottomInset` trims the viewport's bottom edge, so a
 * fixed bar's own height counts as off screen.
 */
export function useScrollRange(
  from: React.RefObject<HTMLElement | null> | undefined,
  to: React.RefObject<HTMLElement | null>,
  bottomInset = 0,
): ScrollRangePosition | null {
  const [position, setPosition] = useState<ScrollRangePosition | null>(null)

  useEffect(() => {
    if (!from) return
    // Two rect reads per scroll event, and React skips the render when the
    // position hasn't changed — cheap enough to measure straight away
    const measure = () => {
      const start = from.current
      const end = to.current
      if (!start || !end) return
      const top = start.getBoundingClientRect().top
      const bottom = end.getBoundingClientRect().bottom
      setPosition(top >= window.innerHeight - bottomInset ? 'below' : bottom <= 0 ? 'above' : 'in')
    }
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [from, to, bottomInset])

  return position
}
