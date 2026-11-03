import { brandProducts } from '../../../data/products'
import type { CartItem } from '../_context/CartContext'
import type { QuickAddOption, QuickAddProduct } from '../_components/QuickAddPanel'
import type { OutdatedItem } from '../_components/checkout/OutdatedItems/types'

/**
 * Stand-in for the server's "this line no longer matches its product" answer,
 * for the `?state=outdated` checkout preview.
 *
 * Applied by position in the bag rather than by product, so the preview works
 * on every brand's demo bag. The scenario control picks which lines are out of
 * date, and how many lines the bag has:
 *
 *   one   — 1 item to update (its chain was removed)
 *   two   — 2 items to update (a chain removed; a new required option)
 *   mixed  — 1 to update and 1 no longer available, both in the popup (Option 1)
 *   mixed2 — the same bag, split (Option 2): the popup asks only for the
 *            update; the unavailable line gets checkout's inline OOS alert
 */

/** The PDP's metal picker, as the category Quick Add shows it. */
const METAL: QuickAddOption = {
  name: 'Metal',
  type: 'swatch',
  values: [
    { label: 'Gold Vermeil',    value: 'vermeil',   color: 'var(--gold-vermeil-18k)',     price: 0 },
    { label: 'Sterling Silver', value: 'silver',    color: 'var(--sterling-silver-925)',  price: -1000 },
    { label: '14K Solid Gold',  value: 'solid-14k', color: 'var(--solid-gold-14k)',       price: 5000 },
    { label: 'Rose Gold',       value: 'rose',      color: 'var(--rose-gold-14k)',        price: 1500 },
  ],
}

type Scenario = Omit<OutdatedItem, 'itemId' | 'editor'> & {
  /** The product's options today, and the line's choices — the editor is built from these. */
  editor?: { options: QuickAddOption[]; engraving?: QuickAddProduct['engraving']; selectedOptions: Record<string, string>; names: string[] }
}

/** Line 1 everywhere: its 18" Rope Chain was taken off the product. */
const CHAIN_REMOVED: Scenario = {
  kept: [
    { label: 'Metal',   value: 'Gold Vermeil' },
    { label: 'Initial', value: 'E' },
  ],
  issue: { kind: 'value-removed', option: 'Chain', removedValue: '18" Rope Chain' },
  editor: {
    engraving: 'fields',
    options: [
      METAL,
      { name: 'Initial', type: 'text-input', maxLength: 1, placeholder: 'e.g. E' },
      {
        name: 'Chain',
        type: 'list-dropdown',
        values: ['16"', '18"', '20"'].map(length => ({ label: length, value: length })),
      },
    ],
    // The removed 18" Rope Chain's nearest replacement, preselected.
    selectedOptions: { Metal: 'vermeil', Initial: 'E', Chain: '18"' },
    names: [],
  },
}

/** The compass necklace can no longer be ordered at all. */
const UNAVAILABLE: Scenario = {
  kept: [
    { label: 'Metal',     value: 'Gold Vermeil' },
    { label: 'Engraving', value: 'Always find your way home' },
  ],
  issue: { kind: 'unavailable' },
}

/** The compass necklace gained a required option it was added without. */
const DIAMOND_ADDED: Scenario = {
  kept: [
    { label: 'Metal',     value: 'Gold Vermeil' },
    { label: 'Engraving', value: 'Always find your way home' },
  ],
  issue: { kind: 'option-added', option: 'Diamond' },
  editor: {
    engraving: 'fields',
    options: [
      METAL,
      { name: 'Engraving', type: 'text-input', maxLength: 30, placeholder: 'e.g. Always find your way home' },
      {
        name: 'Diamond',
        type: 'list-dropdown',
        values: ['Small', 'Medium', 'Large'].map(size => ({ label: size, value: size.toLowerCase() })),
      },
    ],
    selectedOptions: { Metal: 'vermeil', Engraving: 'Always find your way home', Diamond: 'small' },
    names: [],
  },
}

export const OUTDATED_SCENARIOS = ['one', 'two', 'mixed', 'mixed2'] as const

export type OutdatedScenario = (typeof OUTDATED_SCENARIOS)[number]

/** The scenario the Outdated state opens on. */
export const DEFAULT_OUTDATED_SCENARIO: OutdatedScenario = 'one'

/** `?outdated=two` — read alongside `?state=outdated`, ignored otherwise. */
export const OUTDATED_SCENARIO_PARAM = 'outdated'

export function readOutdatedScenario(params: { get(name: string): string | null }): OutdatedScenario {
  const raw = params.get(OUTDATED_SCENARIO_PARAM)
  return OUTDATED_SCENARIOS.includes(raw as OutdatedScenario)
    ? (raw as OutdatedScenario)
    : DEFAULT_OUTDATED_SCENARIO
}

/** What each scenario's control reads. */
export const OUTDATED_SCENARIO_LABELS: Record<OutdatedScenario, string> = {
  one:   '1 to update',
  two:   '2 to update',
  mixed:  'Update + unavailable · Option 1',
  mixed2: 'Update + unavailable · Option 2',
}

/**
 * Option 2: unavailable lines stay out of the popup and are handled as plain
 * out-of-stock — the inline alert, the summary flag, payment held.
 */
export function splitsUnavailable(scenario: OutdatedScenario): boolean {
  return scenario === 'mixed2'
}

/** Each scenario's lines, in bag order — its length is the bag size it pins. */
const SCENARIO_LINES: Record<OutdatedScenario, Scenario[]> = {
  one:   [CHAIN_REMOVED],
  two:   [CHAIN_REMOVED, DIAMOND_ADDED],
  mixed:  [CHAIN_REMOVED, UNAVAILABLE],
  mixed2: [CHAIN_REMOVED, UNAVAILABLE],
}

/** How many lines the bag holds for a scenario. */
export function outdatedScenarioSize(scenario: OutdatedScenario): number {
  return SCENARIO_LINES[scenario].length
}

/**
 * The line's gallery, so the editor gets Quick Add's edge-to-edge carousel:
 * the line's own image first — the piece as the shopper sees it in the bag —
 * then the catalog's on-model shot for that product, where it has one.
 */
function galleryFor(item: CartItem): QuickAddProduct['images'] {
  const product = Object.values(brandProducts).flat().find(p => p.name === item.name)
  return [
    { src: item.image, alt: item.name },
    ...(product?.hoverImage ? [{ src: product.hoverImage, alt: item.name, onModel: product.hasModelImage !== false }] : []),
  ]
}

export function getOutdatedPreview(items: CartItem[], scenario: OutdatedScenario): OutdatedItem[] {
  const lines = SCENARIO_LINES[scenario]
  return items.slice(0, lines.length).map((item, i) => {
    const { editor, ...rest } = lines[i]
    return {
      itemId: item.id,
      ...rest,
      editor: editor && {
        // The line's price is the base: what it costs with the choices it has.
        product: {
          title: item.name,
          price: item.price,
          currency: '$',
          rating: item.rating,
          reviewCount: item.reviewCount,
          images: galleryFor(item),
          pdpUrl: '',
          options: editor.options,
          engraving: editor.engraving,
        },
        values: { selectedOptions: editor.selectedOptions, names: editor.names },
      },
    }
  })
}
