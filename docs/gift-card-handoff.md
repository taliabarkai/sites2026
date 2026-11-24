# Digital Gift Card page: design handoff (OAL)

**Status:** ready to build, 2026-11-12. Owner: Talia.
**Live prototype:** https://sites2026.vercel.app/oal/gift-card (built from `main`).
**Source of truth in this repo:**

| File | What it holds |
|---|---|
| `app/[brand]/gift-card/GiftCardPageClient.tsx` | Page structure, steps, state, validation, cart payload |
| `app/[brand]/gift-card/GiftCardPage.module.css` | Every layout rule and measurement below |
| `app/[brand]/_config/giftCardContent.ts` | Designs, amounts, limits, per-brand images |
| `styles/themes/oal.css`, `styles/typography-tokens.css` | OAL token values |

Everything on the page is styled with the design-system tokens. The tables below give the **token name first** (build with these) and the **OAL value** (what it resolves to today). Never hard-code the values: the same page serves all five brands.

---

## 1. Page anatomy

```
Header (existing)
┌──────────────────────────────┬──────────────────────────────┐
│                              │ CREATE YOUR DIGITAL GIFT CARD│
│   GALLERY (sticky)           │ Pick a Card                  │
│   selected card mockup,      │ Choose an Amount             │
│   or the uploaded photo      │ How Would You Like to Send It?│
│   on a tilted card           │ Who's This For?              │
│                  [⊕][⊖][↻]   │ What's Their Email?   (Email)│
│                              │ What's Their Phone Number? (SMS)│
│                              │ Add Personal Message         │
│                              │ [ ADD TO BAG ]               │
└──────────────────────────────┴──────────────────────────────┘
Footer (existing) + floating cart
```

Mobile stacks in DOM order: **title → gallery → form**. Desktop puts the gallery on the left; the title sits on top of the form column.

## 2. Layout and breakpoints

Breakpoints: mobile-first, `md` = 768px, `lg` = 1024px.

| Area | Mobile (<768) | Tablet (768–1023) | Desktop (≥1024) |
|---|---|---|---|
| Grid | one column | one column | 2 columns, **50% / 50%**, full page width |
| Title block | padding `--spacing-md` (24) all sides | max-width 576 (`--spacing-xxxl` × 8), centred | top `--spacing-xl` (40), sides `--spacing-lg` (32); title capped at 504 and centred like the form |
| Gallery | full width, **square** | full width, square | left column, **sticky** at `--layout-header-height` (64), height `100dvh − header` |
| Form column | sides `--spacing-md` (24), top 24, bottom `--spacing-xxl` (60) | max-width 576, centred | padding 32 / 32 / 60 (top/sides/bottom), white `--colors-background` |
| Form content width | fluid | fluid | **max 504** (`--spacing-xxxl` × 7), centred in the column |
| Gap between steps | `--spacing-md` (24) | `--spacing-lg` (32) | `--spacing-lg` (32) |
| Gap step title → content | `--spacing-xxs` (8) | 8 | 8 |

## 3. Typography (OAL)

Apply the **whole** `--typography-rules-{scale}-*` set, never single properties. No size changes between mobile and desktop for these scales.

| Element | Scale | OAL value |
|---|---|---|
| Page title "Create Your Digital Gift Card" | `headline4` | Bebas Neue 400, 32/32, uppercase |
| Step titles ("Pick a Card", "Who's This For?", …) | `text2` | Roboto 500, 14/18, **Title Case** |
| "(select all that apply)" | `text1` in `--colors-text-secondary` | Roboto 400, 14/18 |
| Chip labels ($100, Email, …) | `text2` | Roboto 500, 14/18 |
| Inputs, textarea, placeholders | `text1` | Roboto 400, 14/18 (16px on iOS to stop zoom) |
| Hints, errors, counter, consent, "Replace", upload tile | `text3` | Roboto 400, 12/16 |
| Add to bag | `button1` via `--buttons-primary-*` | Akatab 700, 15/17, uppercase, 0.4px tracking |

Copy is Title Case for step titles. Copy uses no em dashes.

## 4. Colour, borders, radius, elevation (OAL)

| Use | Token | OAL |
|---|---|---|
| Text | `--colors-text` | #000000 |
| Secondary text, hints | `--colors-text-secondary` | #707070 |
| Page / form background | `--colors-background` | #FFFFFF |
| Gallery ground behind an uploaded photo | `--colors-surface-primary` | #F8F8F8 |
| Field background | `--form-field-background` | #FFFFFF |
| Field + chip border | `--form-field-border-color`, `--form-option-border-color` | #CCCCCC |
| Field border, hover | `--form-field-border-color-hover` | #000000 |
| Placeholder | `--form-input-placeholder` | #9B9B9B |
| Error | `--colors-error` | #8E0000 |
| Selected chip fill / text | `--colors-text` / `--colors-text-inverse` | #000 / #FFF |
| Selected tile ring | `--border-strong` | #000000 |
| Border width | `--border-width` | 1px |
| Field / chip radius | `--form-field-border-radius` | 0 (OAL is square) |
| Round controls | `--radius-full` | 9999px |
| Floating controls | `--shadow-md` | `0 4px 12px rgba(0,0,0,.1)` |
| Focus ring | `--form-field-focus-ring-*` | 2px solid text colour, 1px offset |
| Fade / colour transitions | `--transition-fast` | 150ms ease |

Spacing scale (shared, never per brand): `xxxs` 4 · `xxs` 8 · `xs` 12 · `sm` 16 · `md` 24 · `lg` 32 · `xl` 40 · `xxl` 60 · `xxxl` 72.

## 5. Components

### 5.1 Gallery

- **Preset design selected:** the design's square mockup, `object-fit: cover`, filling the gallery. It changes as soon as a tile is picked.
- **Uploaded photo selected:** a landscape card (ratio **1.586 : 1**) on `--colors-surface-primary`, posed like the mockups:
  - Long side **69%** of the gallery's larger side, rotated **−61°**, nudged up 3%. The card is a size container, so these use `cqmax` units.
  - Corner radius 3.5% of the frame. `--shadow-md` on the card, plus a soft floor shadow (blurred `--colors-overlay` ellipse, 50% wide, 12% from the bottom).
  - Brand logo (`SiteLogo`, white with a soft dark glow) in the card's **bottom-left**, **4%** in from the edges, 16% of the frame wide.
  - The photo always **covers** the card. Moving, zooming and turning can never open a gap.
- **Photo tools** (uploaded photo only), **bottom-right**: three round white buttons, gap 8.

| | Mobile (<768) | Tablet and desktop (≥768) |
|---|---|---|
| Button size | 40 (`--spacing-xl`) | 48 (`xl` + `xxs`) |
| Inset | 16 (`--spacing-sm`) | 24 (`--spacing-md`). From 1024 the bottom inset adds the topline height (36) so the buttons show at the top of the page. |
| Icons | `ZoomInIcon`, `ZoomOutIcon`, `RotateIcon` at 24 | same |

  - Zoom: 1× to 3× in 0.25 steps. The buttons disable at the ends.
  - Rotate: 90° per press. The photo auto-scales to keep covering the card.
  - **Drag** the photo on the card to move it. Movement follows the pointer through the −61° tilt. `touch-action: none` on the card so dragging doesn't scroll the page.

### 5.2 Pick a Card

- Tiles are **square** (the mockup cropped to fill), with a light `--border-color` frame.
- **Mobile:** a sideways carousel showing **3¼ tiles** at any phone width, gap 12, no scrollbar. It bleeds off the right edge of the screen, and the first tile lines up with the title.
- **Tablet and desktop:** one row of **5 equal columns** (4 designs + upload slot), gap 12.
- **Selected ring:** `box-shadow: 0 0 0 2px var(--colors-background), 0 0 0 4px var(--border-strong)`. The 4px ring's outer edge sits exactly on the title's left line.
- **Upload slot:** dashed 1px `--border-strong`, white, `FileUploadIcon` 24 over "Upload your own image" (`caption2`). It opens the file picker for `image/*`.
- **After upload** the slot becomes the photo tile:
  - The same tilted card in miniature.
  - A **remove X**: a 20px round white badge floating over the top-right corner (overhangs ~7px), `XIcon` 12, `--shadow-md`.
  - **"Replace"** (`text3`, underlined, no background) centred **8px under** the tile. It is positioned absolutely, so **nothing below moves** when a photo is added.
- Order: **Merry Christmas** (default), Happy Birthday, Happy Holidays, I Love You, then the upload slot.

### 5.3 Choose an Amount

- Chips: $100, $250, $300, **Custom**. **Nothing is pre-selected.**
- Chip style: hugs its label, min-height 44 (`--field-min-height`), padding 0 16, 1px border, gap 8. Selected: black fill, white text.
- **Mobile:** chips stay on one line and slide sideways, bleeding to the screen edge. **Tablet and desktop:** chips wrap.
- **Custom** shows an amount field: **96px wide** (fits "$" plus 4 digits), 44 tall, `$` prefix, placeholder "Amount", digits only, max 4. On desktop it sits in the chip row after Custom. On mobile it drops below the sliding chips.

### 5.4 How Would You Like to Send It? (select all that apply)

- Chips (same style as amounts): **Email**, **SMS**, **Get a link**, **Print at home**. Multi-select, **nothing pre-selected**, at least one required.
- **Email** adds the step **What's Their Email?** with the hint "Use your own email if you don't have theirs. You can pass the gift on later."
- **SMS** adds the step **What's Their Phone Number?**:
  - `+1` prefix; formats as typed to `(555) 987-6543`; a leading 1 is dropped; 10 digits required.
  - Consent line under it (`text3`, secondary): "By continuing, you agree to {Brand}'s terms of service and privacy policy." Both phrases are underlined links.

### 5.5 Who's This For? / Add Personal Message

- **Who's This For?** is a single text field. The step title is its label.
- **Add Personal Message** is an always-visible textarea (4 rows), optional, max 250 characters. The `0 / 250` counter sits **inside** the box, bottom-right, 12px in. No resize handle.

### 5.6 Add to bag

- Full-width primary button (`--buttons-primary-*`, black, square, min-height 44).
- On success the gift card is added and the **floating cart** opens with "Successfully added to bag!".

## 6. Validation and errors

Validation runs on Add to bag. Errors appear under their field (`text3`, `--colors-error`) and focus moves to the **first** invalid control. Each error clears as soon as that field changes.

| Rule | Message |
|---|---|
| No amount | Choose an amount. |
| Custom empty / outside $10–$500 / not whole | Enter an amount. / Choose an amount between $10 and $500. / Use whole dollars. |
| No send option | Choose at least one way to send it. |
| No recipient name | Enter the recipient's name. |
| Email picked, empty / invalid | Enter the recipient's email. / Enter a valid email, e.g. name@example.com. |
| SMS picked, empty / not 10 digits | Enter the recipient's phone number. / Enter a 10-digit phone number, e.g. (555) 987-6543. |

## 7. Accessibility notes

- Steps are `role="group"` (amount, send options) or `role="radiogroup"` (designs), labelled by their title. Don't use `<fieldset>`/`<legend>` for these: iOS Safari lays out the legend differently and the steps lose their spacing.
- Tiles and chips are real radios/checkboxes, visually hidden, so keyboard and screen readers work natively. Focus shows a 2px ring.
- Icon-only buttons carry labels: "Zoom in", "Zoom out", "Rotate photo", "Remove your photo", "Replace your photo".
- The photo is cropped visually only; its `alt` stays "Your photo on the gift card".

## 8. What goes to the cart

The prototype adds one cart line per card with these options. The production build should map them to the store's option fields; see the Theo Grace gift card page for the existing contract.

| Cart option | Value |
|---|---|
| Design | design name, or "Your photo" |
| Delivery | picked options, e.g. "Email, SMS" |
| To | recipient name |
| Email | when Email is picked |
| Phone | `+1 (555) 987-6543`, when SMS is picked |
| Message | when filled in |

**Production mapping:** Theo Grace (`/articles/gift_card`) adds through `POST /api/v1/cart/items/add`. Each amount is its own gift card product (`product_id`, `sku`, `version_id`). Fields go in as `options_selections` with category IDs: name 38, email 39, phone 48, message 365, delivery 1012, picture 712. Delivery is one option ID per combination of email / SMS / print.

**Open for OAL:**
- OAL gift card products and IDs don't exist yet.
- "Custom" amount and "Get a link" have no equivalent in that model.
- An uploaded photo's framing (move / zoom / rotate) would need to be drawn into the card picture before upload, as TGR does.

## 9. Assets

| Asset | Spec |
|---|---|
| Card mockup (gallery + tiles) | **2400 × 2400 px** square PNG master (WebP/JPEG ≤ ~300KB served). Card, shadow and text inside the **middle 80%**: the desktop gallery crops ~7% off each side. Card long side ~69% of the frame, tilted ~61°, slightly above centre. **Flat background #F8F8F8** on every design. |
| Flat card art (optional) | **1712 × 1080 px** (1.586 : 1). Used for card-shaped tiles and for drawing the order picture. |
| Brand logo | Existing `SiteLogo` CDN SVG per brand. |
| Icons | Brand-scoped sets: `FileUploadIcon`, `XIcon`, `ZoomInIcon`, `ZoomOutIcon`, `RotateIcon` (all five brands). |

Current OAL files live in `public/images/gift-card/`.
