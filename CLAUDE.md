# Tenengroup Sites — Design System

This is a multi-brand design system built in Next.js (App Router) with Tailwind CSS and CSS custom properties. It houses the UI for all 5 Tenengroup brands in a single project, each with its own theme.

---

## Brands

| Key | Brand Name |
|-----|------------|
| `oal` | Oak and Luna |
| `tgr` | Theo Grace |
| `lal` | Lime and Lou |
| `ib` | Israel Blessing |
| `mnn` | MYKA (My Name Necklace) |

---

## Project Structure

```
app/
├── [brand]/                    # Dynamic brand segment (oal | tgr | lal | ib | mnn)
│   ├── layout.tsx              # Reads brand from params, sets data-theme, imports theme CSS
│   ├── page.tsx                # Homepage — one file, all brands
│   ├── category/
│   │   └── page.tsx            # Category / PLP — one file, all brands
│   ├── checkout/
│   │   ├── page.tsx            # Payment page — one file, all brands
│   │   └── confirmation/
│   │       └── page.tsx        # Order confirmation — one file, all brands
│   └── _components/            # Shared components (same for all brands, themed via CSS vars)
│       ├── header/
│       ├── footer/
│       └── cart/
└── styleguide/                 # Design system styleguide / token viewer

styles/
├── design-tokens.ts            # Typed TypeScript token exports (source of truth)
└── themes/
    ├── oal.css                 # OAL semantic CSS variables
    ├── tgr.css                 # TGR semantic CSS variables
    ├── lal.css                 # LAL semantic CSS variables
    ├── ib.css                  # IB semantic CSS variables
    └── mnn.css                 # MNN semantic CSS variables

fonts/                          # Local font files
tokens.json                     # Raw design tokens extracted from Figma
```

---

## Theme System

### How it works
Each brand has a CSS file in `styles/themes/` that defines semantic CSS custom properties
scoped to a `[data-theme="brand"]` selector. The `[brand]` layout file reads the brand
from the URL params and sets `data-theme` dynamically on the root element, which activates
the correct theme for all components underneath it.

This means **one set of pages serves all 5 brands** — navigate to `/oal/checkout` for OAL,
`/tgr/checkout` for TGR. Components never need to know which brand they're rendering for.

### Semantic variable naming
Always use semantic variable names in components. Never use primitive variable names (prefixed with the brand, e.g. `--oal-deep-blue`) outside of the theme CSS file itself.

```css
/* ✅ Correct — semantic */
color: var(--text);
background: var(--surface-primary);
border-color: var(--border-default);

/* ❌ Wrong — primitive, not portable across themes */
color: var(--oal-black);
background: #f9f8f5;
```

### Available semantic variables
Every theme defines these variables. Use them and only them in components:

**Brand**
- `--brand-default-primary` — primary brand color
- `--brand-default-secondary` — secondary/accent brand color

**Surfaces**
- `--surface-primary` — main page background
- `--surface-secondary` — secondary surface (cards, panels)

**Text**
- `--text` — primary text
- `--text-secondary` — muted/secondary text
- `--text-inverse` — text on dark backgrounds
- `--text-disabled` — disabled state text

**Borders**
- `--border-default` — default border color
- `--border-strong` — emphasized border

**Footer**
- `--footer-main-background`
- `--footer-newsletter-background`
- `--footer-newsletter-text`

**Form fields**
- `--formfield-background`
- `--formfield-border`
- `--formfield-placeholder`

**Announcement / Topline bar**
- `--announcement-background`
- `--announcement-text`

**Ribbon**
- `--ribbon-background`
- `--ribbon-text`

**Typography**
- `--font-family-heading`
- `--font-family-body`

**Spacing** (shared across all themes, never overridden)
- `--spacing-xxxs` through `--spacing-4xl`

**Layout**
- `--layout-max-width`
- `--layout-content-width`
- `--layout-page-margin`
- `--layout-header-height`
- `--field-min-height`

**Border radius** (varies per brand personality)
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`

**Shadows**
- `--shadow-sm`, `--shadow-md`

**Transitions**
- `--transition-fast` — 150ms ease
- `--transition-base` — 250ms ease

### TypeScript tokens
For any logic that needs token values (e.g. JS animations, dynamic styles), import from `styles/design-tokens.ts`:

```ts
import { colors, typography, spacing, radii } from '@/styles/design-tokens'
```

Do not import `tokens.json` directly — always use the typed exports from `design-tokens.ts`.

---

## How to Build a New Page

### 1. Create the page file
Place it under the dynamic brand folder — one file serves all brands:
```
app/[brand]/page-name/page.tsx
```

### The brand layout — how theming is applied
The `app/[brand]/layout.tsx` reads the brand from URL params and sets `data-theme` dynamically:

```tsx
// app/[brand]/layout.tsx
import '../../../styles/themes/oal.css'
import '../../../styles/themes/tgr.css'
import '../../../styles/themes/lal.css'
import '../../../styles/themes/ib.css'
import '../../../styles/themes/mnn.css'

const VALID_BRANDS = ['oal', 'tgr', 'lal', 'ib', 'mnn']

export default function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { brand: string }
}) {
  const brand = VALID_BRANDS.includes(params.brand) ? params.brand : 'oal'

  return (
    <div data-theme={brand}>
      {children}
    </div>
  )
}
```

Navigate to `/oal/checkout` → OAL theme. `/tgr/checkout` → TGR theme. Same page, same components.

### 2. Use Tailwind for layout and spacing
Use Tailwind utility classes for structural layout (flexbox, grid, padding, margin, width). Use spacing tokens via CSS variables for brand-consistent spacing where needed.

```tsx
<section className="flex flex-col gap-4 px-4 md:px-8">
```

### 3. Use CSS variables for all brand values
Never hardcode colors, fonts, or brand-specific values. Always reference CSS variables:

```tsx
<h1 style={{ color: 'var(--text)', fontFamily: 'var(--font-family-heading)' }}>
  Page Title
</h1>
```

Or in a CSS Module:
```css
.title {
  color: var(--text);
  font-family: var(--font-family-heading);
}
```

### 4. Make it responsive
- Mobile first
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Key breakpoints: `md` = 768px (tablet), `lg` = 1024px (desktop)

### 5. Use placeholder data for content
If real API data isn't available yet, use realistic placeholder content (real product names, real-looking prices, sensible copy). Never use "Lorem ipsum".

---

## How to Build a New Component

### Placement
Since all brands share the same pages, all components live in one place:
- `app/[brand]/_components/` — all components, shared across every brand
- Components are themed automatically via CSS variables — no brand-specific component folders needed

### Structure
Each component gets its own folder:
```
_components/
└── ComponentName/
    ├── ComponentName.tsx
    ├── ComponentName.module.css   (if styles are complex)
    └── index.ts                   (re-export)
```

### Styling rules
- Use Tailwind for layout, spacing, and structural styles
- Use CSS variables for all color, typography, and brand values
- Use CSS Modules (`.module.css`) for complex or dynamic styles
- Never use inline style objects for colors or fonts unless passing a CSS variable value

### Component example
```tsx
// app/oal/_components/Button/Button.tsx

interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
}

export function Button({ label, variant = 'primary', onClick, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 text-sm font-medium transition-colors"
      style={{
        background: variant === 'primary'
          ? 'var(--brand-default-primary)'
          : 'transparent',
        color: variant === 'primary'
          ? 'var(--text-inverse)'
          : 'var(--brand-default-primary)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid var(--brand-default-primary)`,
        transition: 'var(--transition-base)',
      }}
    >
      {label}
    </button>
  )
}
```

---

## Adding a New Brand Theme

Since pages are shared, adding a new brand only requires:

1. Create `styles/themes/[brand].css` — same structure as `oal.css`, scoped to `[data-theme="[brand]"]`
2. Import the new theme CSS in `app/[brand]/layout.tsx`
3. Add the brand key to the `VALID_BRANDS` array in `app/[brand]/layout.tsx`
4. All existing pages automatically work for the new brand — no page or component changes needed

---

## Rules — Always Follow These

- **Never hardcode colors, fonts, or spacing** — always use `var(--token-name)`
- **Never modify** `tokens.json` or `design-tokens.ts` directly — these are generated from Figma
- **Never use primitive CSS variables** (e.g. `--oal-deep-blue`) outside of theme CSS files
- **Always use semantic variable names** so components work across all 5 brands
- **Never install new dependencies** without checking `package.json` first
- **Always build mobile-first** — start with the mobile layout, then add breakpoints
- **Stop and ask** if a required token, component, or design reference is missing
