import { tgCarrie } from '../engine/products/tg-carrie/index.ts';
import { solvePlate } from '../engine/plate/solve.ts';
const p = tgCarrie();
for (const [name, preset] of [['Jo','CNC_9.5'],['Yossi','LC_7.5'],['Silvia','LC_7.5']] as const) {
  const t0 = performance.now();
  const plate = solvePlate(p, name, preset);
  const ms = performance.now() - t0;
  const b = plate.bbox;
  console.log(name, preset, `${ms.toFixed(1)}ms`, 'polys', plate.polygons.length, 'holes', plate.polygons.map(x=>x.holes.length),
    'bbox', (b.maxX-b.minX).toFixed(3), 'x', (b.maxY-b.minY).toFixed(3), 'glyphs', plate.glyphs.map(g=>g.name).join(' '),
    'loops', plate.loops.map(l=>`${l.role}@(${l.centre.x.toFixed(2)},${l.centre.y.toFixed(2)}) r${l.outerRadius.toFixed(2)}/${l.innerRadius.toFixed(2)}`).join(' '),
    plate.missingAnchors);
}
