/**
 * Saved settings profiles.
 *   GET                          → { active, profiles }
 *   PUT  { name, settings }      → save (and activate) a profile
 *   POST { active }              → switch the active profile
 *   DELETE ?name=                → remove a profile (the built-in one can't be removed)
 */
import { BUILTIN, deleteProfile, readStore, saveProfile, setActive, validName } from '@/engine/settingsStore.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(readStore());
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !validName(body.name)) return Response.json({ error: `profile name required (1–60 chars, not "${BUILTIN}")` }, { status: 400 });
  return Response.json(saveProfile(body.name, body.settings));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.active !== 'string') return Response.json({ error: 'active required' }, { status: 400 });
  return Response.json(setActive(body.active));
}

export async function DELETE(req: Request) {
  const name = new URL(req.url).searchParams.get('name') ?? '';
  return Response.json(deleteProfile(name));
}
