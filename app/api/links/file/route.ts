/** GET /api/links/file?key=<20 hex>&part=flat|edge|connection|glb — content-addressed (Name Necklace Studio). */
import { readLinksFile } from '@/necklace-studio/engine/service.ts'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const f = readLinksFile(q.get('key') ?? '', q.get('part') ?? '')
  if (!f) return new Response('not found', { status: 404 })
  return new Response(new Uint8Array(f.data), { headers: { 'Content-Type': f.type, 'Cache-Control': 'public, max-age=31536000, immutable' } })
}
