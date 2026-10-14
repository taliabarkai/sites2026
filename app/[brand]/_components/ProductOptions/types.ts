// Product option config. A product page passes a list of groups; every group
// renders from config alone — no per-option components.

/** How the group's values are laid out and opened. */
export type OptionDisplay = 'select' | 'list-dropdown' | 'panel-dropdown' | 'carousel' | 'grid' | 'drawer'

/** How each value is drawn. */
export type OptionTileStyle = 'text' | 'standard' | 'big' | 'image-only'

export interface OptionValue {
  id: string
  label: string
  /** Image URL — drawn above the label (standard, big) or as the swatch (image-only). */
  image?: string
  /** Solid color shown where there's no image — product content (a gem, a thread), not styling. */
  swatchColor?: string
  /** Added to the item price when selected, in cents. */
  priceDelta?: number
  disabled?: boolean
}

export interface ChoiceGroup {
  kind?: 'choice'
  id: string
  label: string
  display: OptionDisplay
  /** Defaults to 'text'. Ignored by `select`. */
  tile?: OptionTileStyle
  values: OptionValue[]
  /** Falls back to the first enabled value. */
  defaultValueId?: string
  required?: boolean
  /** Image-only swatch size. */
  size?: 'sm' | 'lg'
  /** Shape of `big` tile images. Defaults to 'circle'. */
  imageShape?: 'circle' | 'square'
  /** Show each value's full price (item base + delta) on the right — the material picker. */
  showPrice?: boolean
}

export interface TextInputGroup {
  kind: 'text-input'
  id: string
  label: string
  maxLength: number
  placeholder?: string
  required?: boolean
}

export interface AddonItem {
  id: string
  title: string
  image: string
  /** Fixed price in cents… */
  price?: number
  /** …or a share of the configured item's price (0.5 = 50%). */
  percentOfItem?: number
  /** Shown in a dialog from "More Details". Omit to hide the link. */
  details?: string
}

export interface AddonGroup {
  kind: 'addon'
  id: string
  label: string
  /** `carousel` scrolls a row of cards; `single` is one full-width card. */
  layout: 'carousel' | 'single'
  items: AddonItem[]
}

export type OptionGroup = ChoiceGroup | TextInputGroup | AddonGroup

export const isChoiceGroup = (g: OptionGroup): g is ChoiceGroup => g.kind === undefined || g.kind === 'choice'

/** Every selection on the page, in one place. */
export interface OptionsState {
  choices: Record<string, string>
  text: Record<string, string>
  addons: Record<string, string[]>
}

/** The selection handed to Add to Bag. */
export interface SelectedOption {
  label: string
  value: string
}
