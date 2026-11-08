/**
 * Headless physics gate on the real Matter.js necklace.
 *   1. settles: residual motion ~0 after settle
 *   2. at rest no joint is open more than a hair
 *   3. a hard drag (pointer flung 300 mm away) can NOT stretch the chain:
 *      the guardrail lets go, and the worst joint opening stays small
 */
import { tgCarrie } from '../engine/products/tg-carrie/index.ts';
import { solvePlate } from '../engine/plate/solve.ts';
import { Necklace, type NecklaceOptions } from '../components/necklace/physics.ts';
import { defaults } from '../engine/settings.ts';

const p = tgCarrie();
const d = defaults() as any;
const base: Omit<NecklaceOptions, 'plates'> = {
  spacingMode: d.spacingMode, gapMm: d.gapMm, spaceBetweenNames: d.spaceBetweenNames, chainLengthMm: d.chainLengthMm, necklaceDepthMm: d.necklaceDepthMm, linkPitchMm: d.linkPitchMm,
  gravity: d.gravity, gravityScale: d.gravityScale, solverIterations: d.solverIterations, plateMassInLinks: d.plateMassInLinks, frictionAir: d.frictionAir,
  jointStiffness: d.jointStiffness, jointDamping: d.jointDamping, dragStiffness: d.dragStiffness, dragDamping: d.dragDamping, dragSpeedMm: d.dragSpeedMm, maxJointGapMm: d.maxJointGapMm, plateCollisions: d.plateCollisions,
};
let fail = 0;
for (const [mode, preset] of [['model', 'LC_7.5'], ['gap', 'LC_7.5'], ['model', 'LC_6_LEFT-LOOP'], ['model', 'CNC_11.2_CURL_MID-LOOPS']] as const) {
  for (const names of [['Yossi'], ['Anna', 'Jo'], ['Charlotte', 'Mia', 'Daniela'], ['Anna', 'Jo', 'Mia', 'Thea', 'Dan']]) {
    const plates = names.map((n) => { const s = solvePlate(p, n, preset); return { attachMm: s.loops.map((l) => l.centre), comMm: s.com, plateMm: { w: s.bbox.maxX - s.bbox.minX, h: s.bbox.maxY - s.bbox.minY }, bboxCentreMm: { x: (s.bbox.minX + s.bbox.maxX) / 2, y: (s.bbox.minY + s.bbox.maxY) / 2 } }; });
    // A realistic product never sells a chain that the plates nearly fill:
    // keep at least ~60% of the chain as chain (big CNC_11.2 plates × 5 need ~300 mm).
    const span = plates.reduce((a, q) => a + (q.attachMm.length > 1 ? Math.hypot(q.attachMm[1].x - q.attachMm[0].x, q.attachMm[1].y - q.attachMm[0].y) : 0), 0);
    const nk = new Necklace({ ...base, spacingMode: mode, plates, chainLengthMm: Math.max(base.chainLengthMm, span * 2.5) });
    const t0 = performance.now(); nk.settle(); const settleMs = performance.now() - t0;
    const before = Array.from(nk.y); nk.step(); let motion = 0; for (let i = 0; i < nk.n; i++) motion = Math.max(motion, Math.abs(nk.y[i] - before[i]));
    const rest = nk.maxJointGapMm();
    const t1 = performance.now(); for (let i = 0; i < 60; i++) nk.step(); const frame = (performance.now() - t1) / 60;
    // Hard drag: grab the middle plate and fling the pointer 300 mm down.
    const k = Math.floor(names.length / 2), com = nk.plates[k].p[2];
    nk.startDrag(com, nk.x[com], nk.y[com]);
    let peak = 0, releasedAt = -1;
    const target = { x: nk.x[com], y: nk.y[com] + 300 };
    for (let i = 0; i < 240; i++) {
      if (nk.dragging) nk.moveDrag(target.x, target.y);
      nk.step();
      peak = Math.max(peak, nk.maxJointGapMm());
      if (!nk.dragging && releasedAt < 0) releasedAt = i;
    }
    // Gentle drag: 15 mm sideways in a real pointer's small steps — must NOT release.
    nk.startDrag(com, nk.x[com], nk.y[com]);
    const sx = nk.x[com], sy = nk.y[com];
    let gentlePeak = 0;
    for (let i = 0; i < 60; i++) { nk.moveDrag(sx + (15 * Math.min(i, 30)) / 30, sy); nk.step(); gentlePeak = Math.max(gentlePeak, nk.maxJointGapMm()); }
    const heldGentle = nk.dragging; nk.endDrag();
    const ok = motion < 0.05 && rest < 0.15 && peak < 0.9 && releasedAt >= 0 && heldGentle;
    if (!ok) fail++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${(preset + ' ' + mode).padEnd(30)} ${names.join('+').padEnd(24)} links ${String(nk.links.length).padStart(3)} settle ${settleMs.toFixed(0)}ms frame ${frame.toFixed(2)}ms motion ${motion.toFixed(3)} rest-gap ${rest.toFixed(3)}mm fling-peak ${peak.toFixed(3)}mm released@${releasedAt} gentle ${heldGentle ? 'held' : 'DROPPED'} ${gentlePeak.toFixed(3)}mm`);
  }
}
process.exit(fail ? 1 : 0);
