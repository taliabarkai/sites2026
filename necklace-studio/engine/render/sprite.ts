/**
 * Plate → gold sprite PNG + sidecar, entirely in Node.
 *
 * The plate is a flat 1.1 mm extrusion (Oleg's 3D PREVIEW: Boundary
 * Surfaces → Extrude), so what the eye reads as "metal" is its edge. We build
 * that edge directly instead of rendering a mesh:
 *
 *   1. coverage mask of the outline at 2× resolution        (raster.ts)
 *   2. Euclidean distance to the boundary, per pixel        (edt below)
 *   3. quarter-round bevel height from that distance
 *   4. normal from the height gradient
 *   5. shade: base metal colour × studio environment lookup on the reflection
 *   6. downsample 2× and encode with sharp
 *
 * No headless Chrome, no WebGL. A plate renders in tens of milliseconds.
 */
import sharp from 'sharp';
import type { Polygon, Pt } from '../geom/types.ts';
import { rasterizeCoverage, mmToPx, type RasterFrame } from './raster.ts';
import type { Plate } from '../plate/solve.ts';

export const COATINGS = ['GP', 'SR', 'RGP', 'VMGP', 'VMRGP'] as const;
export type Coating = (typeof COATINGS)[number];

/** Linear base colours. GP is the accepted POC value; SR the POC's neutral 0.667. */
export const BASE: Record<Coating, [number, number, number]> = {
  GP: [1.0, 0.776, 0.369],
  VMGP: [1.0, 0.74, 0.33],
  SR: [0.667, 0.667, 0.68],
  RGP: [0.96, 0.66, 0.55],
  VMRGP: [0.93, 0.6, 0.5],
};

export type SpriteOptions = {
  coating?: Coating;
  pxPerMm?: number;
  /** Bevel radius in mm. 0.2 mm = 4 px at 20 px/mm, the POC's accepted value. */
  bevelMm?: number;
  paddingPx?: number;
};

export type SpriteSidecar = {
  format: 'tg-sprite-v1';
  productId: string;
  text: string;
  preset: string;
  coating: Coating;
  widthPx: number;
  heightPx: number;
  pxPerMm: number;
  /** Where the plate's mm origin (first glyph pivot, baseline) sits in the sprite. */
  originPx: Pt;
  plateMm: { w: number; h: number };
  /** Chain attach points: loop centres in sprite px (Y down), left first. */
  attachPx: Pt[];
  /** Loop hole radius in px — the jump ring threads through this. */
  loopHoleRadiusPx: number;
  loopOuterRadiusPx: number;
  /** Centre of mass in sprite px. */
  comPx: Pt;
  /** Same points in the plate's mm frame (Y up), for 3D consumers. */
  attachMm: Pt[];
  comMm: Pt;
  areaMm2: number;
  thicknessMm: number;
  unsupported: string[];
};

/** Felzenszwalb–Huttenlocher 1-D squared distance transform. */
function edt1d(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array) {
  let k = 0;
  v[0] = 0;
  z[0] = -Infinity;
  z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]];
  }
}

/** Distance (px) from each inside pixel to the nearest outside pixel. */
export function insideDistance(inside: Uint8Array, W: number, H: number): Float32Array {
  const INF = 1e20;
  const g = new Float64Array(W * H);
  for (let i = 0; i < W * H; i++) g[i] = inside[i] ? INF : 0;
  const n = Math.max(W, H);
  const f = new Float64Array(n), d = new Float64Array(n), z = new Float64Array(n + 1);
  const v = new Int32Array(n);
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) f[y] = g[y * W + x];
    edt1d(f, H, d, v, z);
    for (let y = 0; y < H; y++) g[y * W + x] = d[y];
  }
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) f[x] = g[y * W + x];
    edt1d(f, W, d, v, z);
    for (let x = 0; x < W; x++) out[y * W + x] = Math.sqrt(d[x]);
  }
  return out;
}

/**
 * Studio environment seen along reflection direction r (unit, z toward the
 * viewer). A large soft key from the upper left, a cooler rim from the lower
 * right, a dim floor — the classic jewellery product-shot setup.
 */
export function environment(rx: number, ry: number, rz: number): number {
  const soft = (dx: number, dy: number, dz: number, size: number) => {
    const l = Math.hypot(dx, dy, dz);
    const c = (rx * dx + ry * dy + rz * dz) / l;
    return Math.max(0, (c - (1 - size)) / size) ** 2;
  };
  const key = 1.35 * soft(-0.55, 0.6, 0.58, 0.55);
  const rim = 0.55 * soft(0.7, -0.45, 0.55, 0.35);
  const top = 0.35 * soft(0, 1, 0.15, 0.5);
  const ambient = 0.28 + 0.12 * ry;
  return ambient + key + rim + top;
}

export async function renderSprite(plate: Plate, o: SpriteOptions = {}): Promise<{ png: Buffer; sidecar: SpriteSidecar }> {
  const coating = o.coating ?? 'GP';
  const pxPerMm = o.pxPerMm ?? 20;
  const pad = o.paddingPx ?? 6;
  const bevelMm = o.bevelMm ?? 0.2;
  const SS = 2;

  const b = plate.bbox;
  const W = Math.ceil((b.maxX - b.minX) * pxPerMm) + 2 * pad;
  const H = Math.ceil((b.maxY - b.minY) * pxPerMm) + 2 * pad;
  // Frame: bbox top-left lands at (pad, pad).
  const frame: RasterFrame = {
    widthPx: W * SS,
    heightPx: H * SS,
    pxPerMm: pxPerMm * SS,
    centrePx: { x: pad * SS, y: pad * SS },
    centreMm: { x: b.minX, y: b.maxY },
    samples: 4,
  };
  const cov = rasterizeCoverage(plate.polygons, frame);
  const WW = frame.widthPx, HH = frame.heightPx;
  const inside = new Uint8Array(WW * HH);
  for (let i = 0; i < cov.length; i++) inside[i] = cov[i] >= 0.5 ? 1 : 0;
  const dist = insideDistance(inside, WW, HH);

  // Quarter-round bevel height, in px units so the gradient is dimensionless.
  const R = bevelMm * pxPerMm * SS;
  const height = new Float32Array(WW * HH);
  for (let i = 0; i < dist.length; i++) {
    if (!inside[i]) continue;
    // Sub-pixel: centre the edge on the coverage boundary.
    const d = Math.max(0, dist[i] - 0.5 + (cov[i] - 0.5));
    const t = Math.min(d, R);
    height[i] = Math.sqrt(Math.max(0, R * R - (R - t) * (R - t)));
  }

  const [br, bg, bb] = BASE[coating];
  const rgba = new Float32Array(WW * HH * 4);
  for (let y = 0; y < HH; y++) {
    for (let x = 0; x < WW; x++) {
      const i = y * WW + x;
      const a = Math.min(1, cov[i]);
      if (a <= 0) continue;
      const hL = height[y * WW + Math.max(0, x - 1)], hR = height[y * WW + Math.min(WW - 1, x + 1)];
      const hU = height[Math.max(0, y - 1) * WW + x], hD = height[Math.min(HH - 1, y + 1) * WW + x];
      // Image y grows down; flip so ny > 0 means "faces up".
      let nx = -(hR - hL) / 2, ny = (hD - hU) / 2, nz = 1;
      const nl = Math.hypot(nx, ny, nz);
      nx /= nl; ny /= nl; nz /= nl;
      // Reflect the view vector (0,0,1) about n.
      const rx = 2 * nz * nx, ry = 2 * nz * ny, rz = 2 * nz * nz - 1;
      const e = environment(rx, ry, rz);
      // Metals tint their reflection; Fresnel lifts grazing angles toward white.
      const fres = Math.pow(1 - Math.max(0, nz), 5);
      const k = i * 4;
      rgba[k] = (br * (1 - fres) + fres) * e;
      rgba[k + 1] = (bg * (1 - fres) + fres) * e;
      rgba[k + 2] = (bb * (1 - fres) + fres) * e;
      rgba[k + 3] = a;
    }
  }

  // Linear → sRGB, premultiplied downsample is done by sharp on straight alpha.
  const bytes = Buffer.alloc(WW * HH * 4);
  const srgb = (c: number) => {
    const v = Math.max(0, Math.min(1, c));
    return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
  };
  for (let i = 0; i < WW * HH; i++) {
    const k = i * 4;
    bytes[k] = srgb(rgba[k]);
    bytes[k + 1] = srgb(rgba[k + 1]);
    bytes[k + 2] = srgb(rgba[k + 2]);
    bytes[k + 3] = Math.round(255 * rgba[k + 3]);
  }
  const png = await sharp(bytes, { raw: { width: WW, height: HH, channels: 4 } })
    .resize(W, H, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const outFrame: RasterFrame = { ...frame, widthPx: W, heightPx: H, pxPerMm, centrePx: { x: pad, y: pad } };
  const sidecar: SpriteSidecar = {
    format: 'tg-sprite-v1',
    productId: plate.productId,
    text: plate.text,
    preset: plate.preset,
    coating,
    widthPx: W,
    heightPx: H,
    pxPerMm,
    originPx: mmToPx(outFrame, { x: 0, y: 0 }),
    plateMm: { w: b.maxX - b.minX, h: b.maxY - b.minY },
    attachPx: plate.loops.map((l) => mmToPx(outFrame, l.centre)),
    loopHoleRadiusPx: (plate.loops[0]?.innerRadius ?? 0) * pxPerMm,
    loopOuterRadiusPx: (plate.loops[0]?.outerRadius ?? 0) * pxPerMm,
    comPx: mmToPx(outFrame, plate.com),
    attachMm: plate.loops.map((l) => l.centre),
    comMm: plate.com,
    areaMm2: plate.areaMm2,
    thicknessMm: plate.thicknessMm,
    unsupported: plate.unsupported,
  };
  return { png, sidecar };
}

export type { Polygon };
