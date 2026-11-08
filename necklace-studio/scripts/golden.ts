/**
 * Golden gate: our engine against every ShapeDiver plate the POC cached.
 *
 *   node --experimental-strip-types scripts/golden.ts [--verbose]
 *
 * Reference = poc/public/plates/tg-carrie/*.json + .png, solved by
 * ShapeDiver from Oleg's live model. For each, we compare:
 *
 *   size    plate bbox w × h                         (mm)
 *   loops   both loop centres, in the lettering-centre frame (mm)
 *   iou     silhouette overlap with ShapeDiver's sprite alpha
 *
 * This is the contract that lets the port stand in for the model: when Oleg
 * edits the .gh, re-extract, re-run this, and it either passes or names the
 * plates that drifted.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { tgCarrie } from '../engine/products/tg-carrie/index.ts';
import { solvePlate } from '../engine/plate/solve.ts';
import { rasterizeAlpha } from '../engine/render/raster.ts';

// ShapeDiver-solved reference plates (sidecar JSON + sprite PNG), captured by the POC.
const REF = join(process.cwd(), 'golden', 'shapediver-reference');
const verbose = process.argv.includes('--verbose');

const SIZE_TOL_MM = 0.05;
const LOOP_TOL_MM = 0.1;
const IOU_MIN = 0.97;
const STRUCTURAL_MAX_PX = 4;

const product = tgCarrie();
type Row = { name: string; preset: string; dw: number; dh: number; dLoop: number; iou: number; structural: number; ok: boolean; note: string };
const rows: Row[] = [];

for (const f of readdirSync(REF).filter((f) => f.endsWith('.json')).sort()) {
  const ref = JSON.parse(readFileSync(join(REF, f), 'utf8'));
  if (ref.productId !== 'tg-carrie') continue;
  const preset = product.letterPresets[String(ref.letterMm)];
  if (!preset) continue;
  let plate;
  try {
    plate = solvePlate(product, ref.name, preset);
  } catch (e) {
    rows.push({ name: ref.name, preset, dw: NaN, dh: NaN, dLoop: NaN, iou: 0, structural: NaN, ok: false, note: String(e) });
    continue;
  }
  const b = plate.bbox;
  const w = b.maxX - b.minX, h = b.maxY - b.minY;
  const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
  const dw = w - ref.letteringMm.w, dh = h - ref.letteringMm.h;

  // Loop centres: sidecar stores them in sprite px (Y down) around letteringCentrePx.
  let dLoop = NaN;
  if (ref.loopCentresPx?.length === 2 && plate.loops.length === 2) {
    const refMm = ref.loopCentresPx.map((p: any) => ({
      x: (p.x - ref.letteringCentrePx.x) * ref.mmPerPx,
      y: -(p.y - ref.letteringCentrePx.y) * ref.mmPerPx,
    }));
    const ours = plate.loops.map((l) => ({ x: l.centre.x - cx, y: l.centre.y - cy }));
    dLoop = Math.max(...ours.map((o, i) => Math.hypot(o.x - refMm[i].x, o.y - refMm[i].y)));
  }

  // Silhouette IoU at the reference sprite's own resolution and framing.
  const png = sharp(join(REF, f.replace('.json', '.png')));
  const { data, info } = await png.ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const mine = rasterizeAlpha(plate.polygons, {
    widthPx: info.width,
    heightPx: info.height,
    pxPerMm: 1 / ref.mmPerPx,
    centrePx: ref.letteringCentrePx,
    centreMm: { x: cx, y: cy },
    samples: 4,
  });
  let inter = 0, uni = 0;
  for (let i = 0; i < data.length; i++) {
    const a = data[i] >= 128, m = mine[i] >= 128;
    if (a && m) inter++;
    if (a || m) uni++;
  }
  const iou = uni ? inter / uni : 0;
  // Structural error: pixels where the two disagree AND neither mask has the
  // other value within 1 px. An anti-aliasing rim scores 0; a missing serif,
  // notch or gap does not.
  const W = info.width, H = info.height;
  const near = (m: (i: number) => boolean, x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < W && yy < H && m(yy * W + xx)) return true;
    }
    return false;
  };
  let structural = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, a = data[i] >= 128, m = mine[i] >= 128;
    if (a === m) continue;
    if (a && !near((j) => mine[j] >= 128, x, y)) structural++;
    if (m && !near((j) => data[j] >= 128, x, y)) structural++;
  }
  const ok = Math.abs(dw) <= SIZE_TOL_MM && Math.abs(dh) <= SIZE_TOL_MM && (isNaN(dLoop) || dLoop <= LOOP_TOL_MM) && iou >= IOU_MIN && structural <= STRUCTURAL_MAX_PX;
  rows.push({ name: ref.name, preset, dw, dh, dLoop, iou, structural, ok, note: plate.missingAnchors.join(',') });
}

const fmt = (n: number, d = 3) => (isNaN(n) ? '   —  ' : (n >= 0 ? ' ' : '') + n.toFixed(d));
for (const r of rows) {
  if (!verbose && r.ok) continue;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(10)} ${r.preset.padEnd(9)} dw${fmt(r.dw)} dh${fmt(r.dh)} loop${fmt(r.dLoop)} iou ${r.iou.toFixed(4)} struct ${String(r.structural).padStart(3)}px ${r.note}`);
}
const pass = rows.filter((r) => r.ok).length;
const worst = rows.reduce((a, r) => Math.min(a, r.iou), 1);
const worstS = rows.reduce((a, r) => Math.max(a, r.structural), 0);
console.log(`\n${pass}/${rows.length} plates pass (size ±${SIZE_TOL_MM} mm, loops ±${LOOP_TOL_MM} mm, IoU ≥ ${IOU_MIN}); worst IoU ${worst.toFixed(4)}, worst structural ${worstS}px`);
process.exit(pass === rows.length ? 0 : 1);
