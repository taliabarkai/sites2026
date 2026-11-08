/**
 * Polygon → anti-aliased coverage mask, in pure JS. No browser, no canvas.
 *
 * Scanline fill with S vertical sub-rows per pixel and exact horizontal span
 * coverage, even-odd across every ring (outers and holes alike — the engine's
 * polygons never overlap, so even-odd and non-zero agree).
 */
import type { Polygon, Pt } from '../geom/types.ts';

export type RasterFrame = {
  widthPx: number;
  heightPx: number;
  pxPerMm: number;
  /** Pixel position (Y down) that `centreMm` maps to. */
  centrePx: Pt;
  centreMm: Pt;
  /** Vertical sub-rows per pixel. 4 is plenty for a mask; 8 for final art. */
  samples?: number;
};

export function mmToPx(f: RasterFrame, p: Pt): Pt {
  return { x: f.centrePx.x + (p.x - f.centreMm.x) * f.pxPerMm, y: f.centrePx.y - (p.y - f.centreMm.y) * f.pxPerMm };
}

/** Coverage 0..255 per pixel, row-major. */
export function rasterizeAlpha(polys: Polygon[], f: RasterFrame): Uint8Array {
  return quantize(rasterizeCoverage(polys, f));
}

export function quantize(cov: Float32Array): Uint8Array {
  const out = new Uint8Array(cov.length);
  for (let i = 0; i < cov.length; i++) out[i] = Math.max(0, Math.min(255, Math.round(cov[i] * 255)));
  return out;
}

/** Coverage 0..1 per pixel. */
export function rasterizeCoverage(polys: Polygon[], f: RasterFrame): Float32Array {
  const W = f.widthPx, H = f.heightPx, S = f.samples ?? 4;
  const cov = new Float32Array(W * H);
  // Edges in pixel space.
  const edges: { x0: number; y0: number; x1: number; y1: number }[] = [];
  for (const poly of polys) {
    for (const ring of [poly.outer, ...poly.holes]) {
      for (let i = 0; i < ring.length; i++) {
        const a = mmToPx(f, ring[i]), b = mmToPx(f, ring[(i + 1) % ring.length]);
        if (a.y === b.y) continue;
        edges.push(a.y < b.y ? { x0: a.x, y0: a.y, x1: b.x, y1: b.y } : { x0: b.x, y0: b.y, x1: a.x, y1: a.y });
      }
    }
  }
  edges.sort((p, q) => p.y0 - q.y0);
  const w = 1 / S;
  const xs: number[] = [];
  let start = 0;
  for (let sy = 0; sy < H * S; sy++) {
    const y = (sy + 0.5) / S;
    const row = Math.floor(sy / S);
    while (start < edges.length && edges[start].y1 < y) start++;
    xs.length = 0;
    for (let e = start; e < edges.length; e++) {
      const ed = edges[e];
      if (ed.y0 > y) break;
      if (y >= ed.y0 && y < ed.y1) xs.push(ed.x0 + ((y - ed.y0) / (ed.y1 - ed.y0)) * (ed.x1 - ed.x0));
    }
    if (xs.length < 2) continue;
    xs.sort((a, b) => a - b);
    const base = row * W;
    for (let k = 0; k + 1 < xs.length; k += 2) {
      let xa = Math.max(0, xs[k]), xb = Math.min(W, xs[k + 1]);
      if (xb <= xa) continue;
      const ia = Math.floor(xa), ib = Math.floor(xb);
      if (ia === ib) {
        cov[base + ia] += (xb - xa) * w;
        continue;
      }
      cov[base + ia] += (ia + 1 - xa) * w;
      for (let i = ia + 1; i < ib; i++) cov[base + i] += w;
      if (ib < W) cov[base + ib] += (xb - ib) * w;
    }
  }
  return cov;
}
