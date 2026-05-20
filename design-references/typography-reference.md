# Typography Token Quick Reference

Token pattern: `--typography-rules-{scale}-{property}`

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
| `headline8` | Small uppercase sub-heading |
| `headline9` | Medium body heading |
| `headline10` | Extra-small label |
| `headline11` | Medium label |
| `headline12` | Module heading (medium) |
| `text1` | Body text — default |
| `text2` | Body text — bold |
| `text3` | Small body text |
| `text4` | Small body text — bold |
| `text5` | Small label / meta |
| `text6` | Body text — slightly looser |
| `text7` | Body text — light weight |
| `text8` | Extra-small text |
| `text9` | Extra-small text — bold |
| `caption1` | Caption / annotation |
| `caption2` | Caption — bold |
| `paragraph1` | Long-form paragraph |
| `paragraph2` | Paragraph — bold |
| `paragraph3` | Paragraph — light |
| `paragraph4` | Paragraph — small |
| `links1` | Inline link text |
| `button1` | Primary / large button label |
| `button2` | Secondary / small button label |
| `disclaimer1` | Legal / disclaimer text |
| `disclaimer2` | Disclaimer — bold |
| `ribbons1` | Announcement / ribbon bar text |

## Properties per scale

```css
font-family:    var(--typography-rules-{scale}-font-family);
font-size:      var(--typography-rules-{scale}-font-size);
line-height:    var(--typography-rules-{scale}-line-height);
letter-spacing: var(--typography-rules-{scale}-letter-spacing);  /* not always set */
text-transform: var(--typography-rules-{scale}-text-transform);  /* not always set */
font-weight:    var(--typography-rules-{scale}-font-weight);     /* not always set */
```

## Font family variables (set per brand in `styles/themes/*.css`)

| Variable | OAL | MNN | LAL | IB | TGR |
|----------|-----|-----|-----|----|-----|
| `--font-family-main-regular` | Helvetica Neue | AnoRegular | Poppins 400 | Assistant 400 | Lato 400 |
| `--font-family-main-bold` | Helvetica Neue | AnoBold | Poppins 600 | Assistant 600 | Lato 700 |
| `--font-family-main-light` | Helvetica Neue | AnoHalf | Poppins 300 | Assistant 300 | Lato 300 |
| `--font-family-secondary-regular` | Bebas Neue | — | — | — | Big Caslon |
| `--font-family-tertiary-regular` | Akatab | — | — | — | — |

> OAL uses Typekit (`use.typekit.net/vle4ewv.css`) for Helvetica Neue.  
> MNN uses local `@font-face` with separate family names per variant.  
> All other brands load from Google Fonts (declared in `app/[brand]/layout.tsx`).

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

## File location

Full token definitions: `design-references/typography-tokens.css`  
Imported into every page via `app/globals.css`.
