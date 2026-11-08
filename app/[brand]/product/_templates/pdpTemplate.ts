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

import type { PersonalizePlacement } from '../../_config/demoParams'

// ─── Catalog 2.0 vocabulary (kept verbatim) ─────────────────────────────────

/** Catalog 2.0 `GalleryDisplay`, plus two proposed values the brands already use. */
export type GalleryDisplay =
  | 'default'      // thumbnails in a row beneath the main image
  | 'sideScroll'   // thumbnails in a rail beside the main image (LAL)
  | 'stickyHero'   // proposed: sticky hero left, vertical scroll column right (OAL)
  | 'grid'         // proposed: 2×2 static grid (TGR today)
  | 'heroGrid'     // proposed: first image full width, the rest two across — the live preview takes the hero
  | 'heroGridPhotoFirst' // proposed: heroGrid led by the product photo; the preview is pushed in above it once the shopper types
  | 'overlayThumbs' // proposed: one full-width image, a thumbnail column floating over its left edge
  | 'slider'       // proposed: full-width strip of viewport-height slides under a floating buy box, click to zoom

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
  /**
   * proposed: how a field draws in this step when it differs from its own
   * `displayType` — material as a compact swatch row inside a step while the
   * page shows it as full tiles.
   */
  display?: Record<number, FieldDisplayType>
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
  /** proposed: offer this value only while another field has one of these values ("1 initial" only without a stone). */
  visibleWhen?: VisibleWhen
}

/** A condition on other fields' values; a list means all of them must hold. */
export type VisibleWhen = { fieldId: number; valueIds: string[] } | { fieldId: number; valueIds: string[] }[]

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
  /** `false` hides each value's "+$40" on the tile; the price still moves. Default true. */
  showPriceDelta?: boolean

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
  visibleWhen?: VisibleWhen
  /**
   * proposed: a one-letter text field picked rather than typed — a dropdown
   * that opens a letter keyboard (OAL's initials). Still `type: 'text'`, so
   * the cart and the preview read it as text.
   */
  keyboard?: boolean
  /**
   * proposed: the text's length is set by another field — a "number of
   * initials" dropdown: the field takes exactly that many characters.
   */
  lengthFrom?: number
  /** proposed: a text field that takes letters only (no digits, spaces or symbols). */
  lettersOnly?: boolean
  /** proposed: typed text is shown and kept in capitals (initials). */
  uppercase?: boolean
  /**
   * proposed: the price grows with the text — `cents` for every character
   * past the first `included` (Inez: each initial after the first).
   */
  pricePerCharacter?: { included: number; cents: number }
  /**
   * proposed: a longer minimum while another choice holds — Inez's stones sit
   * between the initials, so a stone needs at least two. `message` is the
   * error shown when it's short.
   */
  minLengthWhen?: { when: VisibleWhen; min: number; message: string }
  /**
   * proposed: one fixed answer, stated and not asked ("Chain length: One
   * size"). The field's first value is the answer; it still goes in the cart.
   */
  fixed?: boolean
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
  | NecklaceStudioEngine

/** The Name Necklace Studio's plating codes (necklace-studio/engine/render/sprite.ts). */
export type StudioCoating = 'GP' | 'SR' | 'RGP' | 'VMGP' | 'VMRGP'

/**
 * proposed: the Name Necklace Studio (necklace-studio/, see its HANDOFF.md) —
 * each name's plate solved on the server from the real lettering, hung on a
 * simulated chain in the browser. The page sends only the SKU, the names and
 * the coating; the SKU's model settings stay on the server.
 */
export interface NecklaceStudioEngine {
  kind: 'necklaceStudio'
  /** The name field; a repeated field gives one plate per name (multi-name). */
  textFieldId: number
  /** The material field, and its values' plating. */
  materialFieldId: number
  coatings: Record<string, StudioCoating>
  /** For a material missing from `coatings`. */
  defaultCoating: StudioCoating
}

/** A stone: a picture of the gem, or a diamond cut the renderer draws itself. */
export type StoneLook = { image: string } | { cut: 'round' | 'oval' | 'emerald' }

export interface StoneSeparator {
  sources: { fieldId: number; stones: Record<string, StoneLook> }[]
  /** A field that scales the stone (carat): value id → size multiplier. */
  size?: { fieldId: number; scale: Record<string, number> }
}

export interface PlaceholderSpec {
  /** Base product shot per value of one field (per metal, per heart color…). */
  base: { fieldId: number; images: Record<string, string> }
  /** Text layers: which field's text goes where, in which font. */
  text?: {
    fieldId: number
    /** CSS font the text is drawn in. */
    font: string
    /** As fractions of the base image, so the same spec works at any size. */
    box: { x: number; y: number; w: number; h: number }
    /** `single`: the values joined on one line. `stack`: one line per repeated value. */
    layout?: 'single' | 'stack'
    uppercase?: boolean
    /** proposed: one piece per character of the text ("LBD" → L, B, D) — initials typed in one field. */
    perCharacter?: boolean
    /**
     * proposed: a stone set on the chain between consecutive values (`single`
     * layout) — Inez's initials. The first source whose field has a value in
     * the preview input picks the stone, so a hidden field (no stone, or the
     * other kind of stone) adds none.
     */
    separator?: StoneSeparator
  }[]
  /**
   * mockup-only: a drawn chain in the selected metal's color, hung from the top
   * of the image to the pendant (the first overlay's box, else the first text
   * box). Drawn only while the base image is missing.
   */
  chain?: { style: 'cable' }
  /** Image layers swapped by a field value (diamond size, heart color). */
  overlays?: { fieldId: number; images: Record<string, string>; box: { x: number; y: number; w: number; h: number } }[]
}

export interface LivePreview {
  enabled: boolean
  engine: PreviewEngine
  /** `first`: prepended as slot 0 with a ribbon (LAL today). `replaceHero`: swaps the main image. */
  galleryPlacement: 'first' | 'replaceHero'
  /**
   * Shown on the preview once the shopper has personalized it ("Your
   * Personalization"). Without `sampleText`, shown whenever the preview is.
   */
  ribbon?: string
  /**
   * proposed: what the preview draws before the shopper types — the name in
   * the product's own photo, per text field (a repeat takes as many as it
   * needs). With it, the preview IS the main image from page load (pair with
   * `replaceHero`): the product's first photo only appears on category pages,
   * and clearing the name returns to this sample rather than to the photo.
   */
  sampleText?: Record<number, string[]>
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
  /**
   * proposed: the "Personalize" row that opens the panel when the
   * personalization lives behind it (the demo's "In panel" placement).
   */
  personalizeRow?: { title: string; description: string }
  /**
   * mockup-only: the personalize version (the header's demo toggle) this
   * product opens on when the link doesn't name one. Default V1.
   */
  defaultPlacement?: PersonalizePlacement
  /**
   * mockup-only: V5's (Jewelry) own tabs, in order, when the default split —
   * Personalize (the text and its count), then Customize (the rest) — doesn't fit.
   */
  jewelrySteps?: PresentationStep[]
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
  /**
   * mockup-only: other themes that render this template on the same product
   * id — IB and MNN share TGR's catalog in the mockup, so they reuse Carrie.
   */
  alsoOn?: PdpTemplate['brand'][]
  sku: string
  /** The product in the mockup's registry (data/products). */
  productId: number
  /** One line for the index page. */
  summary: string
  /**
   * mockup-only: who draws the page. `template` (default) renders from this
   * config; `bespoke` keeps a hand-built customizer and the template is
   * documentation only (MM, until it is ported).
   */
  renderer?: 'template' | 'bespoke'

  // Catalog 2.0 `EditorPresentation`, with `galleryDisplay` split per viewport (proposed)
  gallery: {
    desktop: GalleryDisplay
    mobile: 'carousel'
    /**
     * proposed: product ribbons on the main image (a promotion, "15% off"),
     * in the ribbon colors, stacked under the live preview's own ribbon.
     */
    badges?: string[]
  }
  /**
   * proposed: a promotion on the whole product — the selling price is this
   * much off every material's price, shown beside the crossed-out price with
   * a "Save N%" tag (and the gallery badge drawn in the sale color).
   */
  sale?: { percent: number }
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
