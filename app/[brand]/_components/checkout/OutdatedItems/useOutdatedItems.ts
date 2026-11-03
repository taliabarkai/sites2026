'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { CartItem, SelectedOption } from '../../../_context/CartContext'
import type { OutdatedItem, OutdatedResolution } from './types'

/**
 * The bag as checkout should show it while some lines are outdated.
 *
 * Fixes and removals are held here, over the cart, rather than written into
 * it: the demo bag is re-synced to the URL, which would undo a removal or a
 * price change on the next render. Against the real API `fix` becomes a cart
 * line update and `remove` the cart's own removeItem — the shape the page
 * reads stays the same.
 */
export function useOutdatedItems(cartItems: CartItem[], entries: OutdatedItem[], resetKey?: string) {
  const [resolutions, setResolutions] = useState<Record<string, OutdatedResolution>>({})

  // A new bag (another brand, size or scenario) starts with nothing fixed.
  useEffect(() => { setResolutions({}) }, [resetKey])

  const byId = useMemo(
    () => Object.fromEntries(entries.map(e => [e.itemId, e])) as Record<string, OutdatedItem>,
    [entries],
  )

  const items = useMemo(() => cartItems.flatMap((item): CartItem[] => {
    const entry = byId[item.id]
    if (!entry) return [item]

    const resolution = resolutions[item.id]
    if (resolution?.status === 'removed') return []

    if (resolution?.status === 'fixed') {
      const delta = resolution.price - item.price
      return [{
        ...item,
        price:           resolution.price,
        originalPrice:   item.originalPrice !== undefined ? item.originalPrice + delta : undefined,
        selectedOptions: resolution.selectedOptions,
      }]
    }

    // Still outdated: the removed value is listed with the rest, so the
    // summary shows the line as it was ordered.
    const stale = entry.issue.kind === 'value-removed'
      ? [{ label: entry.issue.option, value: entry.issue.removedValue }]
      : []
    return [{ ...item, selectedOptions: [...entry.kept, ...stale] }]
  }), [cartItems, byId, resolutions])

  /** Lines still blocking payment, in bag order. */
  const pending = useMemo(
    () => entries.filter(e => !resolutions[e.itemId] && cartItems.some(i => i.id === e.itemId)),
    [entries, resolutions, cartItems],
  )

  /** The line as the item editor saved it — its new price, every choice, and the one that changed. */
  const fix = useCallback((itemId: string, price: number, selectedOptions: SelectedOption[], change: SelectedOption) => {
    setResolutions(prev => ({ ...prev, [itemId]: { status: 'fixed', price, selectedOptions, change } }))
  }, [])

  const remove = useCallback((itemId: string) => {
    setResolutions(prev => ({ ...prev, [itemId]: { status: 'removed' } }))
  }, [])

  return { items, entries, resolutions, pending, fix, remove }
}
