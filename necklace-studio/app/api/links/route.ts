/** GET /api/links?coating=GP → chain link sprites, link GLB and the chain's dimensions. */
import { ensureLinks } from '@/engine/service.ts';
import { COATINGS, type Coating } from '@/engine/render/sprite.ts';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const coating = (new URL(req.url).searchParams.get('coating') ?? 'GP') as Coating;
  if (!COATINGS.includes(coating)) return Response.json({ error: 'bad coating' }, { status: 400 });
  return Response.json(await ensureLinks(coating), { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
