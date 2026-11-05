# PDP templates: mockup schema → Catalog 2.0

**Status:** draft, 2026-11-04. Owner: Talia. The schema lives in `app/[brand]/product/_templates/pdpTemplate.ts`; four templates in `_templates/templates/`.

## What Catalog 2.0 stores today

From `site-experience-manager/frontend/src/shared/api/productPresentation/types.ts` (develop):

```ts
Presentation { schemaVersion: number; enabled?: boolean; editor: EditorPresentation }
EditorPresentation { galleryDisplay: 'default' | 'sideScroll'; steps: PresentationStep[] }
PresentationStep { label: string; fieldIds: number[] }          // global catalog field ids, max 4 steps
SkuField { fieldId, name, cartName, type, displayType, order, isRequired, isActive, textMinLength, textMaxLength, optionCount }
```

Fields come from `site-products-service`. The presentation only *places* them into steps and picks a gallery. Presets copy a presentation into a SKU; nothing is linked.

## How the mockup schema maps

| Mockup (`PdpTemplate`) | Catalog 2.0 | Notes |
|---|---|---|
| `schemaVersion`, `enabled` | `Presentation.schemaVersion`, `.enabled` | Same. |
| `steps[].label`, `.fieldIds` | `PresentationStep` | Same. `hint` is new. |
| `gallery.desktop` | `editor.galleryDisplay` | Same field, two more values (`stickyHero`, `grid`). |
| `fields[]` first block | `SkuField` | Same names and types. |
| `fields[].displayType` → UI | `ProductFieldDisplayType` | `DISPLAY_TYPE_TO_OPTION_DISPLAY` translates to the mockup's ProductOptions. |
| `sku` | the SKU key | Per-SKU, per-site, as decided. |

## Gaps: what the BOS would need to add

Ordered by how much the three new PDPs depend on them.

1. **Live preview** (`livePreview`). Enabled flag, engine (`placeholder` / `external` + endpoint), gallery placement (`first` / `replaceHero`), ribbon, disclaimer. Catalog 2.0 has no notion of a preview at all. The `placeholder` spec (base image per field value, text boxes, overlays) is mockup-only; in production the engine owns rendering and the BOS stores only `{ engine, endpoint, placement }`.
2. **Flow** (`flow`). Step container per viewport (`inline` / `card` / `panel`), entry fields + entry CTA, completion (`addToBag` / `summary`), next-step CTA pattern, sticky bar. Today the BOS knows steps exist but not how they are entered or shown. MM needs all of these.
3. **Field pricing role** (`pricing: 'base' | 'delta' | 'none'`). Decides which fields a two-step flow keeps on the page (price-setting) and which go in the panel. Probably derivable from catalog pricing data; the page needs it either way.
4. **`affectsPreview`** per field. Lets the page skip re-rendering on chain length.
5. **Repeat** (`repeat: { countFieldId, min, max }`). Multi-name: one name field per unit of the count field. Today the catalog likely models this as five separate fields; the page needs to know they are one repeated field so the preview can stack them.
6. **Derived** (`derivedFrom`) and **conditional visibility** (`visibleWhen`). "4 diamonds" from "5 names"; frame color only for canvas; diamond size only with a diamond.
7. **Per-viewport gallery** (`gallery.mobile`). Mobile is always the carousel in the mockup, so this can stay implicit for now.
8. **Field decorations**: `helpLink`, `note`, `tooltip`, value `hint`. Cosmetic, but the live TGR page uses all of them.
9. **Addons**. The MM slipmat. May already exist as nested products elsewhere in the BOS.

## The four templates

| Template | Steps | Container (desktop / mobile) | Preview inputs | Gallery |
|---|---|---|---|---|
| `lal-music-memories` (shipped) | 2: Personalize, Frame Options | card / panel, entry CTA "See how it looks", summary before Add to bag | song, memory, names, center color, frame | sideScroll |
| `tgr-classic-name` | 1 | inline / inline | metal, name | grid |
| `tgr-heritage-multi-name` | 2: Design, Names | card / panel | metal, diamond size, 2–5 names | grid |
| `oal-inez` | 2: Metal & Diamond, Personalize | card / panel | metal, diamond on/off + size, heart color, initial | stickyHero |

The single-step and two-step pages render from the same components; only `steps.length` and `flow.container` differ. That is the demo for the BOS.

## Open items

- Preview engine: placeholder in the mockup until the real engine is known. The `external` branch fakes latency so loading states can be reviewed.
- Real SKUs, prices and max lengths for Classic Cocktail and Inez (Heritage values are from the live PDP, Nov 2026).
- Whether `dnd` (drag-and-drop ordering) needs a mockup component. Not used by these four.
- Where `pricing` should come from in production: catalog field metadata, or a presentation-level override.
