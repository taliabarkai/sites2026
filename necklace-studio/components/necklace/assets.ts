/**
 * Client-side asset loading. The browser does no geometry: it fetches what
 * the server made (sidecar JSON, sprite PNG, GLB URL) and hands numbers to the
 * physics.
 */
import type { PlateSpec, Vec } from './physics.ts';

export type PlateMeta = {
  key: string;
  text: string;
  size: string;
  coating: string;
  widthPx: number;
  heightPx: number;
  pxPerMm: number;
  attachPx: Vec[];
  originPx: Vec;
  attachMm: Vec[];
  comMm: Vec;
  areaMm2: number;
  plateMm: { w: number; h: number };
  thicknessMm: number;
  loopHoleRadiusPx: number;
  unsupported: string[];
  spriteUrl: string;
  glbUrl: string;
};

export type LinkSpriteMeta = { url: string; widthPx: number; heightPx: number; centrePx: Vec; pxPerMm: number };
export type LinksMeta = {
  pitchMm: number;
  chainLink: { lengthMm: number; widthMm: number; wireMm: number };
  connectionLink: { lengthMm: number; widthMm: number; wireMm: number };
  sprites: Record<'flat' | 'edge' | 'connection', LinkSpriteMeta>;
  glbUrl: string;
};

export type LoadedPlate = { meta: PlateMeta; img: HTMLImageElement; spec: PlateSpec; solveMs: number; cache: string };
export type LoadedLinks = { meta: LinksMeta; imgs: Record<'flat' | 'edge' | 'connection', HTMLImageElement> };

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`image ${url}`));
    img.src = url;
  });
}

/** `server` = the plate/render subset of the settings; it is part of the asset's cache key. */
export async function loadPlate(name: string, server: Record<string, string | number | boolean>, signal?: AbortSignal): Promise<LoadedPlate> {
  const q = new URLSearchParams({ name });
  for (const [k, v] of Object.entries(server)) q.set(k, String(v));
  const res = await fetch(`/api/plate?${q}`, { signal });
  const meta = await res.json();
  if (!res.ok) throw new Error(meta.error ?? `plate ${name}`);
  const img = await loadImage(meta.spriteUrl);
  return {
    meta,
    img,
    spec: {
      attachMm: meta.attachMm,
      comMm: meta.comMm,
      plateMm: meta.plateMm,
      // The sprite is the bbox plus equal padding, so its centre IS the bbox centre.
      bboxCentreMm: { x: (meta.widthPx / 2 - meta.originPx.x) / meta.pxPerMm, y: -(meta.heightPx / 2 - meta.originPx.y) / meta.pxPerMm },
    },
    solveMs: Number(res.headers.get('X-Solve-Ms') ?? 0),
    cache: res.headers.get('X-Cache') ?? '',
  };
}

export async function loadLinks(coating: string): Promise<LoadedLinks> {
  const meta: LinksMeta = await (await fetch(`/api/links?coating=${coating}`)).json();
  const [flat, edge, connection] = await Promise.all([loadImage(meta.sprites.flat.url), loadImage(meta.sprites.edge.url), loadImage(meta.sprites.connection.url)]);
  return { meta, imgs: { flat, edge, connection } };
}
