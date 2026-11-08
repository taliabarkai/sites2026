/**
 * The server-side entry point the Next.js routes call.
 *
 *   request (name, letter size, coating)
 *     → content key  = sha1(ENGINE_VERSION, product data hash, preset, name, coating)
 *     → disk cache   .cache/studio/<key>.{json,png,glb}
 *     → on miss: solve (~10 ms) + render (~70 ms sprite, ~30 ms GLB), write, return
 *
 * Everything is deterministic, so the key IS the asset: a CDN in front of
 * these routes can cache forever (`immutable`). Re-extracting a changed .gh
 * changes the data hash, which retires every key without anyone deleting
 * files.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { tgCarrie } from './products/tg-carrie/index.ts';
import { solvePlate } from './plate/solve.ts';
import { renderSprite, COATINGS, type Coating, type SpriteSidecar } from './render/sprite.ts';
import { plateGlb, linksGlb } from './render/mesh.ts';
import { renderLink, type LinkView } from './render/linkSprite.ts';
import { sanitize, serverSubset, type Settings } from './settings.ts';
import { STUDIO_ROOT } from './root.ts';

/** Bump when a change here alters any output byte. */
export const ENGINE_VERSION = 4;

// Serverless hosts (Vercel) only let a function write under the temp dir;
// the deployed project folder is read-only. Only the path changes.
const CACHE = process.env.VERCEL || process.env.STUDIO_CACHE_TMP
  ? join(tmpdir(), 'necklace-studio')
  : join(STUDIO_ROOT, '.cache', 'studio');
const DATA = join(STUDIO_ROOT, 'engine', 'products', 'tg-carrie', 'data');

let dataHash: string | null = null;
function productDataHash(): string {
  if (dataHash) return dataHash;
  const h = createHash('sha1');
  for (const f of readdirSync(DATA).filter((f) => f.endsWith('.json')).sort()) h.update(f).update(readFileSync(join(DATA, f)));
  return (dataHash = h.digest('hex').slice(0, 12));
}

export class BadRequest extends Error {}

export type PlateRequest = { name: string; settings: Settings };

/** Query = name + any settings keys (engine/settings.ts). Unknown keys ignored, values clamped. */
export function parsePlateRequest(q: URLSearchParams): PlateRequest {
  const name = (q.get('name') ?? '').normalize('NFC');
  if (!name.trim()) throw new BadRequest('name is required');
  if ([...name.trim()].length > tgCarrie().maxNameLength) throw new BadRequest(`name longer than ${tgCarrie().maxNameLength}`);
  const raw: Record<string, string> = {};
  q.forEach((v, k) => { if (k !== 'name') raw[k] = v; });
  // Back-compat with the first version's ?size=7.5 shortcut.
  if (raw.size && !raw.preset) raw.preset = tgCarrie().letterPresets[raw.size] ?? '';
  return { name, settings: sanitize(raw) };
}

export function plateKey(r: PlateRequest): string {
  return createHash('sha1')
    .update(JSON.stringify([ENGINE_VERSION, productDataHash(), 'tg-carrie', r.name.trim(), serverSubset(r.settings)]))
    .digest('hex')
    .slice(0, 20);
}

function writeAtomic(path: string, data: Buffer | Uint8Array | string) {
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, data);
  renameSync(tmp, path);
}

/** In-flight de-duplication: N shoppers typing the same name cause one solve. */
const inflight = new Map<string, Promise<void>>();

async function build(r: PlateRequest, key: string): Promise<void> {
  const product = tgCarrie();
  const st = r.settings;
  const plate = solvePlate(product, r.name, String(st.preset), {
    overrideValue: Number(st.overrideValue),
    minHoleArea: Number(st.minHoleArea),
    missingGlyphWidth: Number(st.missingGlyphWidth),
    thickness: Number(st.thickness),
    flatInscriptions: Boolean(st.flatInscriptions),
  });
  // Two-loop presets need both loops, one-loop presets (LEFT-LOOP) their one.
  // Oleg's anchor data has no anchor for some symbols (e.g. a trailing "~");
  // the definition reports them as Missing and so do we — before caching.
  const scheme = product.schemes[product.presets[String(st.preset)].loop_scheme_index];
  const expected = Object.values(scheme.anchors).some((a) => a.LAST) ? 2 : 1;
  if (plate.loops.length !== expected) {
    throw new BadRequest(`"${plate.text}" can't hang on this chain: no loop anchor for ${plate.missingAnchors.join(', ')}`);
  }
  const coating = st.coating as Coating;
  const [{ png, sidecar }, glb] = await Promise.all([renderSprite(plate, { coating, bevelMm: Number(st.bevelMm) }), plateGlb(plate, coating)]);
  mkdirSync(CACHE, { recursive: true });
  writeAtomic(join(CACHE, `${key}.png`), png);
  writeAtomic(join(CACHE, `${key}.glb`), glb);
  // Sidecar last: its presence is what marks the entry complete.
  writeAtomic(join(CACHE, `${key}.json`), JSON.stringify({ ...sidecar, key }));
}

export async function ensurePlate(r: PlateRequest): Promise<{ key: string; sidecar: SpriteSidecar & { key: string }; cached: boolean }> {
  const key = plateKey(r);
  const meta = join(CACHE, `${key}.json`);
  let cached = existsSync(meta);
  if (!cached) {
    let p = inflight.get(key);
    if (!p) {
      p = build(r, key).finally(() => inflight.delete(key));
      inflight.set(key, p);
    }
    await p;
  }
  return { key, sidecar: JSON.parse(readFileSync(meta, 'utf8')), cached };
}

export function readPlateFile(key: string, ext: 'png' | 'glb'): Buffer | null {
  if (!/^[0-9a-f]{20}$/.test(key)) return null;
  const f = join(CACHE, `${key}.${ext}`);
  return existsSync(f) ? readFileSync(f) : null;
}

// ---------------------------------------------------------------- chain links

export type LinksMeta = {
  pitchMm: number;
  chainLink: { lengthMm: number; widthMm: number; wireMm: number };
  connectionLink: { lengthMm: number; widthMm: number; wireMm: number };
  sprites: Record<'flat' | 'edge' | 'connection', { url: string; widthPx: number; heightPx: number; centrePx: { x: number; y: number }; pxPerMm: number }>;
  glbUrl: string;
};

const LINK_PX_PER_MM = 40;

export async function ensureLinks(coating: Coating): Promise<LinksMeta> {
  const product = tgCarrie();
  const key = createHash('sha1').update(JSON.stringify([ENGINE_VERSION, productDataHash(), 'links', coating, LINK_PX_PER_MM])).digest('hex').slice(0, 20);
  const meta = join(CACHE, `links-${key}.json`);
  if (!existsSync(meta)) {
    mkdirSync(CACHE, { recursive: true });
    const views: [string, { positions: number[]; indices: number[] }, LinkView][] = [
      ['flat', product.chainLink, 'flat'],
      ['edge', product.chainLink, 'edge'],
      ['connection', product.connectionLink, 'flat'],
    ];
    const sprites: any = {};
    for (const [name, mesh, view] of views) {
      const s = await renderLink(mesh, view, coating, LINK_PX_PER_MM);
      writeAtomic(join(CACHE, `links-${key}-${name}.png`), s.png);
      sprites[name] = { url: `/api/links/file?key=${key}&part=${name}`, widthPx: s.widthPx, heightPx: s.heightPx, centrePx: s.centrePx, pxPerMm: s.pxPerMm };
    }
    writeAtomic(join(CACHE, `links-${key}.glb`), await linksGlb({ chainLink: product.chainLink, connectionLink: product.connectionLink }, coating));
    const m: LinksMeta = {
      pitchMm: product.linkPitchMm,
      chainLink: product.chainLinkDims,
      connectionLink: product.connectionLinkDims,
      sprites,
      glbUrl: `/api/links/file?key=${key}&part=glb`,
    };
    writeAtomic(meta, JSON.stringify(m));
  }
  return JSON.parse(readFileSync(meta, 'utf8'));
}

export function readLinksFile(key: string, part: string): { data: Buffer; type: string } | null {
  if (!/^[0-9a-f]{20}$/.test(key) || !['flat', 'edge', 'connection', 'glb'].includes(part)) return null;
  const f = part === 'glb' ? join(CACHE, `links-${key}.glb`) : join(CACHE, `links-${key}-${part}.png`);
  return existsSync(f) ? { data: readFileSync(f), type: part === 'glb' ? 'model/gltf-binary' : 'image/png' } : null;
}
