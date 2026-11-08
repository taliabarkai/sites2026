/**
 * Necklace physics on Matter.js — the POC's construction and constants
 * (poc/lib/plate/physics.ts, world.ts), driven by engine/settings.ts.
 *
 *   link    a rigid rectangle one LINK PITCH long; neighbours pinned
 *           end-to-end by zero-length constraints (stiffness 0.96, damping 0.22)
 *   plate   a rigid body centred on its centre of mass, weighing
 *           `plateMassInLinks` links; pinned to the end links AT ITS LOOP
 *           CENTRES (computed by the engine, not measured)
 *   clasps  the first and last link of the chain, static
 *   drag    a soft spring (stiffness 0.14, damping 0.06) — never a teleport —
 *           released automatically the moment any joint opens past
 *           `maxJointGapMm`. That is the guardrail: pull a necklace pinned at
 *           both ends and it goes taut, then slips out of your fingers. It
 *           cannot be stretched.
 *
 * World units are px at PX_PER_MM (the POC's 628 px / 110 mm), Y down. The
 * public arrays (`x`, `y`) are in mm so the renderers never see px.
 *
 * Initial pose: Oleg's NECKLACE GUIDE — a curve of length CHAIN LENGTH that
 * drops NECKLACE DEPTH below the clasp line — with names placed at his NAME
 * POSITIONS (centres at L·(i+1)/(n+1)) or packed with a fixed gap. Matter then
 * settles it under gravity before the first frame.
 */
import Matter from 'matter-js';

const { Engine, Bodies, Body, Composite, Constraint } = Matter;

export const PX_PER_MM = 628 / 110;

export type Vec = { x: number; y: number };

export type PlateSpec = {
  /** Loop centres and centre of mass in the plate's mm frame, Y UP (engine output).
   *  Two for two-loop presets, one for one-loop (LEFT-LOOP) presets. */
  attachMm: Vec[];
  comMm: Vec;
  plateMm: { w: number; h: number };
  /** Centre of the metal's bounding box, plate mm frame (Y up) — for plate-plate separation. */
  bboxCentreMm: Vec;
};

export type NecklaceOptions = {
  plates: PlateSpec[];
  spacingMode: 'model' | 'gap';
  gapMm: number;
  /** One-loop presets: chain distance between hanging points (SINGLE LOOP maker's SPACE BETWEEN NAMES). */
  spaceBetweenNames: number;
  chainLengthMm: number;
  necklaceDepthMm: number;
  linkPitchMm: number;
  gravity: boolean;
  gravityScale: number;
  solverIterations: number;
  plateMassInLinks: number;
  frictionAir: number;
  jointStiffness: number;
  jointDamping: number;
  dragStiffness: number;
  dragDamping: number;
  dragSpeedMm: number;
  maxJointGapMm: number;
  /** Plates bump into each other (their own rotated box); links never collide. */
  plateCollisions: boolean;
};

/**
 * Plate-plate separation is OURS, not Matter's contacts. Measured: Matter
 * contacts between bodies that are also pinned at a point jitter forever
 * (0.16 mm/frame with five hanging plates) and block drags. A position-only
 * push along the minimum overlap adds no velocity, so it cannot jitter.
 */
const SEPARATION_RATE = 0.2;

/** Drag stiffness is specified at the POC's 18 iterations; convert to per-iteration for any count. */
const POC_ITERATIONS = 18;
function perIteration(stiffness: number, iterations: number) {
  const perStep = 1 - Math.pow(1 - stiffness, POC_ITERATIONS);
  return 1 - Math.pow(1 - perStep, 1 / iterations);
}

/** p = particle indices [FIRST loop, LAST loop, COM]; a one-loop plate has LAST === FIRST. */
export type PlateState = { body: Matter.Body; anchors: Vec[]; p: [number, number, number]; hung: boolean };
export type Segment = { particles: number[] };

type Joint = { c: Matter.Constraint };

const LINK_INERTIA_MULTIPLIER = 100; // POC: the smallest value at which links stop spinning
const LINK_HEIGHT_FRAC = 0.62;
const STEP_MS = 1000 / 60;

// ---------------------------------------------------------------- guide curve

/**
 * Oleg's NECKLACE GUIDE exactly: the parabola y = depth·x_norm² over a chord
 * of CHAIN LENGTH, then scaled uniformly about the origin until its own
 * length IS the chain length. So NECKLACE DEPTH sets the curve's proportions
 * (rise : chord), not an absolute drop — 200 / 121 gives clasps ~140 mm apart
 * with ~85 mm of sag. Y is flipped to our Y-down frame: clasps at y = 0.
 */
function guideFor(lengthMm: number, depthMm: number) {
  const raw = (u: number) => ({ x: u * lengthMm, y: depthMm * (u * 2 - 1) ** 2 });
  let arc = 0;
  for (let i = 1, p = raw(0); i <= 2000; i++) {
    const q = raw(i / 2000);
    arc += Math.hypot(q.x - p.x, q.y - p.y);
    p = q;
  }
  const k = lengthMm / arc;
  const W = lengthMm * k, depth = depthMm * k;
  const N = 2000;
  const pts: Vec[] = [], acc: number[] = [0];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    // Clasps at y = 0, lowest point `depth` below (Y down).
    pts.push({ x: t * W, y: depth * (1 - (t * 2 - 1) ** 2) });
    if (i) acc.push(acc[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  const total = acc[N];
  const at = (s: number): Vec & { angle: number } => {
    const u = Math.max(0, Math.min(total, s));
    let lo2 = 0, hi2 = N;
    while (hi2 - lo2 > 1) {
      const m = (lo2 + hi2) >> 1;
      if (acc[m] < u) lo2 = m; else hi2 = m;
    }
    const f = (u - acc[lo2]) / (acc[hi2] - acc[lo2] || 1);
    const a = pts[lo2], b = pts[hi2];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, angle: Math.atan2(b.y - a.y, b.x - a.x) };
  };
  return { width: W, depth, total, at };
}

// ---------------------------------------------------------------- necklace

export class Necklace {
  engine: Matter.Engine;
  opts: NecklaceOptions;
  links: Matter.Body[] = [];
  plates: PlateState[] = [];
  segments: Segment[] = [];
  joints: Joint[] = [];
  /** Public particle arrays (mm): link centres, plate loop centres, plate COMs. */
  x = new Float64Array(0);
  y = new Float64Array(0);
  w = new Float64Array(0);
  n = 0;
  private particleBody: { body: Matter.Body; local: Vec }[] = [];
  private dragC: Matter.Constraint | null = null;
  /** Where the pointer is; the constraint's anchor chases it at most dragSpeedMm per frame. */
  private dragTarget: Vec | null = null;
  /** Joint gap when the drag began: the guardrail limits what the DRAG adds, not what the plates' weight already causes. */
  private dragBaselineMm = 0;
  /** Set when the guardrail let go of a drag; cleared on the next grab. */
  released = false;
  width = 0;

  constructor(o: NecklaceOptions) {
    this.opts = o;
    this.engine = Engine.create({
      constraintIterations: Math.round(o.solverIterations),
      positionIterations: 12,
      velocityIterations: 8,
    });
    this.engine.gravity.y = o.gravity ? o.gravityScale : 0;
    this.build();
    this.sync();
  }

  private plateFilter() {
    return { group: -1 };
  }

  /** The plate's metal box as an oriented rectangle in world px: centre, half sizes, axes. */
  private plateBox(k: number) {
    const pl = this.plates[k], spec = this.opts.plates[k];
    const off = { x: (spec.bboxCentreMm.x - spec.comMm.x) * PX_PER_MM, y: -(spec.bboxCentreMm.y - spec.comMm.y) * PX_PER_MM };
    const a = pl.body.angle, c = Math.cos(a), sn = Math.sin(a);
    return {
      cx: pl.body.position.x + off.x * c - off.y * sn,
      cy: pl.body.position.y + off.x * sn + off.y * c,
      hw: (spec.plateMm.w * PX_PER_MM) / 2,
      hh: (spec.plateMm.h * PX_PER_MM) / 2,
      ax: [{ x: c, y: sn }, { x: -sn, y: c }],
    };
  }

  /** SAT on every plate pair; push overlapping pairs apart, position only. */
  private separatePlates() {
    const n = this.plates.length;
    if (n < 2) return;
    const boxes = this.plates.map((_, k) => this.plateBox(k));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const A = boxes[i], B = boxes[j];
        const dx = B.cx - A.cx, dy = B.cy - A.cy;
        let best = Infinity, nx = 0, ny = 0;
        for (const axis of [...A.ax, ...B.ax]) {
          const rA = A.hw * Math.abs(A.ax[0].x * axis.x + A.ax[0].y * axis.y) + A.hh * Math.abs(A.ax[1].x * axis.x + A.ax[1].y * axis.y);
          const rB = B.hw * Math.abs(B.ax[0].x * axis.x + B.ax[0].y * axis.y) + B.hh * Math.abs(B.ax[1].x * axis.x + B.ax[1].y * axis.y);
          const d = dx * axis.x + dy * axis.y;
          const overlap = rA + rB - Math.abs(d);
          if (overlap <= 0) { best = 0; break; }
          if (overlap < best) { best = overlap; const sg = d < 0 ? -1 : 1; nx = axis.x * sg; ny = axis.y * sg; }
        }
        if (best <= 0 || best === Infinity) continue;
        const push = (best * SEPARATION_RATE) / 2;
        const bi = this.plates[i].body, bj = this.plates[j].body;
        // Body.translate moves position AND positionPrev: no velocity is injected.
        Body.translate(bi, { x: -nx * push, y: -ny * push });
        Body.translate(bj, { x: nx * push, y: ny * push });
      }
    }
  }

  private linkBody(x: number, y: number, angle: number, pinned: boolean) {
    const p = this.opts.linkPitchMm * PX_PER_MM;
    const b = Bodies.rectangle(x, y, p, p * LINK_HEIGHT_FRAC, {
      isStatic: pinned,
      frictionAir: this.opts.frictionAir,
      collisionFilter: { group: -1 },
      angle,
    });
    if (!pinned) Body.setInertia(b, b.inertia * LINK_INERTIA_MULTIPLIER);
    this.links.push(b);
    return b;
  }

  /** Pin body-local point `pa` of a to body-local point `pb` of b. */
  private join(a: Matter.Body, pa: Vec, b: Matter.Body, pb: Vec) {
    // Matter stores constraint points as world-oriented offsets at creation
    // time and rotates them as the bodies turn — so rotate the local points
    // by each body's current angle first.
    const rot = (v: Vec, t: number) => ({ x: v.x * Math.cos(t) - v.y * Math.sin(t), y: v.x * Math.sin(t) + v.y * Math.cos(t) });
    const c = Constraint.create({ bodyA: a, pointA: rot(pa, a.angle), bodyB: b, pointB: rot(pb, b.angle), length: 0, stiffness: this.opts.jointStiffness, damping: this.opts.jointDamping });
    c.render.visible = false;
    this.joints.push({ c });
    return c;
  }

  private build() {
    if (this.opts.plates.some((p) => p.attachMm.length < 2)) return this.buildHanging();
    const o = this.opts;
    const ppm = PX_PER_MM;
    const pitch = o.linkPitchMm;
    const guide = guideFor(o.chainLengthMm, o.necklaceDepthMm);
    this.width = guide.width;

    // ---- where each plate's span sits on the guide (arc length, mm)
    const spans = o.plates.map((p) => Math.hypot(p.attachMm[1].x - p.attachMm[0].x, p.attachMm[1].y - p.attachMm[0].y));
    const n = o.plates.length;
    let starts: number[];
    if (o.spacingMode === 'model') {
      // NAME POSITIONS: centres at L·(i+1)/(n+1).
      starts = spans.map((s, i) => (guide.total * (i + 1)) / (n + 1) - s / 2);
      // Never let neighbours overlap: keep at least one link between them.
      for (let i = 1; i < n; i++) starts[i] = Math.max(starts[i], starts[i - 1] + spans[i - 1] + pitch);
    } else {
      const block = spans.reduce((a, b) => a + b, 0) + o.gapMm * (n - 1);
      let s0 = guide.total / 2 - block / 2;
      starts = spans.map((s) => {
        const at = s0;
        s0 += s + o.gapMm;
        return at;
      });
    }

    const world: Matter.Body[] = [];
    // ---- plates
    o.plates.forEach((p, k) => {
      const mid = guide.at(starts[k] + spans[k] / 2);
      // Local Y-down frame centred on the COM.
      const local = (v: Vec) => ({ x: (v.x - p.comMm.x) * ppm, y: -(v.y - p.comMm.y) * ppm });
      const anchors: Vec[] = [local(p.attachMm[0]), local(p.attachMm[1])];
      const restAngle = Math.atan2(anchors[1].y - anchors[0].y, anchors[1].x - anchors[0].x);
      const angle = mid.angle - restAngle;
      // Place so the midpoint of the two loops lands on the guide.
      const m = { x: (anchors[0].x + anchors[1].x) / 2, y: (anchors[0].y + anchors[1].y) / 2 };
      const c = Math.cos(angle), s = Math.sin(angle);
      const body = Bodies.rectangle(mid.x * ppm - (m.x * c - m.y * s), mid.y * ppm - (m.x * s + m.y * c), p.plateMm.w * ppm, p.plateMm.h * ppm, {
        frictionAir: o.frictionAir,
        collisionFilter: this.plateFilter(),
        angle,
      });
      // The rectangle's centre IS the COM (we built it there); give it a plate's weight.
      const linkMass = pitch * ppm * pitch * ppm * LINK_HEIGHT_FRAC * 0.001;
      Body.setMass(body, linkMass * o.plateMassInLinks);
      world.push(body);
      this.plates.push({ body, anchors, p: [0, 0, 0], hung: false });
    });

    // ---- chain runs: clasp → plate 1, plate i → plate i+1, plate n → clasp
    const runs: { from: number; to: number; a: { body: Matter.Body; pt: Vec } | null; b: { body: Matter.Body; pt: Vec } | null }[] = [];
    runs.push({ from: 0, to: starts[0], a: null, b: { body: this.plates[0].body, pt: this.plates[0].anchors[0] } });
    for (let k = 0; k + 1 < n; k++) {
      runs.push({ from: starts[k] + spans[k], to: starts[k + 1], a: { body: this.plates[k].body, pt: this.plates[k].anchors[1] }, b: { body: this.plates[k + 1].body, pt: this.plates[k + 1].anchors[0] } });
    }
    runs.push({ from: starts[n - 1] + spans[n - 1], to: guide.total, a: { body: this.plates[n - 1].body, pt: this.plates[n - 1].anchors[1] }, b: null });

    const half = (pitch * ppm) / 2;
    const segBodies: Matter.Body[][] = [];
    for (const run of runs) {
      const length = Math.max(pitch, run.to - run.from);
      const count = Math.max(1, Math.round(length / pitch));
      const step = length / count;
      const bodies: Matter.Body[] = [];
      for (let i = 0; i < count; i++) {
        const g = guide.at(run.from + (i + 0.5) * step);
        const pinned = (run.a === null && i === 0) || (run.b === null && i === count - 1);
        bodies.push(this.linkBody(g.x * ppm, g.y * ppm, g.angle, pinned));
      }
      for (let i = 0; i + 1 < bodies.length; i++) this.join(bodies[i], { x: half, y: 0 }, bodies[i + 1], { x: -half, y: 0 });
      if (run.a) this.join(run.a.body, run.a.pt, bodies[0], { x: -half, y: 0 });
      if (run.b) this.join(bodies[bodies.length - 1], { x: half, y: 0 }, run.b.body, run.b.pt);
      world.push(...bodies);
      segBodies.push(bodies);
    }
    Composite.add(this.engine.world, [...world, ...this.joints.map((j) => j.c)]);

    // ---- particle index: plates first (FIRST, LAST, COM), then each run's
    // [start loop | first link, ...links..., end loop | last link].
    const pb = this.particleBody;
    this.plates.forEach((pl) => {
      pl.p = [pb.length, pb.length + 1, pb.length + 2];
      pb.push({ body: pl.body, local: pl.anchors[0] }, { body: pl.body, local: pl.anchors[1] }, { body: pl.body, local: { x: 0, y: 0 } });
    });
    runs.forEach((run, r) => {
      const ids: number[] = [];
      if (run.a) ids.push(this.plates[r - 1].p[1]);
      for (const b of segBodies[r]) {
        ids.push(pb.length);
        pb.push({ body: b, local: { x: 0, y: 0 } });
      }
      if (run.b) ids.push(this.plates[r].p[0]);
      this.segments.push({ particles: ids });
    });
    this.n = pb.length;
    this.x = new Float64Array(this.n);
    this.y = new Float64Array(this.n);
    this.w = new Float64Array(this.n);
    pb.forEach((q, i) => (this.w[i] = q.body.isStatic ? 0 : 1));
  }

  /**
   * One-loop presets: ONE continuous chain from clasp to clasp, and each plate
   * hanging from a single point on it — Oleg's SINGLE LOOP maker. Hanging
   * points are centred on the chain and SPACE BETWEEN NAMES apart; each plate
   * starts with its centre of mass straight below its loop and is pinned at
   * the loop centre to the end of the nearest link.
   */
  private buildHanging() {
    const o = this.opts;
    const ppm = PX_PER_MM;
    const pitch = o.linkPitchMm;
    const guide = guideFor(o.chainLengthMm, o.necklaceDepthMm);
    this.width = guide.width;
    const count = Math.max(2, Math.round(guide.total / pitch));
    const step = guide.total / count;
    const half = (pitch * ppm) / 2;
    const links: Matter.Body[] = [];
    for (let i = 0; i < count; i++) {
      const g = guide.at((i + 0.5) * step);
      links.push(this.linkBody(g.x * ppm, g.y * ppm, g.angle, i === 0 || i === count - 1));
    }
    for (let i = 0; i + 1 < links.length; i++) this.join(links[i], { x: half, y: 0 }, links[i + 1], { x: -half, y: 0 });

    const n = o.plates.length;
    const world: Matter.Body[] = [...links];
    o.plates.forEach((p, k) => {
      const s = guide.total / 2 + (k - (n - 1) / 2) * o.spaceBetweenNames;
      const li = Math.max(1, Math.min(count - 2, Math.round(s / step) - 1));
      const hangAt = guide.at((li + 1) * step); // the joint at the end of link li
      const a = { x: (p.attachMm[0].x - p.comMm.x) * ppm, y: -(p.attachMm[0].y - p.comMm.y) * ppm };
      // Rotate so the COM sits straight below the loop.
      const angle = Math.PI / 2 - Math.atan2(-a.y, -a.x);
      const c = Math.cos(angle), sn = Math.sin(angle);
      const body = Bodies.rectangle(hangAt.x * ppm - (a.x * c - a.y * sn), hangAt.y * ppm - (a.x * sn + a.y * c), p.plateMm.w * ppm, p.plateMm.h * ppm, {
        frictionAir: o.frictionAir,
        collisionFilter: this.plateFilter(),
        angle,
      });
      const linkMass = pitch * ppm * pitch * ppm * LINK_HEIGHT_FRAC * 0.001;
      Body.setMass(body, linkMass * o.plateMassInLinks);
      this.join(links[li], { x: half, y: 0 }, body, a);
      world.push(body);
      this.plates.push({ body, anchors: [a], p: [0, 0, 0], hung: true });
    });
    Composite.add(this.engine.world, [...world, ...this.joints.map((j) => j.c)]);

    const pb = this.particleBody;
    this.plates.forEach((pl) => {
      pl.p = [pb.length, pb.length, pb.length + 1];
      pb.push({ body: pl.body, local: pl.anchors[0] }, { body: pl.body, local: { x: 0, y: 0 } });
    });
    const ids: number[] = [];
    for (const b of links) {
      ids.push(pb.length);
      pb.push({ body: b, local: { x: 0, y: 0 } });
    }
    this.segments.push({ particles: ids });
    this.n = pb.length;
    this.x = new Float64Array(this.n);
    this.y = new Float64Array(this.n);
    this.w = new Float64Array(this.n);
    pb.forEach((q, i) => (this.w[i] = q.body.isStatic ? 0 : 1));
  }

  /** Body state → public mm arrays. */
  private sync() {
    this.particleBody.forEach((q, i) => {
      const c = Math.cos(q.body.angle), s = Math.sin(q.body.angle);
      this.x[i] = (q.body.position.x + q.local.x * c - q.local.y * s) / PX_PER_MM;
      this.y[i] = (q.body.position.y + q.local.x * s + q.local.y * c) / PX_PER_MM;
    });
  }

  step() {
    if (this.dragC && this.dragTarget) {
      const a = this.dragC.pointA, t = this.dragTarget;
      const dx = t.x - a.x, dy = t.y - a.y, d = Math.hypot(dx, dy), max = this.opts.dragSpeedMm * PX_PER_MM;
      this.dragC.pointA = d <= max ? { ...t } : { x: a.x + (dx / d) * max, y: a.y + (dy / d) * max };
    }
    Engine.update(this.engine, STEP_MS);
    if (this.opts.plateCollisions) this.separatePlates();
    if (this.dragC && this.maxJointGapMm() > this.dragBaselineMm + this.opts.maxJointGapMm) this.endDrag(true);
    this.sync();
  }

  /** Settle under gravity before the first frame, then stop all motion. */
  settle(steps = 300) {
    for (let i = 0; i < steps; i++) {
      Engine.update(this.engine, STEP_MS);
      if (this.opts.plateCollisions) this.separatePlates();
    }
    for (const b of Composite.allBodies(this.engine.world)) {
      Body.setVelocity(b, { x: 0, y: 0 });
      Body.setAngularVelocity(b, 0);
    }
    this.sync();
  }

  /** Largest opening at any chain joint, mm — the "no stretch" measure. */
  maxJointGapMm(): number {
    let m = 0;
    for (const { c } of this.joints) {
      const a = Constraint.pointAWorld(c), b = Constraint.pointBWorld(c);
      m = Math.max(m, Math.hypot(a.x - b.x, a.y - b.y));
    }
    return m / PX_PER_MM;
  }

  maxStretch(): number {
    return this.maxJointGapMm();
  }

  platePose(k: number): { origin: Vec; angle: number } {
    const pl = this.plates[k];
    return { origin: { x: this.x[pl.p[0]], y: this.y[pl.p[0]] }, angle: pl.body.angle };
  }

  pick(x: number, y: number, radiusMm: number, plateHit?: (k: number) => boolean): number | null {
    if (plateHit) for (let k = this.plates.length - 1; k >= 0; k--) if (plateHit(k)) return this.plates[k].p[2];
    let best: number | null = null, bd = radiusMm * radiusMm;
    for (let i = 0; i < this.n; i++) {
      if (this.w[i] === 0) continue;
      const d = (this.x[i] - x) ** 2 + (this.y[i] - y) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }

  /** Grab particle i at world point (x, y) mm. The grab point stays where the pointer touched the body. */
  startDrag(i: number, x: number, y: number) {
    this.endDrag();
    this.released = false;
    const q = this.particleBody[i];
    if (!q || q.body.isStatic) return;
    const px = x * PX_PER_MM, py = y * PX_PER_MM;
    const off = { x: px - q.body.position.x, y: py - q.body.position.y };
    const it = Math.round(this.opts.solverIterations);
    this.dragC = Constraint.create({ pointA: { x: px, y: py }, bodyB: q.body, pointB: off, length: 0, stiffness: perIteration(this.opts.dragStiffness, it), damping: this.opts.dragDamping });
    this.dragTarget = { x: px, y: py };
    this.dragBaselineMm = this.maxJointGapMm();
    Composite.add(this.engine.world, this.dragC);
  }

  moveDrag(x: number, y: number) {
    if (this.dragC) this.dragTarget = { x: x * PX_PER_MM, y: y * PX_PER_MM };
  }

  endDrag(byGuardrail = false) {
    if (!this.dragC) return;
    Composite.remove(this.engine.world, this.dragC);
    this.dragC = null;
    this.dragTarget = null;
    if (byGuardrail) this.released = true;
  }

  get dragging() {
    return this.dragC !== null;
  }
}
