# Oak and Luna (OAL): Design Language & Tokens

A designer's reference to the OAL theme as it's built today. Every value here comes from the live
code: `styles/themes/oal.css`, the OAL block of `styles/typography-tokens.css` and the shared
tokens in `app/globals.css`. When you design for OAL, use the **token names** below, not raw
values. The developers build with the same names, so a design that uses tokens maps straight
onto the code.

See it live: `/oal` on the prototype (https://sites2026.vercel.app/oal). Useful reference pages:
**Design References → Form Fields** and **Option Categories**.

---

## 1. The OAL look in one paragraph

OAL is **monochrome, sharp and editorial**. It's black on white with almost no color: the jewelry
supplies the color. Corners are square (0px on buttons, fields, chips and ribbons). Big moments use
**Bebas Neue** in condensed uppercase. Everything else is a quiet **Roboto**, and buttons use
**Akatab** bold uppercase. Product imagery is **4:5 portrait** on a plain white ground. Emphasis
comes from weight, case and black fills, never from accent colors or shadows.

**Do**
- Use black (`--colors-text`) for primary actions, selected states, ribbons and the footer.
- Keep corners square. Only panels/drawers (8px) and fully round elements (swatches) are rounded.
- Use uppercase for display headlines, section labels, buttons and nav.
- Use 4:5 portrait crops for product images.
- Separate areas with 1px light-grey borders (`--border-color`) or the warm-white surface, not shadows.

**Don't**
- Introduce new accent colors. Terracotta is reserved for warnings, red for errors and sale prices, green for success.
- Round buttons, fields or chips.
- Use Bebas Neue for body copy or anything below 14px.
- Use raw hex values in a spec. Name the token.

---

## 2. Color

### Semantic tokens (use these)

| Token | Hex | Use |
|---|---|---|
| `--colors-brand-default-primary` | `#000000` | Brand primary |
| `--colors-brand-default-secondary` | `#FFFFFF` | Brand secondary |
| `--colors-background` | `#FFFFFF` | Page background |
| `--colors-surface-primary` | `#F8F8F8` | Tinted sections, selected option fill |
| `--colors-surface-secondary` | `#F8F8F8` | Cards, panels, Share the Love panel |
| `--colors-surface-disabled` | `#EBEBEB` | Disabled backgrounds |
| `--colors-text` | `#000000` | Primary text, icons, focus ring |
| `--colors-text-secondary` | `#707070` | Muted text, helper text, crossed-out price |
| `--colors-text-inverse` | `#FFFFFF` | Text on black |
| `--colors-text-disabled` | `#808080` | Disabled text |
| `--border-color` | `#EBEBEB` | Default 1px dividers and borders |
| `--border-strong` | `#000000` | Emphasised borders, selected tiles |
| `--colors-success` | `#2B8B68` | Success messages |
| `--colors-error` | `#8E0000` | Errors, invalid fields |
| `--colors-warning` | `#CD644C` | Warnings (terracotta) |
| `--colors-price-selling` | `#000000` | Selling price |
| `--colors-price-sale` | `#8E0000` | Marked-down price |
| `--colors-star-filled` | `#000000` | Review stars |
| `--colors-card-image-bg` | `#FFFFFF` | Behind product images |
| `--colors-overlay` | `rgb(0 0 0 / 45%)` | Scrim behind modals and drawers |

### Brand palette (primitives, for reference only)

These are the raw swatches the semantic tokens point to. Specs should name the semantic token.

| Primitive | Hex | Mapped to |
|---|---|---|
| Black | `#000000` | text, primary buttons, ribbons, footer, announcement bar |
| White | `#FFFFFF` | background, inverse text |
| Warm white / off-white | `#F8F8F8` | surfaces |
| Light grey | `#EBEBEB` | borders, disabled surface, category pills |
| Option grey / stone grey | `#CCCCCC` | field borders, unselected option tiles |
| Mid grey | `#9B9B9B` | placeholders, muted footer text |
| Dark grey | `#808080` | disabled text, out-of-stock ribbon |
| Graphite | `#707070` | secondary text |
| Green | `#2B8B68` | success |
| Red | `#8E0000` | error, sale price |
| Terracotta | `#CD644C` | warning |
| Deep blue | `#393781` | *Defined but not used by any token today* |

---

## 3. Typography

**Fonts loaded on the site:** Roboto (300 / 400 / 500 / 700), Bebas Neue, Akatab (400 / 600 / 700),
all from Google Fonts.

| Font role | Token | Font |
|---|---|---|
| Main (regular / bold / light) | `--font-family-main-regular` / `-bold` / `-light` | Roboto |
| Display | `--font-family-secondary-regular` | Bebas Neue |
| Buttons & small caps labels | `--font-family-tertiary-regular` | Akatab |

Type is set in named **scales**. A developer applies a whole scale at once
(`--typography-rules-{scale}-*`), so pick a scale rather than a loose size. Sizes change at
**768px**. Where a desktop value is blank, it's the same as mobile.

### Headlines

| Scale | Font | Weight | Mobile size / line | Desktop size / line | Case | Typical use |
|---|---|---|---|---|---|---|
| headline1 | Bebas Neue | 400 | 80 / 65 | 100 / 90 | UPPER | Hero display |
| headline2 | Bebas Neue | 400 | 72 / 60 | 72 / 72 | UPPER | Page titles |
| headline3 | Bebas Neue | 400 | 52 / 40 | 40 / 38 | UPPER | Large section titles |
| headline4 | Bebas Neue | 400 | 32 / 32 | | UPPER | Section headings, panel/drawer titles |
| headline5 | Roboto | 400 | 20 / 26 | | | Sub-headings |
| headline6 | Roboto | 600 | 16 / 18 | | UPPER | Small labels, nav |
| headline7 | Roboto | 400 | 14 / 18 | | | Small headings |
| headline8 | Akatab | 700 | 14 / 16 | 16 / 18 | UPPER | Eyebrows, small caps labels |
| headline9 | Roboto | 600 | 14 / 20 | 20 / 24 | UPPER | Strong labels |
| headline10 | Roboto | 400 | 14 / 14 | | Capitalize | Tags |
| headline11 | Roboto | 400 | 16 / 22 | 20 / 28 | | Intro lines |
| headline12 | Roboto | 600 | 20 / 26 | | UPPER | Section headings (alt) |

### Body, captions, paragraphs

| Scale | Font | Weight | Mobile | Desktop | Typical use |
|---|---|---|---|---|---|
| text1 | Roboto | 400 | 14 / 18 | | Body, product name, Edit/Remove links |
| text2 | Roboto | 500 | 14 / 18 | | Bold body, selling price, option labels |
| text3 | Roboto | 400 | 12 / 16 | | Small body, captions, helper/error text |
| text4 | Roboto | 600 | 12 / 16 | | Small bold |
| text5 | Roboto | 400 | 12 / 16 | 14 / 18 | Responsive small body |
| text6 | Roboto | 500 | 12 / 16 | 14 / 18 | Responsive small bold |
| text7 | Roboto | 300 | 12 / 16 | 14 / 18 | Light body |
| text8 | Roboto | 400 | 10 / 14 | | Micro text |
| text9 | Roboto | 600 | 10 / 14 | | Micro bold |
| caption1 | Roboto | 400 | 12 / 16 | | Captions, metadata |
| caption2 | Roboto | 600 | 12 / 16 | | Bold captions |
| paragraph1 | Roboto | 400 | 16 / 21 | 20 / 25 | Long-form copy |
| paragraph2 | Roboto | 600 | 16 / 21 | 20 / 25 | Long-form bold |
| paragraph3 | Roboto | 500 | 16 / 21 | | Long-form medium |
| paragraph4 | Roboto | 400 | 16 / 24 | | Airy long-form |
| links1 | Roboto | 400 | 14 / 18 | | Inline links (underlined) |
| disclaimer1 | Roboto | 400 | 10 / 14 | 16 / 14 | Footer fine print |
| disclaimer2 | Roboto | 600 | 10 / 14 | 16 / 14 | Bold fine print |

### Buttons & ribbons

| Scale | Font | Weight | Mobile | Desktop | Case / tracking | Use |
|---|---|---|---|---|---|---|
| button1 | Akatab | 700 | 15 / 17 | | UPPER, 0.4px | Primary, secondary, Add to Bag |
| button2 | Akatab | 700 | 13 / 16 | 14 / 18 | | Small buttons |
| ribbons1 | Bebas Neue | 400 | 14 / 14 | 16 / 16 | 0.4px | Product ribbons, badges |

Letter-spacing is 0 everywhere except button1 and ribbons1.

---

## 4. Spacing & layout

**Spacing scale.** It's shared by all brands, so use only these steps:

| Token | px | | Token | px |
|---|---|---|---|---|
| `--spacing-xxxs` | 4 | | `--spacing-lg` | 32 |
| `--spacing-xxs` | 8 | | `--spacing-xl` | 40 |
| `--spacing-xs` | 12 | | `--spacing-2xl` | 48 |
| `--spacing-sm` | 16 | | `--spacing-xxl` | 60 |
| `--spacing-md` | 24 | | `--spacing-3xl` | 64 |
| | | | `--spacing-xxxl` | 72 |
| | | | `--spacing-4xl` | 96 |

**Layout**

| Token | Value |
|---|---|
| `--layout-page-margin` | 32px desktop, 16px at 1024px and below |
| `--layout-header-height` | 64px |
| `--topline-height` (announcement bar) | 36px |
| `--layout-content-width` | 1200px |
| `--layout-max-width` | 1920px |
| Breakpoints | mobile-first, **768px** (tablet), **1024px** (desktop) |

---

## 5. Shape, depth, motion

| Token | Value | Notes |
|---|---|---|
| `--radius-sm` | 0px | Buttons, fields, ribbons, chips: **OAL is sharp** |
| `--radius-md` | 0px | |
| `--radius-lg` | 4px | Rare, small containers |
| `--radius-xl` | 8px | |
| `--radius-panel` | 8px | Drawers / bottom sheets (leading corners only) |
| `--radius-full` | 9999px | Swatches, round icon buttons |
| `--border-width` | 1px | All borders |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Use sparingly |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Floating panels only |
| `--transition-fast` | 150ms ease | Hover, borders |
| `--transition-base` | 250ms ease | Panels, button fills |

Drawers slide in from the right on desktop and up from the bottom on mobile.

---

## 6. Components

### Buttons

| Variant | Fill | Text | Border | Radius | Padding | Min height | Type |
|---|---|---|---|---|---|---|---|
| Primary | Black | White | none | 0 | 8 × 24 | 44px | button1 |
| Secondary | White | Black | 1px Black | 0 | 8 × 24 | 44px | button1 |
| Upsell | Transparent | Black | 1px Black | 0 | 4 × 8 | 32px | text1 |
| Link | none | Black | none | | | | Roboto, underlined |

Hover darkens the fill slightly (primary mixes 12% toward the text color). Disabled is 70% opacity.

### Form fields

| Property | Token | Value |
|---|---|---|
| Fill | `--form-field-background` | White |
| Border | `--form-field-border-color` | `#CCCCCC` |
| Border, hover | `--form-field-border-color-hover` | Black |
| Radius | `--form-field-border-radius` | 0 |
| Placeholder | `--form-input-placeholder` | `#9B9B9B` |
| Height | `--field-min-height` | 44px |
| Focus ring | `--form-field-focus-ring-*` | 2px black, 1px outside the border |
| Field → message gap | `--form-field-message-gap` | 8px |
| Error | `--colors-error` | `#8E0000` border + text3 message |

Exception: the **footer newsletter field** sits on black, so its border and focus ring are white.

### Product options (swatches, tiles, carousels)

- Unselected tiles, pills and rows: 1px `--form-option-border-color` (`#CCCCCC`).
- Hover: border goes to `#707070` (secondary text) with the `#F8F8F8` surface fill.
- Selected: 1px black border (`--border-strong`), `#F8F8F8` fill (`--colors-surface-secondary`) and
  the label in bold (text2).
- Image-only swatches: no border at rest, plus a black ring just outside the circle when selected.
- Disabled values: secondary text color at 50% opacity.
- Focus: 2px black ring.

### Ribbons & chips

| Ribbon | Fill | Text |
|---|---|---|
| Default / Bundle / Secondary | Black | White |
| Out of stock | `#808080` | White |

Square corners (`--ribbon-border-radius: 0`), set in **ribbons1** (Bebas Neue). Filter chips and
review chips are square too. Related-category pills are light grey (`#EBEBEB`) and flip to
inverse text on hover.

### Chrome

| Area | Background | Text |
|---|---|---|
| Announcement bar | Black | White |
| Header | White | Black, nav uppercase |
| Footer (main + newsletter) | Black | White, muted links `#9B9B9B` |

### Imagery

- Product images: **4:5 portrait**. That covers cards, the product page gallery, quick add and
  featured category cards. Square is an opt-in exception.
- White image ground (`--colors-card-image-bg`), with no blend or tint over product shots.

---

## 7. Icons

OAL has its own icon set (in `src/components/icons/oal/`). Icons are single-color (they inherit the
text color) and sized from the spacing scale: **12** inline with small text, **16** with body text,
**24** for standalone actions.

Available icons: AiMagic, AiSparkle, Arrow, Birthday, BulletList, Camera, Checkbox, Checkmark,
Chevron, ClipboardCopy, Coupon, DeliveryBox, Dropdown, Envelope, Eye, Facebook, FileUpload, Filter,
Gift, Google, GridDouble, GridSingle, GridTriple, Hamburger, Key, Lock, Logout, MagnifyingGlass,
MapPin, MeasureChart, MeasuringTape, ModelView, MultiView, PaperFree, Pause, Person, Play,
PlusMinus, ProductView, Resize, Return, Ring, Rotate, Shipping, ShoppingBag, SingleView, Sms,
SpinningCircle, Star, TintedSparkle, Tooltip, TooltipOutline, TrashCan, UiBouncingDots, Warning,
WarningTriangle, Warranty, X, ZoomIn, ZoomOut.

**A new icon has to exist for all five brands** before it can ship. Flag any new icon to the
design-system owner rather than drawing an OAL-only one.

---

## 8. Shared across brands (don't change for OAL alone)

These tokens are the same in every brand. Changing one affects all five sites:
- The spacing scale
- Z-index layers
- Breakpoints
- The focus ring rule
- Material swatch colors: Sterling Silver `#CBCBCB`, 18k Gold Vermeil `#E2C385`, 14k/10k Solid Gold `#DBC883`,
  14k/10k White Gold `#E7E7E7`, Rose Gold `#F1D4CE`

---

## 9. Open questions

- **Body font.** Older docs list Helvetica Neue or Inter for OAL. The live site loads and renders
  **Roboto**. Confirm which one is intended before any new font work.
- **Deep blue `#393781`** is in the palette but not used anywhere. Keep it, assign it, or drop it?
- `design-references/oal.css` is an **older copy** of the theme: its warm white is `#F9F8F5`
  and its footer is white. The live theme is `styles/themes/oal.css`, which is what this document
  reflects.
