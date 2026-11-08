'use client'

import { useLayoutEffect, useState, type RefObject } from 'react'

/** The nearest ancestor that scrolls its own content (a panel), else none: the page. */
function scrollParent(el: HTMLElement | null): HTMLElement | null {
  for (let p = el?.parentElement; p && p !== document.body; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p)
    if ((overflowY === 'auto' || overflowY === 'scroll') && p.scrollHeight > p.clientHeight) return p
  }
  return null
}

/**
 * Which way a dropdown opens: down under its trigger when the list fits
 * there, else up over the content above it — never by scrolling the page to
 * make room. Measured before paint, so it never flashes the wrong way. Only
 * when it fits neither way is the list scrolled into view.
 */
export function useDropDirection(open: boolean, triggerRef: RefObject<HTMLElement | null>, listRef: RefObject<HTMLElement | null>): 'down' | 'up' {
  const [dir, setDir] = useState<'down' | 'up'>('down')
  useLayoutEffect(() => {
    if (!open) { setDir('down'); return }
    const trigger = triggerRef.current
    const list = listRef.current
    if (!trigger || !list) return
    const box = scrollParent(trigger)?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight }
    const t = trigger.getBoundingClientRect()
    const below = box.bottom - t.bottom
    const above = t.top - box.top
    const h = list.offsetHeight
    const next = h <= below ? 'down' : h <= above ? 'up' : above > below ? 'up' : 'down'
    setDir(next)
    if (h > below && h > above) requestAnimationFrame(() => list.scrollIntoView({ block: 'nearest' }))
  }, [open, triggerRef, listRef])
  return dir
}

/** Scrolls only the list itself so `row` shows — never the page around it. */
export function revealInList(list: HTMLElement | null, row: HTMLElement | null | undefined) {
  if (!list || !row) return
  const top = row.offsetTop
  const bottom = top + row.offsetHeight
  if (top < list.scrollTop) list.scrollTop = top
  else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight
}
