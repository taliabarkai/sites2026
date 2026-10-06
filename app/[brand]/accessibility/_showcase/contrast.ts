// WCAG 2.2 contrast ratio, computed from whatever a CSS variable resolves to in
// the live page — so the table follows the brand theme and the Before/After view.

export interface ContrastPair {
  label: string
  foreground: string
  background: string
  /** 'text' needs 4.5:1 (1.4.3); 'ui' — borders, focus rings — needs 3:1 (1.4.11). */
  kind: 'text' | 'ui'
}

export const CONTRAST_GROUPS: { title: string; pairs: ContrastPair[] }[] = [
  {
    title: 'Text',
    pairs: [
      { label: 'Body text on page', foreground: '--colors-text', background: '--colors-background', kind: 'text' },
      { label: 'Body text on surface', foreground: '--colors-text', background: '--colors-surface-primary', kind: 'text' },
      { label: 'Body text on secondary surface', foreground: '--colors-text', background: '--colors-surface-secondary', kind: 'text' },
      { label: 'Secondary text on page', foreground: '--colors-text-secondary', background: '--colors-background', kind: 'text' },
      { label: 'Secondary text on surface', foreground: '--colors-text-secondary', background: '--colors-surface-primary', kind: 'text' },
      { label: 'Secondary text on secondary surface', foreground: '--colors-text-secondary', background: '--colors-surface-secondary', kind: 'text' },
      { label: 'Selling price', foreground: '--colors-price-selling', background: '--colors-background', kind: 'text' },
      { label: 'Error message', foreground: '--colors-error', background: '--colors-background', kind: 'text' },
      { label: 'Success message', foreground: '--colors-success', background: '--colors-background', kind: 'text' },
    ],
  },
  {
    title: 'Forms',
    pairs: [
      { label: 'Field text', foreground: '--colors-text', background: '--form-field-background', kind: 'text' },
      { label: 'Placeholder', foreground: '--form-input-placeholder', background: '--form-field-background', kind: 'text' },
      { label: 'Field border', foreground: '--form-field-border-color', background: '--form-field-background', kind: 'ui' },
      { label: 'Swatch, chip and checkbox border', foreground: '--border-interactive', background: '--colors-background', kind: 'ui' },
      { label: 'Swatch border on surface', foreground: '--border-interactive', background: '--colors-surface-primary', kind: 'ui' },
    ],
  },
  {
    title: 'Buttons and badges',
    pairs: [
      { label: 'Primary button', foreground: '--buttons-primary-text', background: '--buttons-primary-background', kind: 'text' },
      { label: 'Secondary button', foreground: '--buttons-secondary-text', background: '--buttons-secondary-background', kind: 'text' },
      { label: 'Ribbon', foreground: '--ribbon-text', background: '--ribbon-background', kind: 'text' },
      { label: 'Bundle ribbon', foreground: '--ribbon-bundle-text', background: '--ribbon-bundle-background', kind: 'text' },
      { label: 'Sold-out ribbon', foreground: '--ribbon-oos-text', background: '--ribbon-oos-background', kind: 'text' },
      { label: 'Secondary ribbon', foreground: '--ribbon-secondary-text', background: '--ribbon-secondary-background', kind: 'text' },
    ],
  },
  {
    title: 'Site chrome',
    pairs: [
      { label: 'Announcement bar', foreground: '--layout-announcements-bar-text', background: '--layout-announcements-bar-background', kind: 'text' },
      { label: 'Footer text', foreground: '--footer-text', background: '--footer-main-background', kind: 'text' },
      { label: 'Footer muted text', foreground: '--footer-text-muted', background: '--footer-main-background', kind: 'text' },
    ],
  },
  {
    title: 'Focus ring',
    pairs: [
      { label: 'Ring on page', foreground: '--focus-ring-color', background: '--colors-background', kind: 'ui' },
      { label: 'Ring on surface', foreground: '--focus-ring-color', background: '--colors-surface-primary', kind: 'ui' },
      { label: 'Ring on secondary surface', foreground: '--focus-ring-color', background: '--colors-surface-secondary', kind: 'ui' },
      { label: 'Inverse ring on primary button', foreground: '--focus-ring-color-inverse', background: '--buttons-primary-background', kind: 'ui' },
    ],
  },
]

export const REQUIRED_RATIO = { text: 4.5, ui: 3 } as const

export type Rgb = [number, number, number]

/** Resolve a custom property to rgb by letting the browser compute it in place. */
export function resolveColor(probe: HTMLElement, variable: string): Rgb | null {
  probe.style.color = ''
  probe.style.color = `var(${variable})`
  const value = getComputedStyle(probe).color
  const channels = value.match(/[\d.]+/g)?.map(Number)
  if (!channels || channels.length < 3) return null
  // Fully transparent: no fill to measure against
  if (channels.length === 4 && channels[3] === 0) return null
  return [channels[0], channels[1], channels[2]]
}

function luminance([r, g, b]: Rgb) {
  const linear = [r, g, b].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

export function contrastRatio(a: Rgb, b: Rgb) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

export function toHex([r, g, b]: Rgb) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}
