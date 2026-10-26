'use client'

import { useState } from 'react'
import type { CartItem } from '../../_context/CartContext'
import { QuickAddPanel } from '../QuickAddPanel'
import type { QuickAddProduct } from '../QuickAddPanel'
import { NestedItems, nestedItemKey } from './NestedItems'
import { NestedItemsDrawer } from './NestedItemsDrawer'
import type { NestedItemsDisplay } from './NestedItemsDrawer'
import type { NestedTriggerStyle } from '../../_config/demoParams'

export interface UseNestedItemsOptions {
  /** Inline card list (default) or one trigger that opens a multi-select drawer. */
  display?: NestedItemsDisplay
  /** Drawer only: the trigger as a bordered field (default) or a text link. */
  triggerStyle?: NestedTriggerStyle
}

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
 *
 * `display: 'drawer'` swaps the card list for one trigger that opens a
 * multi-select drawer; the staged items work the same either way.
 */
export function useNestedItems(
  brand: string,
  items: QuickAddProduct[],
  title?: string,
  { display = 'inline', triggerStyle }: UseNestedItemsOptions = {},
): UseNestedItemsResult {
  const [staged, setStaged] = useState<Record<string, CartItem>>({})
  const [panelItem, setPanelItem] = useState<QuickAddProduct | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const checkedKeys = new Set(Object.keys(staged))
  const stagedItems = Object.values(staged)
  const stagedCount = stagedItems.length
  const nestedTotal = stagedItems.reduce((sum, it) => sum + it.price, 0)

  // Mark as a companion so it doesn't count as a standalone main item.
  const stage = (key: string, cartItem: CartItem) =>
    setStaged((prev) => ({ ...prev, [key]: { ...cartItem, isCompanion: true } }))

  const unstage = (key: string) =>
    setStaged((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })

  const handleToggle = (item: QuickAddProduct, checked: boolean) => {
    if (checked) {
      setPanelItem(item)
      setPanelOpen(true)
    } else {
      unstage(nestedItemKey(item))
    }
  }

  const ui = display === 'drawer' ? (
    <NestedItemsDrawer
      brand={brand}
      items={items}
      staged={staged}
      onStage={stage}
      onUnstage={unstage}
      title={title}
      triggerStyle={triggerStyle}
    />
  ) : (
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
          if (panelItem) stage(nestedItemKey(panelItem), cartItem)
        }}
      />
    </>
  )

  return { ui, stagedItems, stagedCount, nestedTotal, clear: () => setStaged({}) }
}
