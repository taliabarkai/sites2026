'use client'

import { useEffect, useState, type RefObject } from 'react'

/** Root CSS variable other sticky elements read to sit under the revealed header. */
export const HEADER_REVEAL_OFFSET_VAR = '--header-reveal-offset'

/** Pixels of scroll in one direction before the header reacts — ignores jitter. */
const SCROLL_DELTA = 6

/**
 * "Hide on scroll down, slide back in on scroll up" header behaviour.
 *
 * Returns `hidden`: true once the user has scrolled past the header and keeps
 * scrolling down; false as soon as they scroll up (the header slides in from
 * the top) or return to the top of the page.
 *
 * While enabled it also publishes the header's visible height as
 * `--header-reveal-offset` on <html>, so sticky toolbars can use
 * `top: var(--header-reveal-offset, 0px)` and sit directly below the header
 * instead of being covered by it.
 */
export function useRevealOnScrollUp(
  enabled: boolean,
  headerRef: RefObject<HTMLElement | null>,
  forceVisible = false,
) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    let lastY = window.scrollY
    let frame = 0
    let isHidden = false

    const publish = (nextHidden: boolean) => {
      const height = headerRef.current?.offsetHeight ?? 0
      root.style.setProperty(HEADER_REVEAL_OFFSET_VAR, nextHidden ? '0px' : `${height}px`)
      if (nextHidden !== isHidden) {
        isHidden = nextHidden
        setHidden(nextHidden)
      }
    }

    const update = () => {
      frame = 0
      const y = window.scrollY
      const height = headerRef.current?.offsetHeight ?? 0
      if (y <= height) {
        publish(false)
      } else if (y > lastY + SCROLL_DELTA) {
        publish(true)
      } else if (y < lastY - SCROLL_DELTA) {
        publish(false)
      } else {
        return // within the jitter band — keep lastY anchored
      }
      lastY = y
    }

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    publish(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
      root.style.removeProperty(HEADER_REVEAL_OFFSET_VAR)
    }
  }, [enabled, headerRef])

  return enabled && hidden && !forceVisible
}
