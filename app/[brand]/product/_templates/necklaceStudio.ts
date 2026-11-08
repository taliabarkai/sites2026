/**
 * The `necklaceStudio` preview engine: the Name Necklace Studio
 * (necklace-studio/, see its HANDOFF.md) drawn into the gallery's square slot.
 *
 *   server  solves each name's plate from the real lettering and renders it
 *           to a sprite PNG (/api/plate, /api/links). The browser sends only
 *           sku + name + coating — the SKU's settings live on the server.
 *   client  hangs the plates on a Matter.js chain, lets it settle under
 *           gravity, and draws the server's sprites where the simulation put
 *           them (the studio's own sprite view, framed as a product shot).
 *
 * The browser never sees an outline, a font or a setting: only PNGs and the
 * numbers the physics needs.
 */
import { Necklace, type NecklaceOptions, type PlateSpec } from '@/necklace-studio/components/necklace/physics.ts'
import { placeLinks } from '@/necklace-studio/components/necklace/chain.ts'
import type { LinksMeta, PlateMeta } from '@/necklace-studio/components/necklace/assets.ts'
import { defaults } from '@/necklace-studio/engine/settings.ts'
import type { NecklaceStudioEngine } from './pdpTemplate'

type Plate = { meta: PlateMeta; img: HTMLImageElement; spec: PlateSpec }
type Links = { meta: LinksMeta; imgs: Record<'flat' | 'edge' | 'connection', HTMLImageElement> }

// ─── Assets (cached per name + coating; the server caches by content key) ─────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image ${url}`))
    img.src = url
  })
}

const plateCache = new Map<string, Promise<Plate>>()
const linksCache = new Map<string, Promise<Links>>()

function loadPlate(sku: string, name: string, coating: string): Promise<Plate> {
  const q = new URLSearchParams({ sku, name, coating })
  const key = q.toString()
  let p = plateCache.get(key)
  if (!p) {
    p = (async () => {
      const res = await fetch(`/api/plate?${q}`)
      const meta: PlateMeta & { error?: string } = await res.json()
      if (!res.ok) throw new Error(meta.error ?? `plate ${name}`)
      const img = await loadImage(meta.spriteUrl)
      return {
        meta,
        img,
        spec: {
          attachMm: meta.attachMm,
          comMm: meta.comMm,
          plateMm: meta.plateMm,
          // The sprite is the bbox plus equal padding, so its centre is the bbox centre
          bboxCentreMm: { x: (meta.widthPx / 2 - meta.originPx.x) / meta.pxPerMm, y: -(meta.heightPx / 2 - meta.originPx.y) / meta.pxPerMm },
        },
      }
    })()
    p.catch(() => plateCache.delete(key)) // a failed name can be retried
    plateCache.set(key, p)
  }
  return p
}

function loadLinks(coating: string): Promise<Links> {
  let p = linksCache.get(coating)
  if (!p) {
    p = (async () => {
      const meta: LinksMeta = await (await fetch(`/api/links?coating=${coating}`)).json()
      const [flat, edge, connection] = await Promise.all([loadImage(meta.sprites.flat.url), loadImage(meta.sprites.edge.url), loadImage(meta.sprites.connection.url)])
      return { meta, imgs: { flat, edge, connection } }
    })()
    p.catch(() => linksCache.delete(coating))
    linksCache.set(coating, p)
  }
  return p
}

// ─── Physics ──────────────────────────────────────────────────────────────────

/** The studio's necklace defaults (the schema in engine/settings.ts). */
function necklaceOptions(plates: PlateSpec[]): NecklaceOptions {
  const s = defaults()
  const n = (k: string) => Number(s[k])
  return {
    plates,
    spacingMode: s.spacingMode === 'gap' ? 'gap' : 'model',
    gapMm: n('gapMm'),
    spaceBetweenNames: n('spaceBetweenNames'),
    chainLengthMm: n('chainLengthMm'),
    necklaceDepthMm: n('necklaceDepthMm'),
    linkPitchMm: n('linkPitchMm'),
    gravity: Boolean(s.gravity),
    gravityScale: n('gravityScale'),
    solverIterations: n('solverIterations'),
    plateMassInLinks: n('plateMassInLinks'),
    frictionAir: n('frictionAir'),
    jointStiffness: n('jointStiffness'),
    jointDamping: n('jointDamping'),
    dragStiffness: n('dragStiffness'),
    dragDamping: n('dragDamping'),
    dragSpeedMm: n('dragSpeedMm'),
    maxJointGapMm: n('maxJointGapMm'),
    plateCollisions: Boolean(s.plateCollisions),
  }
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

/**
 * Product-shot framing on the names (after the studio's layout(), for a
 * square slot): the plates' drawn outlines across about half the frame for
 * one name, most of it for several, a little below centre; the chain runs
 * out of frame toward the clasp.
 */
function frame(nk: Necklace, plates: Plate[], size: number) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  plates.forEach((pl, k) => {
    const { origin, angle } = nk.platePose(k)
    const m = pl.meta
    const c = Math.cos(angle), s = Math.sin(angle)
    for (const [px, py] of [[0, 0], [m.widthPx, 0], [0, m.heightPx], [m.widthPx, m.heightPx]]) {
      // Sprite px → plate mm (relative to its first loop) → world mm
      const lx = (px - m.attachPx[0].x) / m.pxPerMm, ly = (py - m.attachPx[0].y) / m.pxPerMm
      const x = origin.x + lx * c - ly * s, y = origin.y + lx * s + ly * c
      minX = Math.min(minX, x); maxX = Math.max(maxX, x)
      minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    }
  })
  const fill = plates.length === 1 ? 0.56 : 0.9
  const scale = Math.min((size * fill) / (maxX - minX), (size * 0.5) / (maxY - minY))
  return { scale, ox: size / 2 - ((minX + maxX) / 2) * scale, oy: size * 0.56 - ((minY + maxY) / 2) * scale }
}

/** The studio's draw order: chain links → plates → connection rings over the loops. */
function draw(ctx: CanvasRenderingContext2D, nk: Necklace, plates: Plate[], links: Links, size: number, background: string) {
  const v = frame(nk, plates, size)
  const at = (x: number, y: number) => ({ x: v.ox + x * v.scale, y: v.oy + y * v.scale })

  ctx.fillStyle = background
  ctx.fillRect(0, 0, size, size)
  ctx.imageSmoothingQuality = 'high'

  const placed = placeLinks(nk)
  const drawLink = (kind: 'flat' | 'edge' | 'connection', x: number, y: number, angle: number) => {
    const m = links.meta.sprites[kind]
    const p = at(x, y)
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(angle)
    const k = v.scale / m.pxPerMm
    ctx.scale(k, k)
    ctx.drawImage(links.imgs[kind], -m.centrePx.x, -m.centrePx.y)
    ctx.restore()
  }
  for (const l of placed) if (l.kind !== 'connection') drawLink(l.kind, l.x, l.y, l.angle)

  plates.forEach((pl, k) => {
    const pose = nk.platePose(k)
    const o = at(pose.origin.x, pose.origin.y)
    const m = pl.meta
    ctx.save()
    ctx.translate(o.x, o.y)
    ctx.rotate(pose.angle)
    const s = v.scale / m.pxPerMm
    ctx.scale(s, s)
    ctx.drawImage(pl.img, -m.attachPx[0].x, -m.attachPx[0].y)
    ctx.restore()
  })

  for (const l of placed) if (l.kind === 'connection') drawLink('connection', l.x, l.y, l.angle)
}

// ─── Engine ───────────────────────────────────────────────────────────────────

/**
 * One render: the names in the selected material's coating, settled and
 * drawn at `size`×`size` on `background`. Null when there is nothing to draw.
 */
export async function renderNecklaceStudio(
  engine: NecklaceStudioEngine,
  sku: string,
  names: string[],
  materialId: string | undefined,
  size: number,
  background: string,
): Promise<string | null> {
  const list = names.map((n) => n.trim()).filter(Boolean)
  if (list.length === 0) return null
  const coating = engine.coatings[materialId ?? ''] ?? engine.defaultCoating
  const [plates, links] = await Promise.all([Promise.all(list.map((n) => loadPlate(sku, n, coating))), loadLinks(coating)])

  const nk = new Necklace(necklaceOptions(plates.map((p) => p.spec)))
  nk.settle()

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  draw(ctx, nk, plates, links, size, background)
  return canvas.toDataURL('image/jpeg', 0.9)
}
