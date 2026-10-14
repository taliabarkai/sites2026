'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

export interface RovingFocusOptions {
  count: number
  /** Index that holds the single tab stop at first — usually the selected value. */
  initialIndex: number
  /** `grid` moves by rows with Up/Down; the row length is read from the layout. */
  orientation: 'horizontal' | 'vertical' | 'grid'
  isDisabled?: (index: number) => boolean
  /** Fired when focus moves by keyboard — radio groups select here. */
  onMove?: (index: number) => void
  /** Wrap from the last item to the first (radio groups). */
  wrap?: boolean
}

/** Items per row: how many share the first item's top edge. Works for grid and flex-wrap. */
function columnsOf(items: (HTMLElement | null)[]): number {
  const first = items.find(Boolean)
  if (!first) return 1
  const top = first.offsetTop
  return Math.max(1, items.filter((el) => el && el.offsetTop === top).length)
}

/**
 * Roving tabindex: one tab stop for the whole set, arrow keys move between
 * items (skipping disabled ones), Home / End jump to the ends.
 */
export function useRovingFocus({ count, initialIndex, orientation, isDisabled, onMove, wrap = true }: RovingFocusOptions) {
  const [focusIndex, setFocusIndex] = useState(Math.max(0, initialIndex))
  const refs = useRef<(HTMLElement | null)[]>([])

  const focusAt = (index: number) => {
    setFocusIndex(index)
    refs.current[index]?.focus()
    refs.current[index]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    onMove?.(index)
  }

  // Step from `from` by `delta`, skipping disabled items; null if nowhere to go.
  const step = (from: number, delta: number): number | null => {
    let i = from
    for (let n = 0; n < count; n++) {
      i += delta
      if (i < 0 || i >= count) {
        if (!wrap || Math.abs(delta) > 1) return null
        i = (i + count) % count
      }
      if (!isDisabled?.(i)) return i
    }
    return null
  }

  const firstEnabled = (from: number, delta: 1 | -1) => {
    for (let i = from; i >= 0 && i < count; i += delta) if (!isDisabled?.(i)) return i
    return null
  }

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const cols = orientation === 'grid' ? columnsOf(refs.current) : 1
    const moves: Record<string, number | null> = {
      ArrowRight: orientation === 'vertical' ? null : step(index, 1),
      ArrowLeft: orientation === 'vertical' ? null : step(index, -1),
      ArrowDown: orientation === 'grid' ? step(index, cols) : step(index, 1),
      ArrowUp: orientation === 'grid' ? step(index, -cols) : step(index, -1),
      Home: firstEnabled(0, 1),
      End: firstEnabled(count - 1, -1),
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    const next = moves[event.key]
    if (next !== null && next !== undefined) focusAt(next)
  }

  const register = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el
  }

  return { focusIndex, setFocusIndex, focusAt, register, onKeyDown, refs }
}
