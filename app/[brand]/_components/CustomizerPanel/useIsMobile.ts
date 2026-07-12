'use client'

import { useEffect, useState } from 'react'

/**
 * True below the `md` breakpoint (767px). Customizers use it to switch between the
 * desktop side-by-side layout and the shared slide-in CustomizerPanel on mobile.
 */
export function useIsMobile(query = '(max-width: 767px)'): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [query])
  return isMobile
}
