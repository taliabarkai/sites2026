/**
 * PDP template schema — the vocabulary a product page renders from.
 *
 * This is a superset of the Catalog 2.0 presentation schema in
 * site-experience-manager (`shared/api/productPresentation/types.ts`):
 *
 *   Presentation { schemaVersion, enabled?, editor: { galleryDisplay, steps: [{ label, fieldIds }] } }
 *   SkuField     { fieldId, name, type, displayType, order, isRequired, textMinLength, textMaxLength, optionCount }
 *
 * Every Catalog 2.0 field keeps its name and meaning here. Everything the
 * mockup adds on top is marked `// mockup-only` or `// proposed` so the handoff
 * back to the BOS is a diff, not a translation. See docs/pdp-template-handoff.md.
 */

// ─── Catalog 2.0 vocabulary (kept verbatim) ─────────────────────────────────

/** Catalog 2.0 `GalleryDisplay`, plus two proposed values the brands already use. */
export type GalleryDisplay =
  | 'default'      // thumbnails in a row beneath the main image
  | 'sideScroll'   // thumbnails in a rail beside the main image (LAL)
  | 'stickyHero'   // proposed: sticky hero left, vertical scroll column right (OAL)
  | 'grid'         // proposed: 2×2 static grid (TGR today)

/** Catalog 2.0 `ProductFieldType`. */
export type FieldType = 'text' | 'selection' | 'upload' | 'image_customization' | 'template_customization' | 'multi_select'

/** Catalog 2.0 `ProductFieldDisplayType`. */
export type FieldDisplayType = 'text' | 'visual' | 'carousel' | 'grid' | 'dnd' | 'drawer' | 'visual_dropdown_list'

/** Catalog 2.0 `PresentationStep`. `fieldIds` are global catalog field ids. */
export interface PresentationStep {
  label: string
  fieldIds: number[]
  /** proposed: one line under the step label (MM shows "Song, names & date"). */
  hint?: string
}

// ─── Fields ─────────────────────────────────────────────────────────────────

export interface FieldValue {
  id: string
  label: string
  image?: string
  /** Product content (a metal, a heart enamel), not styling. */
  swatchColor?: string
  /** Added to the item price when selected, in cents. */
  priceDelta?: number
  /** Shown instead of a +delta: the material's full price. */
  priceLabel?: string
  /** A small line under the label: "(Most Popular)". */
  hint?: string
  disabled?: boolean
}

/**
 * A catalog field as the page sees it. The first block is Catalog 2.0's
 * `SkuField`; the rest is what the page needs to actually draw it.
 */
export interface Field {
  // Catalog 2.0 SkuField
  fieldId: number
  name: string
  cartName: string
  type: FieldType
  displayType: FieldDisplayType | null
  order: number
  isRequired: boolean
  textMinLength?: number | null
  textMaxLength?: number | null

  // mockup-only: the values are catalog data in production, inline here
  values?: FieldValue[]
  defaultValueId?: string
  placeholder?: string
  /** A secondary link beside the label: "Inscriptions Guide", "Size guide". */
  helpLink?: string
  /** A short note under the label; `tone: 'warning'` draws it in the brand's warning color. */
  note?: { text: string; tone?: 'default' | 'warning' }
  /** Tooltip content behind a "?" beside the label. */
  tooltip?: string

  // proposed: things the page needs that Catalog 2.0 does not carry yet
  /** How the field moves the price. `base`: its value *is* the price (material). `delta`: adds to it. */
  pricing?: 'base' | 'delta' | 'none'
  /** Whether a change here re-renders the live preview. */
  affectsPreview?: boolean
  /**
   * Repeat this field once per unit of another field's value — the name
   * fields of a multi-name necklace, one per "number of names".
   */
  repeat?: { countFieldId: number; min: number; max: number; labelPattern: string }
  /**
   * A read-only value derived from another field — "4 diamonds" from
   * "5 names". Rendered as text, never as an input.
   */
  derivedFrom?: { fieldId: number; label: (count: number) => string }
  /** Show this field only when another field has one of these values. */
  visibleWhen?: { fieldId: number; valueIds: string[] }
}

// ─── Live preview ───────────────────────────────────────────────────────────

/**
 * How the preview image is produced. The page never cares which; it hands
 * the current field values to the engine and gets an image back.
 *
 * `placeholder` is the mockup's own SVG renderer (text in a web font over a
 * base image, composited client-side like MM). `external` is the real engine;
 * the mockup fakes its latency so the loading state can be reviewed.
 */
export type PreviewEngine =
  | { kind: 'placeholder'; spec: PlaceholderSpec }
  | { kind: 'external'; endpoint: string; simulatedLatencyMs?: number }

export interface PlaceholderSpec {
  /** Base product shot per value of one field (per metal, per heart color…). */
  base: { fieldId: number; images: Record<string, string> }
  /** Text layers: which field's text goes where, in which font. */
  text?: {
    fieldId: number
    font: string
    /** As fractions of the base image, so the same spec works at any size. */
    box: { x: number; y: number; w: number; h: number }
    /** `stack`: one line per repeated value (multi-name). */
    layout?: 'single' | 'stack'
    uppercase?: boolean
  }[]
  /** Image layers swapped by a field value (diamond size, heart color). */
  overlays?: { fieldId: number; images: Record<string, string>; box: { x: number; y: number; w: number; h: number } }[]
}

export interface LivePreview {
  enabled: boolean
  engine: PreviewEngine
  /** `first`: prepended as slot 0 with a ribbon (LAL today). `replaceHero`: swaps the main image. */
  galleryPlacement: 'first' | 'replaceHero'
  ribbon?: string
  /** Shown while the engine is rendering (external) or always (placeholder). */
  disclaimer?: string
}

// ─── Flow ───────────────────────────────────────────────────────────────────

/**
 * Where the steps live and how the shopper gets into them.
 *
 * `inline`: every step's fields sit on the page in order (single-step pages).
 * `card`: steps as tabs inside a card on the page (MM desktop).
 * `panel`: steps as tabs inside a slide-in panel with the preview on top (MM mobile).
 */
export type StepContainer = 'inline' | 'card' | 'panel'

export interface Flow {
  /** Fields that stay on the page *before* the shopper enters the steps (MM: song + artist). */
  entryFieldIds?: number[]
  /** The CTA that opens the steps. Absent when `container` is `inline` on both viewports. */
  entryCta?: string
  container: { desktop: StepContainer; mobile: StepContainer }
  /** After the last step: `addToBag` adds directly; `summary` shows "My Personalization" with Edit first (MM). */
  completion: 'addToBag' | 'summary'
  /** Label of the CTA that advances a step. `{next}` is replaced with the next step's label. */
  nextCta?: string
  /** Sticky bottom bar on mobile once the page's CTA scrolls away. */
  stickyBar?: boolean
}

// ─── Template ───────────────────────────────────────────────────────────────

export interface PdpTemplate {
  /** Catalog 2.0 `Presentation.schemaVersion`. */
  schemaVersion: number
  /** Catalog 2.0 `Presentation.enabled`. */
  enabled: boolean

  // mockup-only identity
  id: string
  brand: 'oal' | 'tgr' | 'lal' | 'ib' | 'mnn'
  sku: string
  /** The product in the mockup's registry (data/products). */
  productId: number
  /** One line for the index page. */
  summary: string

  // Catalog 2.0 `EditorPresentation`, with `galleryDisplay` split per viewport (proposed)
  gallery: { desktop: GalleryDisplay; mobile: 'carousel' }
  steps: PresentationStep[]

  fields: Field[]
  livePreview: LivePreview
  flow: Flow

  /** Companion products under the form (nested items, the MM slipmat). */
  addons?: { id: string; title: string; image: string; price: number; originalPrice?: number; badge?: string }[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export const fieldById = (t: PdpTemplate, id: number): Field | undefined => t.fields.find((f) => f.fieldId === id)

export const stepFields = (t: PdpTemplate, step: PresentationStep): Field[] =>
  step.fieldIds.map((id) => fieldById(t, id)).filter((f): f is Field => !!f)

export const isSingleStep = (t: PdpTemplate): boolean => t.steps.length === 1

/** Fields that move the price — the ones a two-step flow keeps on the page. */
export const priceSettingFields = (t: PdpTemplate): Field[] => t.fields.filter((f) => f.pricing === 'base' || f.pricing === 'delta')

/**
 * Catalog 2.0 maps each field's `displayType` to a UI; the mockup's
 * ProductOptions component has its own vocabulary. One place to translate.
 */
export const DISPLAY_TYPE_TO_OPTION_DISPLAY: Record<FieldDisplayType, { display: 'select' | 'list-dropdown' | 'panel-dropdown' | 'carousel' | 'grid' | 'drawer'; tile: 'text' | 'standard' | 'big' | 'image-only' }> = {
  text:                 { display: 'select',        tile: 'text' },
  visual:               { display: 'grid',          tile: 'image-only' },
  carousel:             { display: 'carousel',      tile: 'standard' },
  grid:                 { display: 'grid',          tile: 'standard' },
  dnd:                  { display: 'grid',          tile: 'standard' },     // drag-and-drop ordering: not in the mockup yet
  drawer:               { display: 'drawer',        tile: 'standard' },
  visual_dropdown_list: { display: 'list-dropdown', tile: 'text' },
}
