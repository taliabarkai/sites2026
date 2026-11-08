/**
 * Chain links → sprites, rendered from Oleg's own link meshes in Node.
 *
 * A tiny orthographic software rasteriser: z-buffer, barycentric normal
 * interpolation, the same studio environment and metal palette as the plate
 * sprite (sprite.ts) so links and plates read as one material.
 *
 * Oleg's CHAIN GENERATOR alternates links flat and rotated 90° about the
 * chain tangent, so the client needs two views of CHAIN LINK (`flat`,
 * `edge`) plus the CONNECTION LINK that sits flat on each plate loop.
 * Link long axis = +X, as stored in the .gh.
 */
import sharp from 'sharp';
import { BASE, environment, type Coating } from './sprite.ts';
import { smooth } from './mesh.ts';

export type LinkView = 'flat' | 'edge';

export type LinkSprite = {
  png: Buffer;
  widthPx: number;
  heightPx: number;
  /** Pixel position of the mesh origin (link centre) in the sprite. */
  centrePx: { x: number; y: number };
  pxPerMm: number;
};

/** Rotate so the camera (looking down -Z) sees the requested view. */
function view(p: [number, number, number], v: LinkView): [number, number, number] {
  // edge: rotate 90° about X — the link stands up and is seen from its side.
  return v === 'flat' ? p : [p[0], -p[2], p[1]];
}

export async function renderLink(mesh: { positions: number[]; indices: number[] }, v: LinkView, coating: Coating, pxPerMm = 20): Promise<LinkSprite> {
  const SS = 4;
  const m = smooth(mesh.positions, mesh.indices);
  const nV = m.positions.length / 3;
  const P: [number, number, number][] = [], N: [number, number, number][] = [];
  for (let i = 0; i < nV; i++) {
    P.push(view([m.positions[3 * i], m.positions[3 * i + 1], m.positions[3 * i + 2]], v));
    N.push(view([m.normals[3 * i], m.normals[3 * i + 1], m.normals[3 * i + 2]], v));
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of P) {
    minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
  }
  const pad = 2;
  const W = Math.ceil((maxX - minX) * pxPerMm) + 2 * pad;
  const H = Math.ceil((maxY - minY) * pxPerMm) + 2 * pad;
  const WW = W * SS, HH = H * SS, s = pxPerMm * SS;
  const toPx = (p: [number, number, number]) => [(p[0] - minX) * s + pad * SS, (maxY - p[1]) * s + pad * SS, p[2]];
  const S = P.map(toPx);
  const zbuf = new Float32Array(WW * HH).fill(-Infinity);
  const nbuf = new Float32Array(WW * HH * 3);
  const idx = m.indices;
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]];
    const [ax, ay, az] = S[a], [bx, by, bz] = S[b], [cx, cy, cz] = S[c];
    const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (Math.abs(area) < 1e-9) continue;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(WW - 1, Math.ceil(Math.max(ax, bx, cx)));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(HH - 1, Math.ceil(Math.max(ay, by, cy)));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / area;
        const w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const z = w0 * az + w1 * bz + w2 * cz;
        const i = y * WW + x;
        if (z <= zbuf[i]) continue;
        zbuf[i] = z;
        let nx = w0 * N[a][0] + w1 * N[b][0] + w2 * N[c][0];
        let ny = w0 * N[a][1] + w1 * N[b][1] + w2 * N[c][1];
        let nz = w0 * N[a][2] + w1 * N[b][2] + w2 * N[c][2];
        const l = Math.hypot(nx, ny, nz) || 1;
        nbuf[3 * i] = nx / l; nbuf[3 * i + 1] = ny / l; nbuf[3 * i + 2] = nz / l;
      }
    }
  }
  const [br, bg, bb] = BASE[coating];
  const srgb = (c: number) => {
    const v2 = Math.max(0, Math.min(1, c));
    return Math.round(255 * (v2 <= 0.0031308 ? 12.92 * v2 : 1.055 * Math.pow(v2, 1 / 2.4) - 0.055));
  };
  const bytes = Buffer.alloc(WW * HH * 4);
  for (let i = 0; i < WW * HH; i++) {
    if (zbuf[i] === -Infinity) continue;
    let nx = nbuf[3 * i], ny = nbuf[3 * i + 1], nz = nbuf[3 * i + 2];
    if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; } // back faces of a closed tube still face us after smoothing
    const rx = 2 * nz * nx, ry = 2 * nz * ny, rz = 2 * nz * nz - 1;
    const e = environment(rx, ry, rz);
    const fres = Math.pow(1 - nz, 5);
    bytes[4 * i] = srgb((br * (1 - fres) + fres) * e);
    bytes[4 * i + 1] = srgb((bg * (1 - fres) + fres) * e);
    bytes[4 * i + 2] = srgb((bb * (1 - fres) + fres) * e);
    bytes[4 * i + 3] = 255;
  }
  const png = await sharp(bytes, { raw: { width: WW, height: HH, channels: 4 } }).resize(W, H, { kernel: 'lanczos3' }).png().toBuffer();
  return { png, widthPx: W, heightPx: H, centrePx: { x: -minX * pxPerMm + pad, y: maxY * pxPerMm + pad }, pxPerMm };
}
