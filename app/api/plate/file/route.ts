/** GET /api/plate/file?key=<20 hex>&ext=png|glb — content-addressed, immutable (Name Necklace Studio). */
import { readPlateFile } from '@/necklace-studio/engine/service.ts'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const ext = q.get('ext') === 'glb' ? 'glb' : 'png'
  const data = readPlateFile(q.get('key') ?? '', ext)
  if (!data) return new Response('not found', { status: 404 })
  return new Response(new Uint8Array(data), {
    headers: { 'Content-Type': ext === 'glb' ? 'model/gltf-binary' : 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
