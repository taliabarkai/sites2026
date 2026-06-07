# Tenengroup Sites — Design System

This is a multi-brand design system built in Next.js (App Router) with Tailwind CSS and CSS
custom properties. It houses the UI for all 5 Tenengroup brands in a single project, each
with its own theme.

---

## Brands

| Key   | Brand Name              |
|-------|-------------------------|
| `oal` | Oak and Luna            |
| `tgr` | Theo Grace              |
| `lal` | Lime and Lou            |
| `ib`  | Israel Blessing         |
| `mnn` | MYKA (My Name Necklace) |

---

## Project Structure

```
app/
├── [brand]/                        # Dynamic brand segment (oal | tgr | lal | ib | mnn)
│   ├── layout.tsx                  # Reads brand from params, sets data-theme
│   ├── page.tsx                    # Homepage — one file, all brands
│   ├── category/page.tsx           # Category / PLP — one file, all brands
│   ├── checkout/
│   │   ├── page.tsx                # Payment page — one file, all brands
│   │   └── confirmation/page.tsx
│   └── _components/                # Shared components — themed via CSS vars
│       ├── header/
│       ├── footer/
│       ├── cart/
│       └── icons/
│           └── Icons.tsx           # Universal UI icons (Close, ChevronDown, etc.)
└── styleguide/                     # Design system styleguide / token viewer

src/
├── components/
│   └── icons/
│       ├── oal/                    # ~50 brand-scoped SVG icon components
│       ├── tgr/
│       ├── lal/
│       ├── ib/
│       ├── mnn/
│       └── index.ts                # Namespaced re-exports
└── assets/
    └── icons/
        ├── oal/                    # Raw SVG source files
        ├── tgr/
        ├── lal/
        ├── ib/
        └── mnn/

styles/
├── design-tokens.ts                # Typed TypeScript token exports (source of truth)
├── typography.ts                   # TypographyScale map
└── themes/
    ├── oal.css
    ├── tgr.css
    ├── lal.css
    ├── ib.css
    └── mnn.css

design-references/
├── typography-tokens.css           # Typography token definitions — all 5 brands
└── typography-reference.md        # Scale lookup table + font family map

fonts/                              # Local font files
tokens.json                         # Raw design tokens extracted from Figma
```

---

## Theme System

### How it works
Each brand has a CSS file in `styles/themes/` that defines semantic CSS custom properties
scoped to `[data-theme="brand"]`. The `[brand]/layout.tsx` reads the brand from URL params
and sets `data-theme` dynamically — **one set of pages and components serves all 5 brands**.

Navigate to `/oal/checkout` → OAL theme. `/tgr/checkout` → TGR theme. Components never
need to know which brand they are rendering for.

```tsx
// app/[brand]/layout.tsx
const VALID_BRANDS = ['oal', 'tgr', 'lal', 'ib', 'mnn']

export default function BrandLayout({ children, params }) {
  const brand = VALID_BRANDS.includes(params.brand) ? params.brand : 'oal'
  return <div data-theme={brand}>{children}</div>
}
```

### Semantic vs primitive — always use semantic

```css
/* ✅ Correct — semantic, works across all brands */
color: var(--colors-text);
background: var(--colors-surface-primary);
border-color: var(--border-color);

/* ❌ Wrong — primitive, breaks other themes */
color: var(--oal-black);
background: #f9f8f5;

/* ❌ Wrong — old naming, no longer exists */
color: var(--text);
background: var(--surface-primary);
```

---

## Semantic Variable Reference

Use only these variables in components. Never use primitive variables
(e.g. `--oal-black`) outside of theme CSS files.

### Brand
- `--colors-brand-default-primary` — primary brand color
- `--colors-brand-default-secondary` — secondary brand color

### Surfaces
- `--colors-background` — base page background (white for all brands)
- `--colors-surface-primary` — main surface (warm white, light grey, etc.)
- `--colors-surface-secondary` — secondary surface (cards, panels)
- `--colors-surface-disabled` — disabled state background

### Text
- `--colors-text` — primary text
- `--colors-text-secondary` — muted / secondary text
- `--colors-text-inverse` — text on dark backgrounds
- `--colors-text-disabled` — disabled state text

### Borders
- `--border-color` — default border
- `--border-width` — default border width (1px)
- `--border-strong` — emphasized border

### Status
- `--colors-success`
- `--colors-error`
- `--colors-warning`

### Price
- `--colors-price-selling` — selling price text color (varies per brand — MNN/LAL use red)
- Crossed-out price → use `--colors-text-secondary`
- Discount badge bg → use `--colors-surface-primary`
- Discount badge text → use `--colors-text`

### Cards
- `--colors-card-image-bg` — product image background per brand

### Buttons — full token set per variant
Pattern: `--buttons-{variant}-{property}`

Variants: `primary` · `secondary` · `upsell-primary` · `upsell-secondary`

Properties per variant:
- `--buttons-{variant}-background`
- `--buttons-{variant}-text`
- `--buttons-{variant}-border-color`
- `--buttons-{variant}-border-radius`
- `--buttons-{variant}-padding`
- `--buttons-{variant}-min-height`
- `--buttons-{variant}-font-size`
- `--buttons-{variant}-line-height`
- `--buttons-{variant}-font-weight`
- `--buttons-{variant}-letter-spacing`
- `--buttons-{variant}-text-transform`

### Form fields
- `--form-field-background`
- `--form-field-border-color`
- `--form-field-border-color-hover`
- `--form-field-border-radius`
- `--form-input-placeholder`
- `--field-min-height`

### Footer
- `--footer-main-background`
- `--footer-newsletter-background`
- `--footer-newsletter-text`
- `--footer-text`
- `--footer-text-muted`

### Announcement bar
- `--layout-announcements-bar-background`
- `--layout-announcements-bar-text`

### Ribbon
- `--ribbon-background` / `--ribbon-text` — default ribbon
- `--ribbon-bundle-background` / `--ribbon-bundle-text`
- `--ribbon-oos-background` / `--ribbon-oos-text`
- `--ribbon-secondary-background` / `--ribbon-secondary-text`
- `--ribbon-border-radius`

### Spacing — shared, never overridden per brand
Defined in `globals.css` via `--spacing-base: 1.6rem` calc scale:
- `--spacing-xxxs` (4px) · `--spacing-xxs` (8px) · `--spacing-xs` (12px)
- `--spacing-sm` (16px) · `--spacing-md` (24px) · `--spacing-lg` (32px)
- `--spacing-xl` (40px) · `--spacing-xxl` (60px) · `--spacing-xxxl` (72px)

### Layout
- `--layout-page-margin`
- `--layout-container-narrow` / `--layout-container-wide`
- `--layout-header-height`
- `--layout-announcements-bar-min-height`
- `--sticky-top` — calculated offset for `position: sticky` elements

### Border radius — varies per brand personality
- `--radius-sm` · `--radius-md` · `--radius-lg` · `--radius-xl` · `--radius-full`
- `--radius-panel`

### Shadows
- `--shadow-sm` · `--shadow-md`

### Transitions
- `--transition-fast` — 150ms ease
- `--transition-base` — 250ms ease

### Z-index layers — shared, never overridden per brand
Always use these tokens — never write a raw z-index number in a component.

- `--z-base: 0` — normal document flow
- `--z-raised: 10` — hover states, card overlays
- `--z-sticky: 100` — sticky page elements (add-to-cart bar)
- `--z-header: 200` — site header + announcement bar
- `--z-cart: 300` — floating cart panel
- `--z-overlay: 400` — modal backdrop
- `--z-modal: 500` — modal / dialog
- `--z-toast: 600` — toast notifications
- `--z-tooltip: 700` — tooltips (always topmost)

### Material / swatch colors — shared across all brands
Used for product color swatches. Defined in `globals.css`:
- `--gold-vermeil-18k` · `--gold-plating-18k` · `--solid-gold-14k`
- `--rose-gold-14k` · `--white-gold-14k` · `--sterling-silver-925`
- (see globals.css for full list)

### TypeScript tokens
For JS/TS logic that needs token values:
```ts
import { colors, typography, spacing, radii } from '@/styles/design-tokens'
```
Never import `tokens.json` directly.

---

## Typography

All typography must use `--typography-rules-{scale}-{property}` CSS variables.
**Never hardcode** font-size, font-family, font-weight, line-height, letter-spacing,
or text-transform anywhere — not in components, modules, or inline styles.

**Token pattern:** `var(--typography-rules-{scale}-{property})`

**Available scales:** headline1–12 · text1–9 · caption1–2 · paragraph1–4 ·
links1 · button1–2 · disclaimer1–2 · ribbons1

**Usage in CSS Modules:**
```css
.element {
  font-family:    var(--typography-rules-text1-font-family);
  font-size:      var(--typography-rules-text1-font-size);
  line-height:    var(--typography-rules-text1-line-height);
  letter-spacing: var(--typography-rules-text1-letter-spacing, normal);
  text-transform: var(--typography-rules-text1-text-transform, none);
  font-weight:    var(--typography-rules-text1-font-weight, normal);
}
```

**Scale guidance:**
| UI element | Scale |
|------------|-------|
| Display / page title | `headline1` / `headline2` |
| Section headings | `headline4` / `headline12` |
| Panel / drawer title | `headline4` |
| Small uppercase label / nav | `headline6` / `headline8` |
| Product name | `text1` |
| Selling price | `text2` |
| Crossed-out price | `text1` + `text-decoration: line-through` + `--colors-text-secondary` |
| Body / regular text | `text1` (regular) / `text2` (bold) / `text7` (light) |
| Small body | `text3` (regular) / `text4` (bold) |
| View Details toggle | `text2` |
| Edit / Remove links | `text1` + underline |
| Long-form paragraph | `paragraph1`–`paragraph4` |
| Inline links | `links1` |
| Announcement / topline bar | `ribbons1` |
| Footer fine print | `disclaimer1` |
| Captions / metadata | `caption1` / `text3` |

**Buttons — typography rules by variant:**

Most variants use `--buttons-{variant}-*` tokens for all typography:
```css
font-family:    var(--buttons-primary-font-family);
font-size:      var(--buttons-primary-font-size);
line-height:    var(--buttons-primary-line-height);
font-weight:    var(--buttons-primary-font-weight);
letter-spacing: var(--buttons-primary-letter-spacing, normal);
text-transform: var(--buttons-primary-text-transform, none);
```

**Exception — `upsell-primary`, `upsell-secondary`, and `link` variants use `--typography-rules-text1-*`**
not `--buttons-{variant}-*`. This is intentional — these variants are visually closer
to body text than button labels (smaller, lighter, no uppercase):
```css
font-family:    var(--typography-rules-text1-font-family);
font-size:      var(--typography-rules-text1-font-size);
line-height:    var(--typography-rules-text1-line-height);
letter-spacing: var(--typography-rules-text1-letter-spacing, normal);
font-weight:    var(--typography-rules-text1-font-weight, normal);
```

**Font family variables** — never hardcode font names:

| Variable | OAL | MNN | LAL | IB | TGR |
|----------|-----|-----|-----|-----|-----|
| `--font-family-main-regular` | Helvetica Neue 300 | AnoRegular | Poppins 400 | Assistant 400 | Lato 400 |
| `--font-family-main-bold` | Helvetica Neue 500 | AnoBold | Poppins 600 | Assistant 600 | Lato 700 |
| `--font-family-main-light` | Helvetica Neue 200 | AnoHalf | Poppins 300 | Assistant 300 | Lato 300 |
| `--font-family-secondary-regular` | Bebas Neue | — | — | — | Big Caslon |
| `--font-family-tertiary-regular` | Akatab | — | — | — | — |

> OAL only: `--font-family-tertiary-regular` applies to `headline8`, `button1`, `button2`.
> OAL requires Typekit in layout.tsx: `<link rel="stylesheet" href="https://use.typekit.net/vle4ewv.css" />`
> MNN Ano fonts load via `@font-face` in `globals.css` — no external CDN needed.

**How it works:**
- Token values defined per brand in `design-references/typography-tokens.css`
- Selectors use `[data-theme="brand"]` — NOT `:root[data-theme]`
- Imported via `app/globals.css`
- `html { font-size: 62.5% }` sets rem base: `1rem = 10px`

Reference: `design-references/typography-tokens.css`
Quick lookup: `design-references/typography-reference.md`

When unsure which scale to use for a new element, check the reference or ask.

---

## Icon System

All icons are brand-scoped. There are no universal icons — every icon must exist
in all 5 brand folders. Never create a shared/universal icon component.

### How to use icons — `src/components/icons/{brand}/`
~50 named SVG components per brand. Always resolve at runtime via `BRAND_ICONS[brand]`.

```tsx
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons
} as const

const { GiftIcon, ChevronIcon, TrashIcon } = BRAND_ICONS[brand]
```

### Rules
- **Never import a single brand's icon folder directly** inside a shared component — always use `BRAND_ICONS[brand]`
- **Never create a universal/shared icon component** — all icons are brand-scoped
- **Never use one brand's icon in another brand's component** — e.g. hardcoding `tgrIcons.PlusMinusIcon` or any `{brand}Icons.{Icon}` directly is forbidden
- **Every icon must exist in all 5 brand folders** — before using any icon, verify it exists across all 5 brands
- **If an icon is missing from any brand, stop and ask** — do not proceed, do not create a fallback, do not substitute another brand's version
- Icon components use `currentColor` — control size and color from the parent
- Never hardcode `fill`, `stroke`, `width`, or `height` inside icon components

### Adding a new icon
When a new icon is needed that doesn't exist in all 5 brands:
1. Stop immediately
2. Ask: "I need `{IconName}` — it is missing from [list of brands]. Can you add the SVG to those brand folders before I proceed?"
3. Wait for confirmation before writing any code that references it

**Never do this:**
```tsx
// ❌ Wrong — using one brand's icon for all brands
const { PlusMinusIcon } = tgrIcons  // hardcoded brand
<Button PlusMinusIcon={tgrIcons.PlusMinusIcon} />  // override hack
```

**Always do this:**
```tsx
// ✅ Correct — each brand provides its own icon
const { PlusMinusIcon } = BRAND_ICONS[brand]
```
If `BRAND_ICONS[brand].PlusMinusIcon` doesn't exist for some brands — stop and ask the user to add it. Do not work around it.

### Icon sizing — always use spacing tokens
```tsx
<GiftIcon style={{ width: 'var(--spacing-md)', height: 'var(--spacing-md)' }} />
```

| Token | Size | Use case |
|-------|------|----------|
| `--spacing-xs` | 12px | Inline with small text |
| `--spacing-sm` | 16px | Inline with body text |
| `--spacing-md` | 24px | Standalone action icons |

### Before building any new component
Always run this check first and wait for confirmation:
> "List `src/components/icons/{oal,tgr,lal,ib,mnn}/index.ts` and confirm every icon
> I need exists in all 5 brand folders."

If any icon is missing from any brand — stop and ask. Never proceed without all 5.

---

## Building a New Page

1. Create `app/[brand]/page-name/page.tsx` — one file, works for all brands
2. Use Tailwind for layout and spacing structure
3. Use `--typography-rules-*` for all text styling — never hardcode
4. Use `--colors-*` variables for all colors — never hardcode
5. Use `--z-*` tokens for any z-index — never hardcode
6. Build mobile-first — `md:` = 768px, `lg:` = 1024px
7. Use realistic placeholder content — never Lorem ipsum

```tsx
<section className="flex flex-col gap-4 px-4 md:px-8">
  <h1
    style={{
      color:         'var(--colors-text)',
      fontFamily:    'var(--typography-rules-headline2-font-family)',
      fontSize:      'var(--typography-rules-headline2-font-size)',
      lineHeight:    'var(--typography-rules-headline2-line-height)',
      letterSpacing: 'var(--typography-rules-headline2-letter-spacing, normal)',
      textTransform: 'var(--typography-rules-headline2-text-transform, none)',
    }}
  >
    Page Title
  </h1>
</section>
```

---

## Building a New Component

All components live in `app/[brand]/_components/` — shared across every brand,
themed automatically via CSS variables.

```
_components/
└── ComponentName/
    ├── ComponentName.tsx
    ├── ComponentName.module.css
    └── index.ts
```

**Styling rules:**
- Tailwind → layout, spacing, structure
- CSS variables → all colors, typography, brand values, z-index
- CSS Modules → complex or dynamic styles
- Never hardcode colors, fonts, or z-index values anywhere

**Button example — correct pattern:**
```tsx
export function Button({ label, variant = 'primary', onClick, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center"
      style={{
        background:    `var(--buttons-${variant}-background)`,
        color:         `var(--buttons-${variant}-text)`,
        border:        `var(--border-width) solid var(--buttons-${variant}-border-color)`,
        borderRadius:  `var(--buttons-${variant}-border-radius)`,
        padding:       `var(--buttons-${variant}-padding)`,
        minHeight:     `var(--buttons-${variant}-min-height)`,
        fontFamily:    `var(--buttons-${variant}-font-family, var(--font-family-main-bold))`,
        fontSize:      `var(--buttons-${variant}-font-size)`,
        lineHeight:    `var(--buttons-${variant}-line-height)`,
        fontWeight:    `var(--buttons-${variant}-font-weight)`,
        letterSpacing: `var(--buttons-${variant}-letter-spacing, normal)`,
        textTransform: `var(--buttons-${variant}-text-transform, none)`,
        transition:    'var(--transition-base)',
      }}
    >
      {label}
    </button>
  )
}
```

---

## Adding a New Brand Theme

1. Create `styles/themes/[brand].css` — primitives block first, then semantic tokens using those primitives. No raw hex values in semantic tokens.
2. Add brand icon folder at `src/components/icons/[brand]/` with matching icon names
3. Import the new theme CSS in `app/[brand]/layout.tsx`
4. Add the brand key to `VALID_BRANDS` in `app/[brand]/layout.tsx`
5. All existing pages automatically work for the new brand

---

## Panel / Drawer Animation — Standard Pattern

All slide-in panels (FloatingCart, QuickAddPanel, filter panel, or any future drawer)
**must follow the FloatingCart animation pattern exactly**:

```css
/* Always-in-DOM: panel is never unmounted — CSS transform drives show/hide */
.panel {
  transform: translateX(100%);           /* off-screen right (desktop) */
  transition: transform var(--transition-base);
  border-radius: var(--radius-panel) 0 0 var(--radius-panel);
}
.panelOpen { transform: translateX(0); }

/* Mobile variant — slides up from bottom */
@media (max-width: 767px) {
  .panel { transform: translateY(100%); border-radius: var(--radius-panel) var(--radius-panel) 0 0; }
  .panelOpen { transform: translateY(0); }
}
```

**Why this matters:** if you conditionally render the panel (`if (!open) return null`), the
component mounts at its final position with no prior transform to transition FROM — so the
animation is skipped entirely. Always keep the panel in the DOM and toggle a CSS class.

---

## Hard Rules — Never Break These

- **Never hardcode** colors, fonts, spacing, or z-index — always `var(--token-name)`
- **Never use old variable names** — `--text`, `--surface-primary`, `--border-default`, `--formfield-*`, `--announcement-*`, `--brand-default-primary` no longer exist
- **Never use** `--font-family-heading` or `--font-family-body` — use `--font-family-main-regular/bold/light`, `--font-family-secondary-regular`, `--font-family-tertiary-regular`
- **Never apply typography** without the full `--typography-rules-{scale}-*` variable set
- **Never use raw hex values** in semantic token blocks — define a primitive first
- **Never use primitive variables** (e.g. `--oal-black`) outside of theme CSS files
- **Never use a raw z-index number** — always use `--z-*` tokens
- **Always verify icons** exist in all 5 brand folders before using in a component — if any brand is missing an icon, stop and ask
- **Never create universal/shared icon components** — all icons are brand-scoped and must exist in every brand folder
- **Never use one brand's icon in another brand's component** — never hardcode `{brand}Icons.{Icon}` directly; always use `BRAND_ICONS[brand].{Icon}`
- **Always use semantic variable names** so components work across all 5 brands
- **Never modify** `tokens.json` or `design-tokens.ts` — generated from Figma
- **Never install new dependencies** without checking `package.json` first
- **Always build mobile-first** — mobile layout first, then add breakpoints
- **Stop and ask** if a required token, component, icon, or design reference is missing