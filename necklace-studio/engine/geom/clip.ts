/**
 * Region boolean maths on top of Clipper (clipper-lib, Boost licence).
 *
 * This is the whole replacement for the RhinoCommon calls Oleg's plate
 * scripts make — Curve.CreateBooleanUnion, Brep.Split/JoinBreps/
 * MergeCoplanarFaces, Boundary Surfaces, Region Union,
 * PlanarClosedCurveRelationship. All of them, for a planar plate, are set
 * operations on regions, and Clipper does those exactly on an integer grid.
 */
import { createRequire } from 'node:module';
import type { Polygon, Pt, Ring } from './types.ts';
import { signedArea } from './types.ts';

const require = createRequire(import.meta.url);
// clipper-lib is a UMD script; it exports through module.exports.
const ClipperLib = require('clipper-lib');

/** 1 integer unit = 10 nm. Plate coordinates stay below ±100 mm, far inside the 2^53 safe range. */
const SCALE = 1e5;

type IntPt = { X: number; Y: number };

function toInt(r: Ring): IntPt[] {
  return r.map((p) => ({ X: Math.round(p.x * SCALE), Y: Math.round(p.y * SCALE) }));
}
function fromInt(r: IntPt[]): Ring {
  return r.map((p) => ({ x: p.X / SCALE, y: p.Y / SCALE }));
}

export function ccw(r: Ring): Ring {
  return signedArea(r) >= 0 ? r : [...r].reverse();
}

function execute(clipType: number, subject: Ring[], clip: Ring[], fill = ClipperLib.PolyFillType.pftNonZero): Polygon[] {
  const c = new ClipperLib.Clipper();
  c.AddPaths(subject.map(toInt), ClipperLib.PolyType.ptSubject, true);
  if (clip.length) c.AddPaths(clip.map(toInt), ClipperLib.PolyType.ptClip, true);
  const tree = new ClipperLib.PolyTree();
  c.Execute(clipType, tree, fill, fill);
  return polyTreeToPolygons(tree);
}

function polyTreeToPolygons(tree: any): Polygon[] {
  const out: Polygon[] = [];
  const visit = (node: any) => {
    for (const child of node.Childs()) {
      // An outer node; its children are holes, whose children are islands again.
      const poly: Polygon = { outer: ccw(fromInt(child.Contour())), holes: [] };
      for (const hole of child.Childs()) {
        poly.holes.push([...ccw(fromInt(hole.Contour()))].reverse());
        visit(hole);
      }
      out.push(poly);
    }
  };
  visit(tree);
  return out;
}

/** Union of closed rings, orientation-independent (every ring is treated as solid). */
export function union(rings: Ring[]): Polygon[] {
  return execute(ClipperLib.ClipType.ctUnion, rings.map(ccw), []);
}

/** Region minus rings. */
export function difference(polys: Polygon[], cut: Ring[]): Polygon[] {
  return execute(ClipperLib.ClipType.ctDifference, flattenPolys(polys), cut.map(ccw));
}

export function intersection(polys: Polygon[], clip: Ring[]): Polygon[] {
  return execute(ClipperLib.ClipType.ctIntersection, flattenPolys(polys), clip.map(ccw));
}

/** Polygons back to oriented rings: outers CCW, holes CW, so NonZero fill reproduces them. */
export function flattenPolys(polys: Polygon[]): Ring[] {
  const out: Ring[] = [];
  for (const p of polys) {
    out.push(ccw(p.outer));
    for (const h of p.holes) out.push([...ccw(h)].reverse());
  }
  return out;
}

/**
 * Offset a region (positive grows, negative shrinks) with round joins —
 * RhinoCommon Curve.Offset with CurveOffsetCornerStyle.Round.
 */
export function offset(polys: Polygon[], deltaMm: number, arcTolMm = 0.002): Polygon[] {
  const co = new ClipperLib.ClipperOffset(2, arcTolMm * SCALE);
  co.AddPaths(flattenPolys(polys).map(toInt), ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
  const tree = new ClipperLib.PolyTree();
  co.Execute(tree, deltaMm * SCALE);
  return polyTreeToPolygons(tree);
}

/** Offset of an open polyline into a closed band (used for slots). */
export function offsetOpen(line: Pt[], halfWidthMm: number, arcTolMm = 0.002): Polygon[] {
  const co = new ClipperLib.ClipperOffset(2, arcTolMm * SCALE);
  co.AddPath(toInt(line), ClipperLib.JoinType.jtRound, ClipperLib.EndType.etOpenRound);
  const tree = new ClipperLib.PolyTree();
  co.Execute(tree, halfWidthMm * SCALE);
  return polyTreeToPolygons(tree);
}

/** 1 inside, 0 outside, -1 on the boundary. */
export function pointInRing(p: Pt, r: Ring): number {
  return ClipperLib.Clipper.PointInPolygon({ X: Math.round(p.x * SCALE), Y: Math.round(p.y * SCALE) }, toInt(r));
}

/**
 * RhinoCommon PlanarClosedCurveRelationship(a, b) == AInsideB, for the
 * simple, non-crossing rings a font contains: every vertex of `a` lies inside
 * or on `b`, and at least one strictly inside.
 */
export function ringInside(a: Ring, b: Ring): boolean {
  if (Math.abs(signedArea(a)) >= Math.abs(signedArea(b))) return false;
  let strictly = false;
  // Testing every vertex is exact but slow on dense rings; a stride keeps it
  // cheap and a font's outlines never interpenetrate partially at this scale.
  const stride = Math.max(1, Math.floor(a.length / 64));
  for (let i = 0; i < a.length; i += stride) {
    const r = pointInRing(a[i], b);
    if (r === 0) return false;
    if (r === 1) strictly = true;
  }
  return strictly;
}

export function polygonArea(p: Polygon): number {
  return Math.abs(signedArea(p.outer)) - p.holes.reduce((s, h) => s + Math.abs(signedArea(h)), 0);
}
