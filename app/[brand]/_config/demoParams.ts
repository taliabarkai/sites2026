/**
 * Query parameters that describe a checkout demo configuration.
 *
 * The prototype's scenario switches live in the URL rather than in component
 * state so a specific configuration can be sent to a reviewer as a link —
 * and so the variant survives the page refresh that the error state's own
 * call to action asks for.
 *
 *   ?gifting=v2&items=3&state=error
 */

import { FLOWS, DEFAULT_FLOW, type Flow } from './flow'

export const GIFTING_VARIANTS = ['v1', 'v2'] as const

export type GiftingVariant = (typeof GIFTING_VARIANTS)[number]

/** The flow that shipped first; absent parameter means this one. */
export const DEFAULT_GIFTING_VARIANT: GiftingVariant = 'v1'

export const FLOW_PARAM            = 'flow'
export const WARRANTY_PARAM        = 'warranty'
export const GIFTING_VARIANT_PARAM = 'gifting'
export const CART_SIZE_PARAM       = 'items'
export const STATE_PARAM           = 'state'

/** Cart sizes the demo can be switched between. */
export const DEMO_CART_SIZES = [1, 2, 3] as const

/** The warranty add-on — hidden, or one of its two designs — owned by the floating cart's control. */
export const WARRANTY_VARIANTS = ['hidden', 'v1', 'v2'] as const

export type WarrantyVariant = (typeof WARRANTY_VARIANTS)[number]

export const DEFAULT_WARRANTY_VARIANT: WarrantyVariant = 'hidden'

interface ReadableParams {
  get(name: string): string | null
}

export function readFlow(params: ReadableParams): Flow {
  const raw = Number(params.get(FLOW_PARAM))
  return FLOWS.includes(raw as Flow) ? (raw as Flow) : DEFAULT_FLOW
}

export function readWarrantyVariant(params: ReadableParams): WarrantyVariant {
  const raw = params.get(WARRANTY_PARAM)?.toLowerCase()
  return WARRANTY_VARIANTS.includes(raw as WarrantyVariant)
    ? (raw as WarrantyVariant)
    : DEFAULT_WARRANTY_VARIANT
}

export function readGiftingVariant(params: ReadableParams): GiftingVariant {
  const raw = params.get(GIFTING_VARIANT_PARAM)?.toLowerCase()
  return GIFTING_VARIANTS.includes(raw as GiftingVariant)
    ? (raw as GiftingVariant)
    : DEFAULT_GIFTING_VARIANT
}

/**
 * The cart size the URL asks for, or null when it says nothing — in which case
 * whatever is already in the bag stands, as it did before the parameter existed.
 */
export function readCartSize(params: ReadableParams): number | null {
  const raw = Number(params.get(CART_SIZE_PARAM))
  return DEMO_CART_SIZES.includes(raw as (typeof DEMO_CART_SIZES)[number]) ? raw : null
}

export function readIsErrorState(params: ReadableParams): boolean {
  return params.get(STATE_PARAM) === 'error'
}

/**
 * The sale preview: one line in the bag marked down, and the saving carried
 * into every order summary. Shares the `state` key with the error preview —
 * both answer "show me this page in a particular state" — and the two are
 * mutually exclusive by construction, since one key holds one value.
 */
export function readIsSaleState(params: ReadableParams): boolean {
  return params.get(STATE_PARAM) === 'sale'
}

/**
 * The outdated-items preview: some bag lines no longer match their product,
 * so checkout opens the popup and blocks payment until each is fixed or
 * removed. Same `state` key, so it excludes the error and sale previews.
 */
export function readIsOutdatedState(params: ReadableParams): boolean {
  return params.get(STATE_PARAM) === 'outdated'
}

/**
 * The out-of-stock preview: one line in the bag is no longer available, so
 * checkout leads with the unavailable-items alert and payment waits until it
 * is removed. Same `state` key as the other previews.
 */
export function readIsOosState(params: ReadableParams): boolean {
  return params.get(STATE_PARAM) === 'oos'
}

/**
 * How many lines are out of stock (`?oos=two`), read alongside `?state=oos`.
 * The bag always keeps one line in stock past them, so there is still
 * something to pay for once they are removed.
 */
export const OOS_SCENARIO_PARAM = 'oos'
export const OOS_SCENARIOS = ['one', 'two'] as const
export type OosScenario = (typeof OOS_SCENARIOS)[number]
export const DEFAULT_OOS_SCENARIO: OosScenario = 'one'

export const OOS_SCENARIO_LABELS: Record<OosScenario, string> = {
  one: '1 unavailable',
  two: '2 unavailable',
}

/** Out-of-stock lines per scenario — always the first ones in the bag. */
export function oosScenarioCount(scenario: OosScenario): number {
  return scenario === 'two' ? 2 : 1
}

/** The bag a scenario pins: its out-of-stock lines, plus one in stock. */
export function oosScenarioSize(scenario: OosScenario): number {
  return oosScenarioCount(scenario) + 1
}

export function readOosScenario(params: ReadableParams): OosScenario {
  const raw = params.get(OOS_SCENARIO_PARAM)
  return OOS_SCENARIOS.includes(raw as OosScenario) ? (raw as OosScenario) : DEFAULT_OOS_SCENARIO
}

/**
 * Track My Order previews three outcomes rather than two, so it reads the
 * same key for a value rather than a flag. `readIsErrorState` stays as it is
 * for checkout, which only knows "error" — a `duplicate` there reads as no
 * error at all, which is the right answer for a page with no such state.
 */
export const TRACK_ORDER_STATES = ['default', 'error', 'duplicate'] as const

export type TrackOrderState = (typeof TRACK_ORDER_STATES)[number]

export function readTrackOrderState(params: ReadableParams): TrackOrderState {
  const value = params.get(STATE_PARAM)
  return value === 'error' || value === 'duplicate' ? value : 'default'
}

/**
 * The nested items Drawer demo: the products that show it — product 15 on
 * every brand, and product 18 on OAL — and how many companion products its
 * drawer holds (`?charms=6`).
 */
export function isNestedDrawerProduct(brand: string, productId: number): boolean {
  return productId === 15 || (brand === 'oal' && productId === 18)
}

/**
 * The PDP's personalize-flow demos — TGR products only, while the flows are
 * being finalised. "Price-setting choices" are the metal, and the diamond
 * shape on products that have one: they stay on the page, since they move the
 * price; the panels hold only the personalisation.
 */
export type PersonalizeFlow =
  /** The page keeps the price-setting choices; a sticky Add to Bag opens the
   *  personalisation, and a second necklace at 50% off, in the Quick Add panel. */
  | { kind: 'two-step'; fields: PersonalizeFields; diamondShape?: DiamondSetting }
  /** The full form stays on the page; the sticky Add to Bag opens just the
   *  personalisation, mirrored with the page. */
  | { kind: 'shortcut' }
  /** The page keeps the price-setting choices; "Add Personalization" (above
   *  Add to Bag, which adds without it) opens the personalisation to save. */
  | { kind: 'save'; fields: PersonalizeFields; diamondShape?: DiamondSetting }
  /** The page keeps only the metal, as a standard-image carousel; "Personalize
   *  Now" opens the rest — diamond shape, personalisation, the 50% offer — in
   *  the Quick Add panel, its gallery included. */
  | {
      kind: 'personalize-now'
      fields: PersonalizeFields
      diamondShape?: DiamondSetting
      /** The page's CTA (and sticky bars). Defaults to "Personalize Now". */
      cta?: string
      /** The panel's Add to Bag carries the bag total after an em dash. Defaults to true. */
      panelTotal?: boolean
    }

/** `names`: a number-of-names selector and a field per name. `inscription`: one engraving field. */
export type PersonalizeFields = 'names' | 'inscription'

/** A diamond shape to pick: `true` — one of the shapes; `'optional'` — the shapes, then "None", the default. */
export type DiamondSetting = boolean | 'optional'

export function personalizeFlowFor(brand: string, productId: number): PersonalizeFlow | undefined {
  if (brand !== 'tgr') return undefined
  switch (productId) {
    case 4:  return { kind: 'personalize-now', fields: 'names', diamondShape: 'optional', cta: 'Personalize & Add to Bag', panelTotal: false }
    case 5:  return { kind: 'shortcut' }
    case 9:  return { kind: 'personalize-now', fields: 'inscription', diamondShape: true }
    case 10: return { kind: 'save', fields: 'inscription', diamondShape: true }
    default: return undefined
  }
}

export const NESTED_DRAWER_PARAM = 'charms'
export const NESTED_DRAWER_COUNTS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const
export const DEFAULT_NESTED_DRAWER_COUNT = 3

export function readNestedDrawerCount(params: ReadableParams): number {
  const raw = Number(params.get(NESTED_DRAWER_PARAM))
  return NESTED_DRAWER_COUNTS.includes(raw as (typeof NESTED_DRAWER_COUNTS)[number])
    ? raw
    : DEFAULT_NESTED_DRAWER_COUNT
}

/**
 * Whether the drawer's PDP trigger shows its optional description line under
 * the heading (`?desc=hide`).
 */
export const NESTED_DESCRIPTION_PARAM = 'desc'
export const NESTED_DESCRIPTION_STATES = ['show', 'hide'] as const

export type NestedDescriptionState = (typeof NESTED_DESCRIPTION_STATES)[number]

export const DEFAULT_NESTED_DESCRIPTION_STATE: NestedDescriptionState = 'show'

export function readNestedDescriptionState(params: ReadableParams): NestedDescriptionState {
  const raw = params.get(NESTED_DESCRIPTION_PARAM)
  return NESTED_DESCRIPTION_STATES.includes(raw as NestedDescriptionState)
    ? (raw as NestedDescriptionState)
    : DEFAULT_NESTED_DESCRIPTION_STATE
}

/**
 * A path with the current demo configuration attached.
 *
 * Every internal step has to carry these forward: the whole point is that one
 * link is one configuration, and losing them mid-journey silently resets the
 * prototype to its defaults.
 */
export function withDemoParams(path: string, params: ReadableParams & { toString(): string }): string {
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

// ─── Live-preview gallery layout ──────────────────────────────────────────────

/**
 * Demo control for template PDPs: which desktop gallery the page draws
 * (`?gallery=overlay`). Without it, the page uses its template's
 * `gallery.desktop`. Mobile is always the carousel.
 */
export const GALLERY_PARAM = 'gallery'

export const GALLERY_LAYOUTS = [
  { value: 'thumbnails', display: 'sideScroll',    label: 'Side thumbnails' },
  { value: 'hero-grid-photo', display: 'heroGridPhotoFirst', label: 'Hero + grid (photo first)' },
  { value: 'overlay',    display: 'overlayThumbs', label: 'Overlay thumbnails' },
] as const

export type GalleryLayout = (typeof GALLERY_LAYOUTS)[number]

export function readGalleryLayout(params: ReadableParams): GalleryLayout | undefined {
  const raw = params.get(GALLERY_PARAM)
  return GALLERY_LAYOUTS.find((l) => l.value === raw)
}

// ─── Live-preview personalization placement ───────────────────────────────────

/**
 * Demo control for template PDPs: personalize on the page, or behind a
 * "Personalize" row that opens a panel (`?personalize=panel`) — a bottom sheet
 * on mobile, a drawer from the right on desktop. Unset, the page follows its
 * template's own flow.
 */
/**
 * Template PDPs: the nested item — a second of the same necklace at 50% off,
 * shown just above Add to Bag (`?nested=on`). Off by default.
 */
export const NESTED_ITEM_PARAM = 'nested'
export const NESTED_ITEM_STATES = [
  { value: 'off', label: 'Off' },
  { value: 'on',  label: 'On' },
] as const

/** Off unless the link turns it on — or, where `defaultOn` (the final live preview), on unless it turns it off. */
export function readNestedItemOn(params: ReadableParams, defaultOn = false): boolean {
  const v = params.get(NESTED_ITEM_PARAM)
  return v === 'on' || (defaultOn && v !== 'off')
}

/**
 * Template PDPs: how the material picker draws — the standard carousel tiles
 * (swatch, name, price) or the carousel's standard image-only tiles (swatches
 * alone, the picked one named beside the label) (`?material=image`).
 */
export const MATERIAL_DISPLAY_PARAM = 'material'
export const MATERIAL_DISPLAYS = [
  { value: 'carousel', label: 'Carousel' },
  { value: 'image',    label: 'Carousel – Standard image only' },
] as const
export type MaterialDisplay = (typeof MATERIAL_DISPLAYS)[number]['value']

/** OAL opens on the image-only tiles; every other brand on the carousel. */
export const defaultMaterialDisplay = (brand: string): MaterialDisplay => (brand === 'oal' ? 'image' : 'carousel')

export function readMaterialDisplay(params: ReadableParams, brand = ''): MaterialDisplay {
  const raw = params.get(MATERIAL_DISPLAY_PARAM)
  return MATERIAL_DISPLAYS.find((d) => d.value === raw)?.value ?? defaultMaterialDisplay(brand)
}

/**
 * The final live preview (`/[brand]/product/livepreviewfinal`): one version —
 * the gallery preview + new layout (live preview's V2) — and a mobile toggle
 * for where the product info sits: above the gallery (as V2) or below it.
 */
export const MOBILE_LAYOUT_PARAM = 'mobileLayout'
export const MOBILE_LAYOUTS = [
  { value: 'info-above',    label: 'Info above gallery' },
  { value: 'gallery-above', label: 'Gallery above info' },
] as const
export type MobileLayout = (typeof MOBILE_LAYOUTS)[number]['value']

export function readMobileLayout(params: ReadableParams): MobileLayout {
  return params.get(MOBILE_LAYOUT_PARAM) === 'gallery-above' ? 'gallery-above' : 'info-above'
}

/** The final live preview's pages: its one-URL demo and every product under it. */
export const FINAL_PREVIEW_SEGMENT = 'livepreviewfinal'
export const isFinalPreviewPath = (pathname: string) => pathname.includes(`/product/${FINAL_PREVIEW_SEGMENT}`)

export const PERSONALIZE_PARAM = 'personalize'

export const PERSONALIZE_PLACEMENTS = [
  // V1: personalization behind the Personalize row; the panel saves it into the gallery
  { value: 'panel',    label: 'V1', description: 'Current layout', desktopNote: undefined },
  // V2: every field on the page, the preview in the gallery; on mobile the
  // breadcrumbs, title, price and reviews sit above the gallery (the new layout)
  // On desktop V2 and V3 are one layout (every field inline) — the menu says so there
  { value: 'page',     label: 'V2', description: 'Gallery Preview + New Layout', desktopNote: 'Desktop: same as V3' },
  // V3 (mobile): the fields stay on the page; tapping the name opens the panel, already typing
  { value: 'panel-v3', label: 'V3', description: 'Text field opens panel', desktopNote: 'Desktop: same as V2' },
  // V4: one CTA on the page (Personalize Now); the panel adds to bag itself — no Save step
  { value: 'panel-c',  label: 'V4', description: 'Personalize Now', desktopNote: undefined },
  // V5: the Music Memories two-step flow for jewelry — Personalize (the name),
  // then Customize (material, chain, add-ons) and Add to bag; a sheet on
  // mobile, the same tabs inline on desktop
  { value: 'jewelry',  label: 'V5', description: 'Jewelry', desktopNote: undefined },
  // V6: V5 with the steps already open on desktop — no entry card, no Back;
  // the gallery takes the live preview at the first pick. Mobile as V5.
  { value: 'jewelry-open', label: 'V6', description: 'Jewelry – steps open on desktop', desktopNote: 'Mobile: same as V5' },
] as const

export type PersonalizePlacement = (typeof PERSONALIZE_PLACEMENTS)[number]['value']

/** Template PDPs open on V1 unless the link names another version (or the template its own). */
export const DEFAULT_PERSONALIZE_PLACEMENT: PersonalizePlacement = 'panel'

export function readPersonalizePlacement(params: ReadableParams, templateDefault?: PersonalizePlacement): PersonalizePlacement {
  const raw = params.get(PERSONALIZE_PARAM)
  return PERSONALIZE_PLACEMENTS.find((f) => f.value === raw)?.value ?? templateDefault ?? DEFAULT_PERSONALIZE_PLACEMENT
}

// ─── Free-preview cart note ───────────────────────────────────────────────────

/**
 * LAL products whose preview arrives by email (Royal Romance, 7). Their
 * revisions card is the free-preview strip, their CTA adds straight to the bag,
 * and their bag line carries the note below.
 */
export const FREE_PREVIEW_PRODUCT_IDS = new Set([7])
export const FREE_PREVIEW_CART_NOTE = 'FREE PREVIEW IN 24 HOURS'

export const isFreePreviewProduct = (brand: string, productId: number): boolean =>
  brand === 'lal' && FREE_PREVIEW_PRODUCT_IDS.has(productId)

/**
 * How a bag line's note shows in the floating cart and on the bag page
 * (`?cartnote=v2`): V1 a beige tag above the item, V2 a theme ribbon over the
 * item's image, V3 the tag above the product name (floating cart; the bag page
 * keeps it above, as in V1). V1 by default.
 */
export const CART_NOTE_PARAM = 'cartnote'
export const CART_NOTE_VARIANTS = [
  { value: 'v1', label: 'V1 – Line above item' },
  { value: 'v2', label: 'V2 – Ribbon on image' },
  { value: 'v3', label: 'V3 – Tag above product name' },
] as const
export type CartNoteVariant = (typeof CART_NOTE_VARIANTS)[number]['value']

export function readCartNoteVariant(params: ReadableParams): CartNoteVariant {
  const raw = params.get(CART_NOTE_PARAM)?.toLowerCase()
  return CART_NOTE_VARIANTS.find(v => v.value === raw)?.value ?? 'v1'
}

// ─── Free-preview USP strip ───────────────────────────────────────────────────

/**
 * How the free-preview product shows its three promises (`?usp=marquee`):
 * the original static strip image, one message at a time rotating every 3s,
 * or a slow scrolling marquee. Rotating by default.
 */
export const USP_STRIP_PARAM = 'usp'
export const USP_STRIP_STYLES = [
  { value: 'rotate',  label: 'Rotating (3s)' },
  { value: 'marquee', label: 'Scrolling marquee' },
  { value: 'static',  label: 'Static strip' },
] as const
export type UspStripStyle = (typeof USP_STRIP_STYLES)[number]['value']

export function readUspStripStyle(params: ReadableParams): UspStripStyle {
  const raw = params.get(USP_STRIP_PARAM)?.toLowerCase()
  return USP_STRIP_STYLES.find(s => s.value === raw)?.value ?? 'rotate'
}
