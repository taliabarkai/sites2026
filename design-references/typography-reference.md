# Typography Token Quick Reference

Token pattern: `--typography-rules-{scale}-{property}`

All values are in **px** (not rem). The rem base (`html { font-size: 62.5% }`) is
set in `globals.css` for legacy compatibility — components always use the CSS variables
directly and never hardcode values.

---

## Scales

| Scale | Typical use |
|-------|-------------|
| `headline1` | Hero / largest display heading |
| `headline2` | Section heading |
| `headline3` | Sub-section heading |
| `headline4` | Card / module heading |
| `headline5` | Light-weight heading variant |
| `headline6` | Small uppercase label heading |
| `headline7` | Small body-level heading |
| `headline8` | Small uppercase sub-heading (OAL: Akatab tertiary font) |
| `headline9` | Medium uppercase heading |
| `headline10` | Extra-small uppercase label |
| `headline11` | Medium label |
| `headline12` | Module heading (medium, bold) |
| `text1` | Body text — regular |
| `text2` | Body text — bold |
| `text3` | Small body text — regular |
| `text4` | Small body text — bold |
| `text5` | Small label / meta |
| `text6` | Body text — slightly looser leading |
| `text7` | Body text — light weight |
| `text8` | Extra-small text — regular |
| `text9` | Extra-small text — bold |
| `caption1` | Caption / annotation — regular |
| `caption2` | Caption — bold |
| `paragraph1` | Long-form paragraph — regular |
| `paragraph2` | Long-form paragraph — bold |
| `paragraph3` | Long-form paragraph — bold, larger |
| `paragraph4` | Long-form paragraph — regular, larger |
| `links1` | Inline link text |
| `button1` | Primary / large button label |
| `button2` | Secondary / small button label |
| `disclaimer1` | Legal / disclaimer text — regular |
| `disclaimer2` | Legal / disclaimer text — bold |
| `ribbons1` | Announcement / ribbon bar text (OAL: Bebas Neue secondary font) |

---

## Properties per scale

Not every scale defines every property. Always use a fallback for optional ones:

```css
.element {
  font-family:    var(--typography-rules-{scale}-font-family);
  font-size:      var(--typography-rules-{scale}-font-size);
  line-height:    var(--typography-rules-{scale}-line-height);
  letter-spacing: var(--typography-rules-{scale}-letter-spacing, normal);
  text-transform: var(--typography-rules-{scale}-text-transform, none);
  font-weight:    var(--typography-rules-{scale}-font-weight, normal);
}
```

---

## Font family variables — set per brand in `styles/themes/*.css`

Never hardcode font names in components — always use these variables.

| Variable | OAL | MNN | LAL | IB | TGR |
|----------|-----|-----|-----|----|-----|
| `--font-family-main-regular` | Helvetica Neue (wt 300) | AnoRegular | Poppins 400 | Assistant 400 | Lato 400 |
| `--font-family-main-bold` | Helvetica Neue (wt 500) | AnoBold | Poppins 600 | Assistant 600 | Lato 700 |
| `--font-family-main-light` | Helvetica Neue (wt 200) | AnoHalf | Poppins 300 | Assistant 300 | Lato 300 |
| `--font-family-secondary-regular` | Bebas Neue | — | — | — | Big Caslon |
| `--font-family-tertiary-regular` | Akatab | — | — | — | — |

**Font loading:**
- **OAL** — Helvetica Neue via Adobe Typekit. Add to OAL layout.tsx before other styles:
  `<link rel="stylesheet" href="https://use.typekit.net/vle4ewv.css" />`
- **OAL** — Bebas Neue via Google Fonts (`@import` in `globals.css`)
- **OAL** — Akatab via Google Fonts (`@import` in `globals.css`)
- **MNN** — AnoRegular, AnoBold, AnoHalf via `@font-face` in `globals.css` (local files)
- **LAL** — Poppins via Next.js `next/font/google`
- **IB** — Assistant via Next.js `next/font/google`
- **TGR** — Lato via Next.js `next/font/google` / Big Caslon via local font file

---

## Brand-specific font notes

**OAL** — Headlines 1–4 and ribbons1 use `--font-family-secondary-regular` (Bebas Neue),
not the main font. This gives OAL its distinctive condensed uppercase display style.
`headline8`, `button1`, `button2` use `--font-family-tertiary-regular` (Akatab).

**TGR** — Headlines 1–4, 6, and 9 use `--font-family-secondary-regular` (Big Caslon),
giving TGR its editorial serif display character.

**MNN** — The three Ano variants are genuinely separate font families loaded via
`@font-face`, not weight variants of a single family. Use the correct variable for
the weight you need — the font-weight property alone won't switch between them.

---

## Quick UI element → scale lookup

| UI element | Scale |
|------------|-------|
| Hero / page display title | `headline1` |
| Page section heading | `headline2` / `headline3` |
| Card / panel heading | `headline4` |
| Light heading variant | `headline5` |
| Nav links / small uppercase label | `headline6` |
| Small body heading | `headline7` |
| Small uppercase sub-label | `headline8` |
| Medium uppercase heading | `headline9` |
| Extra-small label | `headline10` |
| Medium label | `headline11` |
| Product name | `text1` |
| Selling price | `text2` |
| Crossed-out original price | `text1` + `text-decoration: line-through` + `--colors-text-secondary` |
| View Details toggle | `text2` |
| Expanded detail key | `text2` (bold) |
| Expanded detail value | `text1` |
| Edit / Remove links | `text1` + `text-decoration: underline` |
| Small body / meta | `text3` / `text5` |
| Light body text | `text7` |
| Extra-small text | `text8` |
| Long-form paragraph | `paragraph1` |
| Caption / annotation | `caption1` |
| Inline links | `links1` |
| Button label (primary/secondary/a2c) | `button1` |
| Button label (small/secondary) | `button2` |
| Upsell-primary button | `text1` via `--typography-rules-text1-*` |
| Link button | `text1` via `--typography-rules-text1-*` |
| Announcement / topline bar | `ribbons1` |
| Footer fine print / legal | `disclaimer1` |

---

## Button typography — important rule

Most button variants consume `--buttons-{variant}-*` tokens (not typography-rules).
Two variants are intentional exceptions that use body text scale:

| Variant | Typography source |
|---------|------------------|
| `primary`, `secondary`, `a2c`, `preview`, `disabled`, `danger`, `success` | `--buttons-{variant}-font-*` tokens |
| `upsell-primary` | `--typography-rules-text1-*` |
| `link` | `--typography-rules-text1-*` |

---

## Usage example

```css
.productTitle {
  font-family:    var(--typography-rules-headline4-font-family);
  font-size:      var(--typography-rules-headline4-font-size);
  line-height:    var(--typography-rules-headline4-line-height);
  letter-spacing: var(--typography-rules-headline4-letter-spacing, normal);
  text-transform: var(--typography-rules-headline4-text-transform, none);
  font-weight:    var(--typography-rules-headline4-font-weight, normal);
}
```

---

## File locations

- Full token definitions: `design-references/typography-tokens.css`
- Imported into every page via: `app/globals.css`