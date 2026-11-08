/**
 * GET /api/plate?sku=…&name=…&coating=GP
 * → the Name Necklace Studio's sidecar JSON + URLs for the sprite PNG and GLB.
 *
 * The browser sends only sku + name + coating; the SKU's settings are looked up
 * here (necklace-studio/HANDOFF.md §5.2). Solves and renders on a cache miss
 * (~0.1 s), then serves from disk.
 */
import { BadRequest, ensurePlate, parsePlateRequest } from '@/necklace-studio/engine/service.ts'
import { COATINGS, type Coating } from '@/necklace-studio/engine/render/sprite.ts'
import { NECKLACE_PROFILES } from '../_necklace/profiles'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const profile = NECKLACE_PROFILES[q.get('sku') ?? '']
  if (!profile) return Response.json({ error: 'unknown sku' }, { status: 404 })
  const coating = (q.get('coating') ?? 'GP') as Coating
  if (!COATINGS.includes(coating)) return Response.json({ error: 'bad coating' }, { status: 400 })
  try {
    const r = parsePlateRequest(new URLSearchParams({ ...profile, coating, name: q.get('name') ?? '' }))
    const t0 = performance.now()
    const { key, sidecar, cached } = await ensurePlate(r)
    return Response.json(
      { ...sidecar, spriteUrl: `/api/plate/file?key=${key}&ext=png`, glbUrl: `/api/plate/file?key=${key}&ext=glb` },
      { headers: { 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Solve-Ms': (performance.now() - t0).toFixed(1), 'X-Cache': cached ? 'HIT' : 'MISS' } },
    )
  } catch (e) {
    if (e instanceof BadRequest) return Response.json({ error: e.message }, { status: 400 })
    console.error(e)
    return Response.json({ error: 'plate generation failed' }, { status: 500 })
  }
}
