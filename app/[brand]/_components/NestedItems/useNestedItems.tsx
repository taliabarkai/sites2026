'use client'

import { useState } from 'react'
import type { CartItem } from '../../_context/CartContext'
import { QuickAddPanel } from '../QuickAddPanel'
import type { QuickAddProduct } from '../QuickAddPanel'
import { NestedItems, nestedItemKey } from './NestedItems'

export interface UseNestedItemsResult {
  /** Renders the "Your Stack Starts Here" section + the (portaled) quick-add panel.
   *  Place this directly above the Subtotal line. */
  ui: React.ReactNode
  /** Fully configured cart items for every staged (checked) nested product. */
  stagedItems: CartItem[]
  /** How many nested items are currently staged. */
  stagedCount: number
  /** Combined price (in cents) of all staged nested items. */
  nestedTotal: number
  /** Clear the staged selection (call after adding the main product to the bag). */
  clear: () => void
}

/**
 * Encapsulates the Nested Items behavior shared by every product buy-box:
 * a checkbox card opens the quick-add panel (CTA "Add") to stage a companion
 * product; unchecking removes it. Consumers add `nestedTotal` to their subtotal,
 * fold `stagedCount` into the CTA count, and add `stagedItems` alongside the main
 * product on add (then call `clear`).
 */
export function useNestedItems(brand: string, items: QuickAddProduct[], title?: string): UseNestedItemsResult {
  const [staged, setStaged] = useState<Record<string, CartItem>>({})
  const [panelItem, setPanelItem] = useState<QuickAddProduct | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const checkedKeys = new Set(Object.keys(staged))
  const stagedItems = Object.values(staged)
  const stagedCount = stagedItems.length
  const nestedTotal = stagedItems.reduce((sum, it) => sum + it.price, 0)

  const handleToggle = (item: QuickAddProduct, checked: boolean) => {
    if (checked) {
      setPanelItem(item)
      setPanelOpen(true)
    } else {
      const key = nestedItemKey(item)
      setStaged((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const ui = (
    <>
      <NestedItems
        brand={brand}
        items={items}
        checkedKeys={checkedKeys}
        onToggle={handleToggle}
        title={title}
      />
      <QuickAddPanel
        isOpen={panelOpen}
        product={panelItem}
        onClose={() => setPanelOpen(false)}
        ctaLabel="Add"
        showViewDetails={false}
        onAdd={(cartItem) => {
          if (panelItem) {
            const key = nestedItemKey(panelItem)
            // Mark as a companion so it doesn't count as a standalone main item.
            setStaged((prev) => ({ ...prev, [key]: { ...cartItem, isCompanion: true } }))
          }
        }}
      />
    </>
  )

  return { ui, stagedItems, stagedCount, nestedTotal, clear: () => setStaged({}) }
}
