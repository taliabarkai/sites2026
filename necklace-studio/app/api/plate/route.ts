/**
 * GET /api/plate?name=Yossi&size=7.5&coating=GP
 * → sidecar JSON + URLs for the sprite PNG and the GLB.
 * Solves and renders on a cache miss (~0.1 s), then serves from disk.
 */
import { ensurePlate, parsePlateRequest, BadRequest } from '@/engine/service.ts';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const r = parsePlateRequest(new URL(req.url).searchParams);
    const t0 = performance.now();
    const { key, sidecar, cached } = await ensurePlate(r);
    return Response.json(
      { ...sidecar, spriteUrl: `/api/plate/file?key=${key}&ext=png`, glbUrl: `/api/plate/file?key=${key}&ext=glb` },
      { headers: { 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Solve-Ms': (performance.now() - t0).toFixed(1), 'X-Cache': cached ? 'HIT' : 'MISS' } },
    );
  } catch (e) {
    if (e instanceof BadRequest) return Response.json({ error: e.message }, { status: 400 });
    console.error(e);
    return Response.json({ error: 'plate generation failed' }, { status: 500 });
  }
}
