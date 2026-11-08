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
    // A theme can give the preview its photos' own ground (OAL's light grey)
    surface: v('--live-preview-background', v('--colors-card-image-bg', v('--colors-surface-primary', 'Canvas'))),
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
interface StonePlacement { x: number; y: number; d: number; look: StoneLook; angle?: number }

/** Product content, not UI: a diamond's body, its facet lines and its edge. */
const DIAMOND = { light: '#FFFFFF', body: '#E4E9EF', facet: '#B9C2CC' }

/** A diamond cut drawn in SVG, in a thin setting of the metal. */
function diamondSvg(p: StonePlacement, metal: string, id: number): string {
  if (!('cut' in p.look)) return ''
  // Turned with the chain it's set in
  return `<g transform="rotate(${(p.angle ?? 0).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})">${diamondShape(p, metal, id)}</g>`
}

function diamondShape(p: StonePlacement, metal: string, id: number): string {
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

/** What one text layer contributes: its letters, and where a chain would hang. */
interface LayerOut {
  glyphs: string[]
  ends: [Pt, Pt] | null
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
  return { glyphs, ends: [{ x: x + w / 2 - widest / 2 - pad, y: cy }, { x: x + w / 2 + widest / 2 + pad, y: cy }] }
}

// ─── One curved necklace: the letters and stones strung along it ───────────

/** Width of one capital, as a share of the font size, for spacing letters one by one. */
const CAP_WIDTH = 0.66
/** Chain between two letters, as a share of the font size: longer with a stone set in it. */
const LINK_GAP = { stone: 1.0, plain: 0.5 }

/** A curve sampled by arc length: points, running length, and the point and angle at any length. */
function sampledCurve(points: Pt[]) {
  const cum = [0]
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y))
  const length = cum[cum.length - 1]
  const at = (s: number): { p: Pt; angle: number } => {
    const t = Math.max(0, Math.min(length, s))
    let i = 1
    while (i < cum.length - 1 && cum[i] < t) i++
    const a = points[i - 1]
    const b = points[i]
    const f = (t - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
    return { p: { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }, angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI }
  }
  return { length, at }
}

/**
 * The necklace: one cubic curve from high on the left, down through a
 * rounded bottom at `bottomY`, and back up on the right — the drape of a
 * chain worn around the neck, not two strands meeting at a pendant.
 */
function necklaceCurve(bottomY: number) {
  const top = -SIZE * 0.02
  const left = SIZE * 0.1
  const right = SIZE * 0.9
  // The cubic's lowest point (t = ½) is (P0 + 3·P1 + 3·P2 + P3) / 8 — solve for the controls' height
  const c = (8 * bottomY - 2 * top) / 6
  const p0 = { x: left, y: top }
  // Controls out past the ends: the sides fall almost straight, the bottom is broad and shallow
  const p1 = { x: left - SIZE * 0.06, y: c }
  const p2 = { x: right + SIZE * 0.06, y: c }
  const p3 = { x: right, y: top }
  const pts = Array.from({ length: 1201 }, (_, i) => {
    const t = i / 1200
    const u = 1 - t
    return {
      x: u ** 3 * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t ** 3 * p3.x,
      y: u ** 3 * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t ** 3 * p3.y,
    }
  })
  return sampledCurve(pts)
}

/** Cable links along the curve, leaving out the stretches a stone takes. */
function chainAlong(curve: ReturnType<typeof sampledCurve>, gaps: [number, number][], color: string, gauge: Gauge): string {
  const { link, wire } = gauge
  const step = link * 0.78
  const links: string[] = []
  let n = 0
  for (let s = link / 2; s < curve.length - link / 2; s += step) {
    // No link centred inside a stone: the last one reaches up to its setting
    if (gaps.some(([a, b]) => s > a && s < b)) continue
    const { p, angle } = curve.at(s)
    const ry = n++ % 2 === 0 ? link * 0.32 : wire * 0.6
    links.push(
      `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${(link / 2).toFixed(1)}" ry="${ry.toFixed(1)}" ` +
      `transform="rotate(${angle.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})" fill="none" stroke="${esc(color)}" stroke-width="${wire.toFixed(2)}"/>`,
    )
  }
  return links.join('')
}

/**
 * The letters strung on the necklace, centred at its bottom: each one hangs
 * with its top on the chain and turns with the curve, so the chain runs
 * right up to its corners. A stone, when there is one, is set in the chain
 * between each pair.
 */
function necklaceLayer(
  layer: NonNullable<PlaceholderSpec['text']>[number], values: string[], fill: string,
  stone: { look: StoneLook; scale: number } | null,
): { glyphs: string[]; stones: StonePlacement[]; chain: string } {
  const h = layer.box.h * SIZE
  const curve = necklaceCurve(layer.box.y * SIZE)
  const n = values.length
  // One initial with a stone: the stone sits on the chain beside it (the pair centred)
  const lone = !!stone && n === 1
  const gapShare = stone ? LINK_GAP.stone : LINK_GAP.plain
  // Letters as large as the box allows, the whole row kept to the lower part of the curve
  const gapsCount = lone ? 1 : n - 1
  const size = Math.max(10, Math.min(h * 0.6, (curve.length * 0.28) / (n * CAP_WIDTH + gapsCount * gapShare)))
  const letterW = size * CAP_WIDTH
  const gap = size * gapShare
  const total = n * letterW + gapsCount * gap
  const d = Math.min(gap * 0.32, size * 0.22) * (stone?.scale ?? 1)
  const glyphs: string[] = []
  const stones: StonePlacement[] = []
  const gaps: [number, number][] = []
  let s = (curve.length - total) / 2
  values.forEach((v, i) => {
    const mid = s + letterW / 2
    const { p, angle } = curve.at(mid)
    // The chain runs on across the letter's top, so whatever its shape (an A's
    // point, an L's stem) the letter hangs touching it
    glyphs.push(
      `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${angle.toFixed(1)})">` +
      `<text x="0" y="${(size * 0.3).toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="${esc(layer.font)}" font-size="${size.toFixed(1)}" fill="${esc(fill)}">${esc(v)}</text></g>`,
    )
    s += letterW
    if ((i < n - 1 || lone) && stone) {
      const at = curve.at(s + gap / 2)
      stones.push({ x: at.p.x, y: at.p.y, d, look: stone.look, angle: at.angle })
      const half = 'cut' in stone.look && stone.look.cut !== 'round' ? d * 0.65 : d / 2
      gaps.push([s + gap / 2 - half * 0.9, s + gap / 2 + half * 0.9])
    }
    if (i < n - 1) s += gap
  })
  return { glyphs, stones, chain: chainAlong(curve, gaps, fill, GAUGE) }
}

/**
 * The spec's text layers — and the chain, when `withChain` — as one
 * transparent SVG at SIZE×SIZE; plus the gem pictures to draw on top (an
 * SVG drawn as an image can't load pictures of its own). With the drawn
 * chain the letters (and any stones) are strung on one curved necklace;
 * over a real product photo they're set as plain text in their box.
 */
function buildLayers(spec: PlaceholderSpec, input: PreviewInput, fill: string, withChain: boolean): { svg: string; gems: StonePlacement[] } {
  const glyphs: string[] = []
  const stoneSvg: string[] = []
  const gems: StonePlacement[] = []
  let chain = ''
  // Where a plain chain hangs to: the first text layer that has text
  let ends: [Pt, Pt] | null = null
  const strung = withChain && !!spec.chain
  for (const layer of spec.text ?? []) {
    const typed = (input.texts[layer.fieldId] ?? []).map((t) => t.trim()).filter(Boolean)
    // Initials typed in one field become one piece each
    const raw = layer.perCharacter ? typed.join('').replace(/\s/g, '').split('') : typed
    const values = layer.uppercase ? raw.map((t) => t.toUpperCase()) : raw
    if (values.length === 0) continue
    if (strung && layer.layout !== 'stack' && !chain) {
      const stone = resolveStone(layer.separator, input)
      const out = necklaceLayer(layer, values, fill, stone)
      glyphs.push(...out.glyphs)
      chain = out.chain
      out.stones.forEach((p) => {
        if ('cut' in p.look) stoneSvg.push(diamondSvg(p, fill, stoneSvg.length))
        else {
          // A gem sits in a bezel of the metal
          stoneSvg.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(p.d * 0.62).toFixed(1)}" fill="${esc(fill)}"/>`)
          gems.push(p)
        }
      })
      continue
    }
    const out = cssFontLayer(layer, values, fill)
    glyphs.push(...out.glyphs)
    ends = ends ?? out.ends
  }
  if (strung && !chain) {
    // Nothing strung yet: the plain chain down to the text, or the pendant
    const pendant = pendantBox(spec)
    const chainEnds = ends ?? (pendant ? boxEnds(pendant) : null)
    if (chainEnds) chain = cableChainSvg(chainEnds[0], chainEnds[1], fill, GAUGE)
  }
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

