'use client'

import { useEffect, useId, useRef, useSyncExternalStore, type CSSProperties, type RefObject } from 'react'

/**
 * Panel stack — lets slide-in panels (Quick Add, Shop The Look) open on top of
 * one another.
 *
 *  • Only the topmost panel handles Escape and traps Tab.
 *  • The page scroll lock is taken by the first panel and released by the last.
 *  • Closing a panel closes every panel stacked above it.
 *  • Focus returns to the element that opened a panel when it closes.
 *
 * A module-level store rather than a context: QuickAddPanel is mounted from many
 * places (grid cards, hotspots, PDP, nested items), and a lone panel behaves
 * exactly as before — depth 0, its own scroll lock, Escape closes it.
 */

interface Layer {
  id: string
  close: () => void
  container: () => HTMLElement | null
  opener: HTMLElement | null
}

let layers: Layer[] = []
let savedOverflow = ''
const listeners = new Set<() => void>()

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function onKeyDown(e: KeyboardEvent) {
  const top = layers[layers.length - 1]
  if (!top) return

  if (e.key === 'Escape') {
    top.close()
    return
  }
  if (e.key !== 'Tab') return

  // Focus trap — cycle within the topmost panel's visible focusables.
  const root = top.container()
  if (!root) return
  const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((el) => el.getClientRects().length > 0)
  if (items.length === 0) { e.preventDefault(); return }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (!root.contains(active)) {
    e.preventDefault()
    ;(e.shiftKey ? last : first).focus()
  } else if (e.shiftKey && active === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && active === last) {
    e.preventDefault()
    first.focus()
  }
}

function push(layer: Layer) {
  if (layers.length === 0) {
    savedOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
  }
  layers = [...layers, layer]
  emit()
}

function remove(id: string) {
  const idx = layers.findIndex((l) => l.id === id)
  if (idx === -1) return
  const removed = layers.slice(idx)
  layers = layers.slice(0, idx)

  if (layers.length === 0) {
    document.body.style.overflow = savedOverflow
    document.removeEventListener('keydown', onKeyDown)
  }

  // Return focus to whatever opened the lowest closing panel — unless focus has
  // already moved somewhere deliberate outside every closing panel.
  const active = document.activeElement
  const focusWasInside =
    !active || active === document.body || removed.some((l) => l.container()?.contains(active))
  if (focusWasInside) removed[0].opener?.focus({ preventScroll: true })

  // Panels stacked above the closing one close with it.
  removed.slice(1).reverse().forEach((l) => l.close())
  emit()
}

/** Number of open panels (0 when none) — re-renders when it changes. */
export function useOpenPanelCount(): number {
  return useSyncExternalStore(subscribe, () => layers.length, () => 0)
}

/** Close every open panel, topmost first. */
export function closeAllPanels() {
  ;[...layers].reverse().forEach((l) => l.close())
}

/**
 * Register a panel with the stack while `isOpen`. Returns the panel's depth
 * (0 = bottom). The depth is held through the close animation so a stacked
 * panel doesn't drop behind the one beneath it while sliding out.
 */
export function usePanelLayer(
  isOpen: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
): number {
  const id = useId()
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    if (!isOpen) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    push({ id, close: () => onCloseRef.current(), container: () => containerRef.current, opener })
    return () => remove(id)
  }, [isOpen, id, containerRef])

  const depth = useSyncExternalStore(
    subscribe,
    () => layers.findIndex((l) => l.id === id),
    () => -1,
  )
  const lastDepth = useRef(0)
  if (depth >= 0) lastDepth.current = depth
  return lastDepth.current
}

/**
 * Inline z-index for a stacked panel. Depth 0 returns nothing (the component's
 * own --z-overlay / --z-modal apply); each level above sits over the panel
 * beneath it, backdrop included.
 */
export function layerZIndex(depth: number): { backdrop?: CSSProperties; panel?: CSSProperties } {
  if (depth <= 0) return {}
  return {
    backdrop: { zIndex: `calc(var(--z-modal) + ${depth * 2 - 1})` },
    panel:    { zIndex: `calc(var(--z-modal) + ${depth * 2})` },
  }
}
