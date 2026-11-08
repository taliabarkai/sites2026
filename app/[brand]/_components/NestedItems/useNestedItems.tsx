'use client'

import { useState } from 'react'
import type { CartItem } from '../../_context/CartContext'
import { QuickAddPanel } from '../QuickAddPanel'
import type { QuickAddFormValues, QuickAddProduct } from '../QuickAddPanel'
import { NestedItems, nestedItemKey } from './NestedItems'
import { NestedItemsDrawer, withBundleDiscount } from './NestedItemsDrawer'
import type { NestedItemsDisplay } from './NestedItemsDrawer'

export interface UseNestedItemsOptions {
  /** Inline card list (default) or one trigger that opens a multi-select drawer. */
  display?: NestedItemsDisplay
  /** Drawer only: an optional line under the trigger's heading. */
  description?: string
  /** The quick-add panel's choices as the shopper makes them (a live preview, say). */
  onPanelChange?: (item: QuickAddProduct, values: QuickAddFormValues) => void
  /** An item was unchecked — its choices are dropped (the host can reset what it drew from them). */
  onUnstage?: (item: QuickAddProduct) => void
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
  { display = 'inline', description, onPanelChange, onUnstage }: UseNestedItemsOptions = {},
): UseNestedItemsResult {
  const [staged, setStaged] = useState<Record<string, CartItem>>({})
  const [panelItem, setPanelItem] = useState<QuickAddProduct | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const checkedKeys = new Set(Object.keys(staged))
  // The drawer's picks carry its 2+ discount into the subtotal and the bag
  const stagedItems = display === 'drawer' ? withBundleDiscount(Object.values(staged)) : Object.values(staged)
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

  // Bumped when an item is unchecked, so its quick-add form starts over next time
  const [formRun, setFormRun] = useState(0)

  const handleToggle = (item: QuickAddProduct, checked: boolean) => {
    if (checked) {
      setPanelItem(item)
      setPanelOpen(true)
    } else {
      unstage(nestedItemKey(item))
      setFormRun((n) => n + 1)
      onUnstage?.(item)
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
      description={description}
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
        // The item as the host draws it now (its image can follow the choices)
        product={panelItem ? items.find((it) => nestedItemKey(it) === nestedItemKey(panelItem)) ?? panelItem : null}
        onChange={panelItem && onPanelChange ? (values) => onPanelChange(panelItem, values) : undefined}
        formKey={formRun}
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
