/**
 * NURBS evaluation and adaptive flattening.
 *
 * Every curve in the font and every internalised curve from the .gh arrives as
 * a Rhino-style NURBS (see ../../extract/extract_gh.py). The engine never does
 * curve maths beyond this file: it flattens to polylines at a fixed chord
 * tolerance and hands rings to Clipper. 2 µm is ~1/25 of a sprite pixel at
 * 20 px/mm and far below anything a laser or CNC resolves.
 */
import type { Nurbs, Pt, Ring } from './types.ts';

export const CHORD_TOLERANCE_MM = 0.002;
const MAX_DEPTH = 12;

/** Rhino stores n+p-1 knots; the textbook vector has n+p+1. Re-add the end knots. */
function fullKnots(c: Nurbs): number[] {
  const k = c.knots;
  return [k[0], ...k, k[k.length - 1]];
}

/** Rational de Boor at parameter t. */
export function evaluate(c: Nurbs, t: number, U = fullKnots(c)): Pt {
  const p = c.degree;
  const n = c.points.length - 1;
  // Locate span: U[s] <= t < U[s+1], clamped to the last non-empty span.
  let s = p;
  if (t >= U[n + 1]) s = n;
  else {
    let lo = p, hi = n + 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (t < U[mid]) hi = mid; else lo = mid;
    }
    s = lo;
  }
  const dx: number[] = [], dy: number[] = [], dw: number[] = [];
  for (let j = 0; j <= p; j++) {
    const [x, y, w] = c.points[s - p + j];
    dx[j] = x * w; dy[j] = y * w; dw[j] = w;
  }
  for (let r = 1; r <= p; r++) {
    for (let j = p; j >= r; j--) {
      const i = s - p + j;
      const den = U[i + p - r + 1] - U[i];
      const a = den === 0 ? 0 : (t - U[i]) / den;
      dx[j] = (1 - a) * dx[j - 1] + a * dx[j];
      dy[j] = (1 - a) * dy[j - 1] + a * dy[j];
      dw[j] = (1 - a) * dw[j - 1] + a * dw[j];
    }
  }
  return { x: dx[p] / dw[p], y: dy[p] / dw[p] };
}

function distToChord(p: Pt, a: Pt, b: Pt): number {
  const vx = b.x - a.x, vy = b.y - a.y;
  const len2 = vx * vx + vy * vy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / len2));
  return Math.hypot(p.x - (a.x + t * vx), p.y - (a.y + t * vy));
}

/**
 * Flatten one NURBS to a polyline. Each knot span is subdivided until the
 * curve's midpoint and quarter points sit within tolerance of the chord, so
 * tight script turns get dense sampling and straight runs stay cheap.
 */
export function flatten(c: Nurbs, tol = CHORD_TOLERANCE_MM): Pt[] {
  const U = fullKnots(c);
  const p = c.degree;
  const n = c.points.length - 1;
  const out: Pt[] = [];
  const rec = (t0: number, a: Pt, t1: number, b: Pt, depth: number) => {
    const tm = (t0 + t1) / 2;
    const m = evaluate(c, tm, U);
    const q1 = evaluate(c, (t0 + tm) / 2, U);
    const q3 = evaluate(c, (tm + t1) / 2, U);
    const err = Math.max(distToChord(m, a, b), distToChord(q1, a, b), distToChord(q3, a, b));
    if (depth >= MAX_DEPTH || err <= tol) {
      out.push(b);
      return;
    }
    rec(t0, a, tm, m, depth + 1);
    rec(tm, m, t1, b, depth + 1);
  };
  const first = evaluate(c, U[p], U);
  out.push(first);
  for (let s = p; s <= n; s++) {
    const t0 = U[s], t1 = U[s + 1];
    if (t1 <= t0) continue;
    rec(t0, evaluate(c, t0, U), t1, evaluate(c, t1, U), 0);
  }
  return out;
}

/** Flatten a closed curve to a ring (drops the duplicated closing point). */
export function flattenClosed(c: Nurbs, tol = CHORD_TOLERANCE_MM): Ring {
  const pts = flatten(c, tol);
  const a = pts[0], b = pts[pts.length - 1];
  if (pts.length > 1 && Math.hypot(a.x - b.x, a.y - b.y) < 1e-6) pts.pop();
  return pts;
}

/** Uniform scale about the origin, then translate — FONT ASSEMBLY's transform_curve. */
export function placeNurbs(c: Nurbs, scale: number, dx: number, dy = 0): Nurbs {
  return {
    ...c,
    points: c.points.map(([x, y, w]) => [x * scale + dx, y * scale + dy, w] as [number, number, number]),
  };
}
