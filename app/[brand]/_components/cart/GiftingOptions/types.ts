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
  /** e.g. "Gift bag, gift box and a custom note". Absent when the option is
   *  the image, the name and the price — nothing more. */
  description?:     string
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
  /**
   * The item's own gift options. When present they replace the brand list for
   * this item; when absent the brand list applies, so a shared catalog is
   * simply the case where nothing is supplied here.
   */
  giftOptions?: GiftOption[]
}

/** An item's own options when it has them, otherwise the brand's shared list. */
export function optionsForItem(item: CartItem, brandOptions: GiftOption[]): GiftOption[] {
  return item.giftOptions ?? brandOptions
}

/**
 * Whether every item in the bag brings its own options.
 *
 * The one fact the section branches on. It stands in for "the options describe
 * this item, not the brand" — so the card already names the item, the panel has
 * no item left to ask about, and the heading can say what is being added. A
 * brand moving to per-item options needs no code change to get all three.
 */
export function areOptionsItemBound(items: CartItem[]): boolean {
  return items.length > 0 && items.every(i => (i.giftOptions?.length ?? 0) > 0)
}

/** Resolves an option id against the pool that actually applies to the item. */
export function findOptionForItem(
  items: CartItem[],
  brandOptions: GiftOption[],
  itemId: string,
  optionId: string,
): GiftOption | null {
  const item = items.find(i => i.id === itemId)
  const pool = item ? optionsForItem(item, brandOptions) : brandOptions
  return pool.find(o => o.id === optionId) ?? null
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
  PlusMinusIcon: React.ComponentType<IconProps>
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

/** "A", "A and B", "A, B and C". */
function formatList(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/**
 * How an option applies to the bag — the line the option card carries where it
 * used to list the box contents.
 *
 * The contents belong in the panel, where the shopper is deciding in detail.
 * On the card the useful fact is whether this packaging covers their bag, and
 * that only becomes a question when there is more than one item *and* more than
 * one packaging to choose between. Either of those being one makes the answer
 * obvious, so the line is left off rather than stating it.
 *
 * Names the exception, not the rule: an option that excludes one piece stays a
 * short line however many pieces it does cover.
 */
export function availabilityNote(
  option: GiftOption,
  items: CartItem[],
  /** The options actually on offer alongside this one. */
  pool: GiftOption[],
): string | undefined {
  if (items.length < 2 || pool.length < 2) return undefined
  return excludedItemsNote(option, items) ?? 'Available for all items'
}

/**
 * The pieces in the bag this option cannot go on, or undefined when it covers
 * all of them. Ungated, unlike `availabilityNote` — somewhere that has already
 * decided to explain itself just needs the words.
 */
export function excludedItemsNote(
  option: GiftOption,
  items: CartItem[],
): string | undefined {
  const excluded = items.filter(item => !isItemEligible(option, item.id))
  return excluded.length === 0
    ? undefined
    : `Not available for ${formatList(excluded.map(i => i.name))}`
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
