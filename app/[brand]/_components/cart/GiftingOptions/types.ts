import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'

/** Max length of the "Name on the box" field. */
export const MAX_NAME_LENGTH = 16
/** Max length of the gift note. */
export const MAX_NOTE_LENGTH = 280

/** A printed design the shopper can choose. Cosmetic only — never changes price. */
export interface DesignOption {
  key:   string
  label: string
  image: string | null
}

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
  /** Shopper picks a printed design from the brand's design set. */
  designs?:         boolean
  /** "Name on the box" is shown and required. */
  wantsName?:       boolean
  /** A photo upload is shown and required. */
  wantsPhoto?:      boolean
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
  /** Chosen design key, or null when the option has no designs. */
  design:   string | null
  /** Name on the box. Empty when the option does not ask for one. */
  pname:    string
  /** Whether a photo has been supplied. */
  photo:    boolean
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

/**
 * Whether every field the option marks required has been supplied.
 *
 * The gift note is deliberately absent: it is always optional and must never
 * block "Add to bag".
 */
export function requiredFieldsMet(
  option: GiftOption,
  draft: { pname: string; photo: boolean },
): boolean {
  if (option.wantsName && draft.pname.trim().length === 0) return false
  if (option.wantsPhoto && !draft.photo) return false
  return true
}
