/** GET /api/links?coating=GP → chain link sprites, link GLB and the chain's dimensions (Name Necklace Studio). */
import { ensureLinks, readLinksFile } from '@/necklace-studio/engine/service.ts'
import { COATINGS, type Coating } from '@/necklace-studio/engine/render/sprite.ts'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const coating = (new URL(req.url).searchParams.get('coating') ?? 'GP') as Coating
  if (!COATINGS.includes(coating)) return Response.json({ error: 'bad coating' }, { status: 400 })
  const meta = await ensureLinks(coating)
  // Each link sprite rides along as a data URL — on a serverless host the
  // follow-up /api/links/file request can reach an instance without it
  for (const [part, sprite] of Object.entries(meta.sprites)) {
    const key = new URL(sprite.url, 'http://x').searchParams.get('key') ?? ''
    const f = readLinksFile(key, part)
    if (f) sprite.url = `data:image/png;base64,${f.data.toString('base64')}`
  }
  return Response.json(meta, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
