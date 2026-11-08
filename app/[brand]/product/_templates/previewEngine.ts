/**
 * The live-preview engines. The page hands an engine the current field values
 * and gets an image (a data URL) back — it never knows which engine ran.
 *
 * `placeholder`: the mockup's own renderer. Base image per field value, image
 *   overlays, then the text layers drawn as SVG in the spec's font inside the
 *   spec's box, composited on a canvas like MusicMemoriesCustomizer does.
 * `external`: the real engine. Not wired yet — the mockup waits
 *   `simulatedLatencyMs` and answers with the placeholder render, so the
 *   loading state can be reviewed.
 * `necklaceStudio`: name necklaces from the Name Necklace Studio — plates
 *   solved on the server, hung on a simulated chain here (necklaceStudio.ts).
 */
import { fieldById, type PdpTemplate, type PlaceholderSpec, type PreviewEngine, type StoneLook, type StoneSeparator } from './pdpTemplate'
import type { PreviewInput } from './fieldState'
import { renderNecklaceStudio } from './necklaceStudio'

/** Output size — the PDP gallery slots are square. */
const SIZE = 1200

/** Theme colors the renderer needs, read from the page's CSS variables. */
export interface PreviewColors {
  /** Neutral fill when a base image is missing. */
  surface: string
  /** Text fallback, and the chain's shadow. */
  text: string
}

export function readPreviewColors(el: Element | null): PreviewColors {
  const css = el ? getComputedStyle(el) : null
  const v = (name: string, fallback: string) => css?.getPropertyValue(name).trim() || fallback
  return {
    surface: v('--colors-card-image-bg', v('--colors-surface-primary', 'Canvas')),
    text: v('--colors-text', 'CanvasText'),
  }
}

// ─── Image loading ──────────────────────────────────────────────────────────

const imageCache = new Map<string, Promise<HTMLImageElement | null>>()

/** Resolves null for a missing image (placeholder assets don't exist yet). */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  let p = imageCache.get(src)
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = src
    })
    imageCache.set(src, p)
  }
  return p
}

// ─── SVG text layers ────────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Rough glyph width for a script face, as a share of the font size — enough to keep a line inside its box. */
const GLYPH_WIDTH = 0.52

function fitFontSize(text: string, boxW: number, lineH: number): number {
  const byHeight = lineH * 0.82
  const byWidth = boxW / Math.max(1, text.length * GLYPH_WIDTH)
  return Math.max(10, Math.min(byHeight, byWidth))
}

// ─── Cable chain (placeholder only) ─────────────────────────────────────────

type Pt = { x: number; y: number }
type Box = { x: number; y: number; w: number; h: number }

const quad = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({
  x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * c.x + t ** 2 * b.x,
  y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * c.y + t ** 2 * b.y,
})

/** Chain proportions in pixels: link length and wire thickness. */
interface Gauge { link: number; wire: number }

const GAUGE: Gauge = { link: SIZE * 0.02, wire: 2.5 }

/** Links along one strand, evenly spaced by arc length, alternating flat and edge-on. */
function cableStrand(a: Pt, c: Pt, b: Pt, color: string, gauge: Gauge): string {
  const { link, wire } = gauge
  const step = link * 0.78 // links overlap, as a cable chain's do
  const samples: Pt[] = Array.from({ length: 401 }, (_, i) => quad(a, c, b, i / 400))
  const links: string[] = []
  let travelled = 0
  let next = 0
  let n = 0
  for (let i = 1; i < samples.length; i++) {
    const p0 = samples[i - 1]
    const p1 = samples[i]
    travelled += Math.hypot(p1.x - p0.x, p1.y - p0.y)
    if (travelled < next) continue
    next += step
    const angle = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI
    // Flat links show their opening; edge-on links read as a short bar
    const ry = n++ % 2 === 0 ? link * 0.32 : wire * 0.6
    links.push(
      `<ellipse cx="${p1.x.toFixed(1)}" cy="${p1.y.toFixed(1)}" rx="${(link / 2).toFixed(1)}" ry="${ry.toFixed(1)}" ` +
      `transform="rotate(${angle.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)})" fill="none" stroke="${esc(color)}" stroke-width="${wire.toFixed(2)}"/>`,
    )
  }
  return links.join('')
}

/** Two strands from the top of the image, curving down to the pendant's two ends (its loops). */
function cableChainSvg(left: Pt, right: Pt, color: string, gauge: Gauge): string {
  const spread = Math.max(SIZE * 0.22, (right.x - left.x) / 2 + SIZE * 0.06)
  const cx = (left.x + right.x) / 2
  const topL: Pt = { x: cx - spread, y: -SIZE * 0.02 }
  const topR: Pt = { x: cx + spread, y: -SIZE * 0.02 }
  return (
    cableStrand(topL, { x: topL.x - SIZE * 0.04, y: left.y * 0.85 }, left, color, gauge) +
    cableStrand(topR, { x: topR.x + SIZE * 0.04, y: right.y * 0.85 }, right, color, gauge)
  )
}

const boxEnds = (box: Box): [Pt, Pt] => [
  { x: box.x * SIZE, y: (box.y + box.h / 2) * SIZE },
  { x: (box.x + box.w) * SIZE, y: (box.y + box.h / 2) * SIZE },
]

/** Where the chain hangs to: the first overlay (the charm), else the first text box. */
const pendantBox = (spec: PlaceholderSpec): Box | undefined => spec.overlays?.[0]?.box ?? spec.text?.[0]?.box

// ─── Stones between the letters (Inez) ──────────────────────────────────────

/** The stone the separator resolves to for this input, and its size multiplier — none when no source has a value. */
function resolveStone(sep: StoneSeparator | undefined, input: PreviewInput): { look: StoneLook; scale: number } | null {
  if (!sep) return null
  for (const src of sep.sources) {
    const look = src.stones[input.choices[src.fieldId] ?? '']
    if (look) {
      const scale = sep.size ? sep.size.scale[input.choices[sep.size.fieldId] ?? ''] ?? 1 : 1
      return { look, scale }
    }
  }
  return null
}

/** A stone placed in the render: its centre and diameter, and what it is. */
interface StonePlacement { x: number; y: number; d: number; look: StoneLook }

/** Product content, not UI: a diamond's body, its facet lines and its edge. */
const DIAMOND = { light: '#FFFFFF', body: '#E4E9EF', facet: '#B9C2CC' }

/** A diamond cut drawn in SVG, in a thin setting of the metal. */
function diamondSvg(p: StonePlacement, metal: string, id: number): string {
  if (!('cut' in p.look)) return ''
  const { x, y, d } = p
  const r = d / 2
  const grad = `<radialGradient id="dia${id}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="${DIAMOND.light}"/><stop offset="1" stop-color="${DIAMOND.body}"/></radialGradient>`
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${DIAMOND.facet}" stroke-width="1.2"/>`
  const edge = `stroke="${esc(metal)}" stroke-width="${(d * 0.07).toFixed(1)}"`
  if (p.look.cut === 'round') {
    // Table and star facets
    const star = Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4
      return line(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45, x + Math.cos(a + Math.PI / 8) * r * 0.92, y + Math.sin(a + Math.PI / 8) * r * 0.92)
    }).join('')
    return `<defs>${grad}</defs><circle cx="${x}" cy="${y}" r="${r}" fill="url(#dia${id})" ${edge}/>${star}` +
      `<circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="none" stroke="${DIAMOND.facet}" stroke-width="1.2"/>`
  }
  if (p.look.cut === 'oval') {
    const rx = r * 1.25
    const ry = r * 0.85
    return `<defs>${grad}</defs><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#dia${id})" ${edge}/>` +
      `<ellipse cx="${x}" cy="${y}" rx="${rx * 0.5}" ry="${ry * 0.5}" fill="none" stroke="${DIAMOND.facet}" stroke-width="1.2"/>` +
      line(x - rx * 0.5, y, x - rx * 0.92, y) + line(x + rx * 0.5, y, x + rx * 0.92, y)
  }
  // Emerald cut: a step-cut rectangle with clipped corners
  const w = r * 1.3
  const h = r * 0.9
  const c = r * 0.26
  const oct = (hw: number, hh: number, cc: number) =>
    [[-hw + cc, -hh], [hw - cc, -hh], [hw, -hh + cc], [hw, hh - cc], [hw - cc, hh], [-hw + cc, hh], [-hw, hh - cc], [-hw, -hh + cc]]
      .map(([px, py]) => `${(x + px).toFixed(1)},${(y + py).toFixed(1)}`).join(' ')
  return `<defs>${grad}</defs><polygon points="${oct(w, h, c)}" fill="url(#dia${id})" ${edge}/>` +
    `<polygon points="${oct(w * 0.62, h * 0.5, c * 0.5)}" fill="none" stroke="${DIAMOND.facet}" stroke-width="1.2"/>`
}

// ─── SVG layers ─────────────────────────────────────────────────────────────

/** What one text layer contributes: its letters, the stones between them, and where a chain would hang. */
interface LayerOut {
  glyphs: string[]
  ends: [Pt, Pt] | null
  stones: StonePlacement[]
  /** Short strands between letters and stones (drawn with the chain). */
  links: [Pt, Pt][]
}

/** Text for one layer: `stack` one line per value, else joined on one line. */
function cssFontLayer(layer: NonNullable<PlaceholderSpec['text']>[number], values: string[], fill: string): LayerOut {
  const x = layer.box.x * SIZE
  const y = layer.box.y * SIZE
  const w = layer.box.w * SIZE
  const h = layer.box.h * SIZE
  const lines = layer.layout === 'stack' ? values : [values.join(' ')]
  const lineH = h / lines.length
  const glyphs: string[] = []
  let widest = 0
  lines.forEach((line, i) => {
    const size = fitFontSize(line, w, lineH)
    widest = Math.max(widest, Math.min(w, size * line.length * GLYPH_WIDTH))
    const cy = y + lineH * (i + 0.5)
    glyphs.push(
      `<text x="${x + w / 2}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-family="${esc(layer.font)}" font-size="${size.toFixed(1)}" fill="${esc(fill)}">${esc(line)}</text>`,
    )
  })
  const pad = SIZE * 0.015
  const cy = y + h / 2
  return { glyphs, ends: [{ x: x + w / 2 - widest / 2 - pad, y: cy }, { x: x + w / 2 + widest / 2 + pad, y: cy }], stones: [], links: [] }
}

/** Width of one capital, as a share of the font size, for spacing letters one by one. */
const CAP_WIDTH = 0.66
/** The chain-and-stone gap between two letters, as a share of the font size. */
const STONE_GAP = 1.15

/**
 * One line of letters with a stone on the chain between each pair: each
 * letter hangs from the chain, the stone sits a little lower at the middle.
 */
function stonedLayer(layer: NonNullable<PlaceholderSpec['text']>[number], values: string[], fill: string, stone: { look: StoneLook; scale: number }): LayerOut {
  const x = layer.box.x * SIZE
  const y = layer.box.y * SIZE
  const w = layer.box.w * SIZE
  const h = layer.box.h * SIZE
  const n = values.length
  const size = Math.max(10, Math.min(h * 0.82, w / (n * CAP_WIDTH + (n - 1) * STONE_GAP)))
  const letterW = size * CAP_WIDTH
  const gap = size * STONE_GAP
  const total = n * letterW + (n - 1) * gap
  const cy = y + h / 2
  // Small next to the letters, as on the real piece; a bigger carat a little bigger
  const d = Math.min(gap * 0.3, size * 0.22) * stone.scale
  const glyphs: string[] = []
  const stones: StonePlacement[] = []
  const links: [Pt, Pt][] = []
  let left = x + (w - total) / 2
  values.forEach((v, i) => {
    const lx = left + letterW / 2
    glyphs.push(
      `<text x="${lx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="${esc(layer.font)}" font-size="${size.toFixed(1)}" fill="${esc(fill)}">${esc(v)}</text>`,
    )
    left += letterW
    if (i < n - 1) {
      const sx = left + gap / 2
      const sy = cy + size * 0.12
      stones.push({ x: sx, y: sy, d, look: stone.look })
      const wide = 'cut' in stone.look && stone.look.cut !== 'round' ? d * 0.65 : d / 2
      links.push([{ x: left + size * 0.04, y: cy - size * 0.05 }, { x: sx - wide, y: sy }])
      links.push([{ x: sx + wide, y: sy }, { x: left + gap - size * 0.04, y: cy - size * 0.05 }])
      left += gap
    }
  })
  const pad = SIZE * 0.012
  return { glyphs, ends: [{ x: x + (w - total) / 2 - pad, y: cy }, { x: x + (w + total) / 2 + pad, y: cy }], stones, links }
}

/**
 * The spec's text layers — and the chain under them, when `withChain` — as
 * one transparent SVG at SIZE×SIZE; plus the gem pictures to draw on top
 * (an SVG drawn as an image can't load pictures of its own).
 */
function buildLayers(spec: PlaceholderSpec, input: PreviewInput, fill: string, withChain: boolean): { svg: string; gems: StonePlacement[] } {
  const glyphs: string[] = []
  const stoneSvg: string[] = []
  const gems: StonePlacement[] = []
  const links: [Pt, Pt][] = []
  // Where the chain hangs to: the first text layer that has text
  let ends: [Pt, Pt] | null = null
  for (const layer of spec.text ?? []) {
    const raw = (input.texts[layer.fieldId] ?? []).map((t) => t.trim()).filter(Boolean)
    const values = layer.uppercase ? raw.map((t) => t.toUpperCase()) : raw
    if (values.length === 0) continue
    const stone = layer.layout !== 'stack' && values.length > 1 ? resolveStone(layer.separator, input) : null
    const out = stone ? stonedLayer(layer, values, fill, stone) : cssFontLayer(layer, values, fill)
    glyphs.push(...out.glyphs)
    links.push(...out.links)
    out.stones.forEach((p, i) => {
      if ('cut' in p.look) stoneSvg.push(diamondSvg(p, fill, stoneSvg.length + i))
      else {
        // A gem sits in a bezel of the metal
        stoneSvg.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(p.d * 0.62).toFixed(1)}" fill="${esc(fill)}"/>`)
        gems.push(p)
      }
    })
    ends = ends ?? out.ends
  }
  const pendant = pendantBox(spec)
  const chainEnds = ends ?? (pendant ? boxEnds(pendant) : null)
  const small: Gauge = { link: GAUGE.link * 0.7, wire: GAUGE.wire * 0.85 }
  const chain = withChain && spec.chain && chainEnds
    ? cableChainSvg(chainEnds[0], chainEnds[1], fill, GAUGE) +
      // Between letters and stones: a short, slightly sagging strand
      links.map(([a, b]) => cableStrand(a, { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + SIZE * 0.008 }, b, fill, small)).join('')
    : ''
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    `<g>${chain}</g><g>${glyphs.join('')}</g><g>${stoneSvg.join('')}</g></svg>`
  return { svg, gems }
}

// ─── Placeholder engine ─────────────────────────────────────────────────────

/** The selected base-field value's swatch is the metal; names are drawn in it. */
function metalColor(template: PdpTemplate, spec: PlaceholderSpec, input: PreviewInput): string | undefined {
  const field = fieldById(template, spec.base.fieldId)
  return field?.values?.find((v) => v.id === input.choices[spec.base.fieldId])?.swatchColor
}

export async function renderPlaceholder(template: PdpTemplate, spec: PlaceholderSpec, input: PreviewInput, colors: PreviewColors): Promise<string | null> {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // Base: the product shot for the selected value, or a neutral rect.
  const baseSrc = spec.base.images[input.choices[spec.base.fieldId] ?? '']
  const base = baseSrc ? await loadImage(baseSrc) : null
  if (base) {
    ctx.drawImage(base, 0, 0, SIZE, SIZE)
  } else {
    ctx.fillStyle = colors.surface
    ctx.fillRect(0, 0, SIZE, SIZE)
  }

  // Overlays swapped by a field value. Missing assets are skipped.
  for (const o of spec.overlays ?? []) {
    const src = o.images[input.choices[o.fieldId] ?? '']
    const img = src ? await loadImage(src) : null
    if (img) ctx.drawImage(img, o.box.x * SIZE, o.box.y * SIZE, o.box.w * SIZE, o.box.h * SIZE)
  }

  // Chain (while there's no base photo), text and diamonds, drawn as SVG over the canvas
  const { svg, gems } = buildLayers(spec, input, metalColor(template, spec, input) ?? colors.text, !base)
  const textImg = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
  if (textImg) ctx.drawImage(textImg, 0, 0, SIZE, SIZE)

  // Gem pictures, each in its bezel
  for (const g of gems) {
    const img = 'image' in g.look ? await loadImage(g.look.image) : null
    if (img) ctx.drawImage(img, g.x - g.d / 2, g.y - g.d / 2, g.d, g.d)
  }

  return canvas.toDataURL('image/jpeg', 0.86)
}

/** A blank slot shown while the first external render is in flight. */
export function blankPreview(colors: PreviewColors): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}"><rect width="100%" height="100%" fill="${esc(colors.surface)}"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// ─── Engine dispatch ────────────────────────────────────────────────────────

/** The placeholder spec, wherever the template keeps it (the external engine falls back to it for its fake answer). */
export function placeholderSpecOf(template: PdpTemplate): PlaceholderSpec | undefined {
  const e = template.livePreview.engine
  return e.kind === 'placeholder' ? e.spec : FAKE_EXTERNAL_SPECS.get(template.id)
}

/** Placeholder specs remembered for templates switched to the external engine by the demo toggle. */
const FAKE_EXTERNAL_SPECS = new Map<string, PlaceholderSpec>()

/**
 * The demo's `?engine=external` toggle: the same template, with its engine
 * swapped for a fake external one. Reviewing the loading state needs no
 * second template.
 */
export function withExternalEngine(template: PdpTemplate, latencyMs = 1400): PdpTemplate {
  if (template.livePreview.engine.kind !== 'placeholder') return template
  FAKE_EXTERNAL_SPECS.set(template.id, template.livePreview.engine.spec)
  return {
    ...template,
    livePreview: { ...template.livePreview, engine: { kind: 'external', endpoint: '/api/preview (not wired)', simulatedLatencyMs: latencyMs } },
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function renderPreview(template: PdpTemplate, engine: PreviewEngine, input: PreviewInput, colors: PreviewColors): Promise<string | null> {
  if (engine.kind === 'placeholder') return renderPlaceholder(template, engine.spec, input, colors)
  if (engine.kind === 'necklaceStudio') {
    return renderNecklaceStudio(engine, template.sku, input.texts[engine.textFieldId] ?? [], input.choices[engine.materialFieldId], SIZE, colors.surface)
  }
  // external: POST { sku, fields } to engine.endpoint in production.
  await wait(engine.simulatedLatencyMs ?? 1200)
  const spec = placeholderSpecOf(template)
  return spec ? renderPlaceholder(template, spec, input, colors) : blankPreview(colors)
}

/** Engines that call a server render after typing settles; the placeholder redraws per keystroke. */
export const debounceFor = (engine: PreviewEngine) => (engine.kind === 'external' ? 450 : engine.kind === 'necklaceStudio' ? 250 : 0)

/** Whether a render waits on a server — the slot shows its loading state meanwhile. */
export const isRemote = (engine: PreviewEngine) => engine.kind !== 'placeholder'

