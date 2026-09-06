import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'

export interface GiftOption {
  id:               string
  name:             string
  /** e.g. "Gift bag, gift box and a custom note" */
  description:      string
  /** Full-sentence form shown in the drawer. Falls back to `description`. */
  longDescription?: string
  /** Minor units (cents). */
  price:            number
  imageUrl:         string
  /** When present, only these cart items can use this option. */
  eligibleItemIds?: string[]
}

export interface CartItem {
  id:       string
  name:     string
  imageUrl: string
}

/** One assignment per item, keyed by itemId. */
export interface GiftAssignment {
  itemId:   string
  optionId: string
  note:     string
}

/**
 * Icons are injected by the host page so nothing in this folder resolves a brand.
 */
export interface GiftingIcons {
  GiftIcon:      React.ComponentType<IconProps>
  CheckmarkIcon: React.ComponentType<IconProps>
  XIcon:         React.ComponentType<IconProps>
  AiMagicIcon:   React.ComponentType<IconProps>
  TrashCanIcon:  React.ComponentType<IconProps>
}

export function formatPrice(cents: number): string {
  const dollars = cents / 100
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`
}

/** Replaces any existing assignment for the item rather than duplicating it. */
export function upsertAssignment(
  assignments: GiftAssignment[],
  next: GiftAssignment,
): GiftAssignment[] {
  const without = assignments.filter(a => a.itemId !== next.itemId)
  return [...without, next]
}

export function isItemEligible(option: GiftOption, itemId: string): boolean {
  return !option.eligibleItemIds || option.eligibleItemIds.includes(itemId)
}
