/**
 * Geometry primitives. One frame everywhere in the engine:
 *
 *   millimetres, Y UP, origin at the FIRST glyph's pivot on the baseline —
 *   exactly the frame Oleg's FONT ASSEMBLY places glyphs in.
 *
 * Renderers convert to pixels (Y down) at the very last step and nowhere else.
 */

export type Pt = { x: number; y: number };

/** A closed ring, first point NOT repeated at the end. */
export type Ring = Pt[];

/** One connected piece of metal: an outer boundary and the holes punched in it. */
export type Polygon = { outer: Ring; holes: Ring[] };

export type BBox = { minX: number; minY: number; maxX: number; maxY: number };

/** Rhino-style NURBS: `knots.length === points.length + degree - 1` (no superfluous end knots). */
export type Nurbs = {
  degree: number;
  /** [x, y, weight], Euclidean (not pre-multiplied). */
  points: [number, number, number][];
  knots: number[];
  closed?: boolean;
};

export function bboxOf(rings: Iterable<Ring>): BBox {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of rings) {
    for (const p of r) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  return { minX, minY, maxX, maxY };
}

/** Shoelace area; positive for counter-clockwise rings. */
export function signedArea(r: Ring): number {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j].x - r[i].x) * (r[j].y + r[i].y);
  return a / 2;
}

/** Area centroid of a simple ring — what Rhino's AreaMassProperties returns for a planar curve. */
export function centroid(r: Ring): Pt {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const f = r[j].x * r[i].y - r[i].x * r[j].y;
    a += f;
    cx += (r[j].x + r[i].x) * f;
    cy += (r[j].y + r[i].y) * f;
  }
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

export function translateRing(r: Ring, dx: number, dy: number): Ring {
  return r.map((p) => ({ x: p.x + dx, y: p.y + dy }));
}

/** Douglas–Peucker on a closed ring. Used for meshes, where 2 µm sampling only costs bytes. */
export function simplifyRing(r: Ring, tol: number): Ring {
  if (r.length < 8) return r;
  // Split at the two farthest-apart vertices so both halves are open polylines.
  let far = 0, best = -1;
  for (let i = 1; i < r.length; i++) {
    const d = (r[i].x - r[0].x) ** 2 + (r[i].y - r[0].y) ** 2;
    if (d > best) { best = d; far = i; }
  }
  const keep = new Uint8Array(r.length);
  keep[0] = keep[far] = 1;
  const seg = (a: number, b: number) => {
    const stack: [number, number][] = [[a, b]];
    while (stack.length) {
      const [s, e] = stack.pop()!;
      const pa = r[s], pb = r[e % r.length];
      const vx = pb.x - pa.x, vy = pb.y - pa.y, L = Math.hypot(vx, vy) || 1e-12;
      let maxD = -1, idx = -1;
      for (let k = s + 1; k < e; k++) {
        const p = r[k % r.length];
        const d = Math.abs((p.x - pa.x) * vy - (p.y - pa.y) * vx) / L;
        if (d > maxD) { maxD = d; idx = k; }
      }
      if (maxD > tol && idx > 0) {
        keep[idx % r.length] = 1;
        stack.push([s, idx], [idx, e]);
      }
    }
  };
  seg(0, far);
  seg(far, r.length);
  return r.filter((_, i) => keep[i]);
}
