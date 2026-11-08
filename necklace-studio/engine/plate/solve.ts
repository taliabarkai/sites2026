/**
 * One name → one flat plate: outline, holes, loops and chain attach points.
 *
 * Mirrors the INSCRIPTION cluster's dataflow:
 *
 *   INSCRIPTIONS    trim, capitalise the first letter
 *   FONT ASSEMBLY   glyph choice + kerning + placement      (font/assemble.ts)
 *   INNER\OUTER     split glyph rings into outlines and counters
 *   Loops           place the fixed-size loop at the FIRST/LAST glyph anchors
 *   CLEAN SHAPE     union outlines; drop enclosed gaps <= min area;
 *                   union with loop outers and sockets
 *   Boundary Surfaces / Region Union
 *                   outline minus counters, kept gaps and loop holes
 *
 * Not ported yet, reported in `unsupported` rather than silently skipped:
 * PAIR SLOTS (the engraved join grooves), SQUARE STONE (FINITE) additions,
 * embedded-stone markers.
 */
import type { BBox, Polygon, Pt, Ring } from '../geom/types.ts';
import { bboxOf, centroid, signedArea, translateRing } from '../geom/types.ts';
import { flattenClosed } from '../geom/nurbs.ts';
import { difference, intersection, polygonArea, ringInside, union } from '../geom/clip.ts';
import { assemble, type PlacedGlyph } from '../font/assemble.ts';
import type { AnchorScheme, Preset, Product } from '../products/tg-carrie/index.ts';

export type Loop = {
  role: 'FIRST' | 'LAST';
  /** Glyph whose anchor was used — exact or inherited. */
  glyph: string;
  inherited: boolean;
  /** Where the loop's pivot landed (pivot + anchor × scale). */
  anchor: Pt;
  /** Area centroid of the loop's outer ring — the chain attach point. */
  centre: Pt;
  outerRadius: number;
  innerRadius: number;
};

export type Plate = {
  productId: string;
  text: string;
  preset: string;
  heightMm: number;
  thicknessMm: number;
  /** Connected pieces of metal (normally one). */
  polygons: Polygon[];
  loops: Loop[];
  glyphs: { name: string; inheritance: string; pivot: Pt; missing: boolean }[];
  bbox: BBox;
  /** Area centroid of the metal (holes subtracted) — where gravity acts on the plate. */
  com: Pt;
  areaMm2: number;
  /** Features the preset asked for that this engine does not draw yet. */
  unsupported: string[];
  missingGlyphs: string[];
  missingAnchors: string[];
};

/** INSCRIPTIONS: strip, capitalise the first letter. */
export function normaliseInscription(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  const cps = [...s];
  cps[0] = cps[0].toUpperCase();
  return cps.join('');
}

/** INNER\OUTER: a ring is inner when it lies inside any other ring. */
export function innerOuter(rings: Ring[]): { inner: Ring[]; outer: Ring[] } {
  const inner: Ring[] = [], outer: Ring[] = [];
  rings.forEach((a, i) => {
    const isInner = rings.some((b, j) => i !== j && ringInside(a, b));
    (isInner ? inner : outer).push(a);
  });
  return { inner, outer };
}

/** Loops.resolve_anchor: exact glyph, then inheritance glyph, else missing. */
function resolveAnchor(scheme: AnchorScheme, g: PlacedGlyph, role: 'FIRST' | 'LAST') {
  const exact = scheme.anchors[g.name]?.[role];
  if (exact) return { anchor: exact, glyph: g.name, inherited: false };
  if (g.inheritance !== g.name) {
    const inh = scheme.anchors[g.inheritance]?.[role];
    if (inh) return { anchor: inh, glyph: g.inheritance, inherited: true };
  }
  return null;
}

/**
 * CLEAN SHAPE's success path, then its fallback.
 *
 * step_split: each outline face is split by the NEXT one in order and only
 * its largest piece survives. That is not a union — a sliver of one letter
 * that pokes past its neighbour's stroke is discarded, which is exactly the
 * notch ShapeDiver shows between `tt` and `e` in "Charlotte".
 *
 * join_breps must yield ONE brep; when the kept faces don't form a single
 * connected region (e.g. a detached i-dot) the script reports failure and the
 * definition falls back to the raw outlines with no gap filtering.
 */
export function cleanShape(outlines: Ring[], minHoleArea: number): { outers: Ring[]; keptGaps: Ring[]; success: boolean } {
  const faces: Polygon[][] = outlines.map((r) => union([r]));
  const kept: Polygon[][] = [];
  for (let i = 0; i < faces.length - 1; i++) {
    const a = faces[i], cutter = faces[i + 1];
    const cutRings = cutter.map((p) => p.outer);
    const pieces = [...intersection(a, cutRings), ...difference(a, cutRings)];
    // Rhino's Split returns nothing when the cutter misses; keep the original then.
    if (pieces.length <= 1) {
      kept.push(a);
      continue;
    }
    kept.push([pieces.reduce((best, p) => (polygonArea(p) > polygonArea(best) ? p : best))]);
  }
  if (faces.length) kept.push(faces[faces.length - 1]);

  const joined = union(kept.flatMap((f) => f.map((p) => p.outer)));
  if (joined.length === 1) {
    // Success: contour of the merged face; enclosed gaps survive only above min area.
    const gaps = joined[0].holes.filter((h) => Math.abs(signedArea(h)) > minHoleArea);
    return { outers: [joined[0].outer], keptGaps: gaps, success: true };
  }
  // Fallback: Boundary Surfaces over the raw outlines; Region Union keeps every gap.
  const raw = union(outlines);
  return { outers: raw.map((p) => p.outer), keptGaps: raw.flatMap((p) => p.holes), success: false };
}

export type PlateOverrides = Partial<{
  overrideValue: number;
  minHoleArea: number;
  missingGlyphWidth: number;
  thickness: number;
  flatInscriptions: boolean;
}>;

export function solvePlate(product: Product, rawText: string, presetName: string, overrides: PlateOverrides = {}): Plate {
  const preset: Preset | undefined = product.presets[presetName];
  if (!preset) throw new Error(`unknown preset ${presetName}`);
  const text = normaliseInscription(rawText);
  if (!text) throw new Error('empty inscription');
  if ([...text].length > product.maxNameLength) throw new Error(`inscription longer than ${product.maxNameLength}`);

  const height = product.sizes[preset.font_size];
  const cfg = { ...product.config };
  for (const k of ['overrideValue', 'minHoleArea', 'thickness'] as const) if (overrides[k] !== undefined) cfg[k] = overrides[k]!;
  if (overrides.missingGlyphWidth !== undefined) cfg.missingWidth = overrides.missingGlyphWidth;
  const unsupported: string[] = [];
  if (preset.features['Embedded Stone']) unsupported.push('embedded stone');
  if (preset.add_stone_scheme_index !== null) unsupported.push('stone addition');
  // PAIR SLOTS runs for every preset; 'Offset Slots' only switches its offset.
  unsupported.push('pair slots (engraved join grooves)');

  const asm = assemble(product.font, text, {
    height,
    alternativesFirst: cfg.alternativesFirst,
    alternativesSecond: cfg.alternativesSecond,
    finites: cfg.finites,
    curled: cfg.curled,
    curl: preset.features['Curled Last Letter'],
    stoneFirst: preset.features['Embedded Stone'],
    kerningGroups: cfg.kerningGroups,
    overrideValue: cfg.overrideValue,
    missingWidth: cfg.missingWidth,
    missingCurves: product.missingCurves,
  });

  // ---- glyph rings → outlines and counters (INNER\OUTER#0284)
  const glyphRings = asm.glyphs.flatMap((g) => g.base.map((c) => flattenClosed(c)));
  const { inner: counters, outer: outlines } = innerOuter(glyphRings);

  // ---- loops (Loops script): fixed-size geometry, never scaled
  const scheme = product.schemes[preset.loop_scheme_index];
  const loopRings = scheme.geometry.map((c) => flattenClosed(c));
  const loops: Loop[] = [];
  const loopOuters: Ring[] = [];
  const loopHoles: Ring[] = [];
  const missingAnchors: string[] = [];
  const requests: ['FIRST' | 'LAST', number][] = [['FIRST', 0], ['LAST', asm.glyphs.length - 1]];
  for (const [role, gi] of requests) {
    const g = asm.glyphs[gi];
    const hit = resolveAnchor(scheme, g, role);
    if (!hit) {
      missingAnchors.push(`${g.name} / ${role}`);
      continue;
    }
    const world = { x: g.pivot.x + hit.anchor.x * asm.scale, y: g.pivot.y + hit.anchor.y * asm.scale };
    const dx = world.x - scheme.pivot.x, dy = world.y - scheme.pivot.y;
    const placed = loopRings.map((r) => translateRing(r, dx, dy));
    const { inner, outer } = innerOuter(placed);
    loopOuters.push(...outer);
    loopHoles.push(...inner);
    const big = outer.reduce((a, b) => (Math.abs(signedArea(a)) >= Math.abs(signedArea(b)) ? a : b));
    const hole = inner[0];
    loops.push({
      role,
      glyph: hit.glyph,
      inherited: hit.inherited,
      anchor: world,
      centre: centroid(big),
      outerRadius: Math.sqrt(Math.abs(signedArea(big)) / Math.PI),
      innerRadius: hole ? Math.sqrt(Math.abs(signedArea(hole)) / Math.PI) : 0,
    });
  }

  // ---- CLEAN SHAPE
  const clean = cleanShape(outlines, cfg.minHoleArea);
  // Union the cleaned letters' outer boundaries with the loops (and, later, sockets).
  const body = union([...clean.outers, ...loopOuters]);
  // Boundary Surfaces: punch counters, kept gaps and loop holes.
  const polygons = difference(body, [...counters, ...clean.keptGaps, ...loopHoles]);

  const bbox = bboxOf(polygons.map((p) => p.outer));
  // Centre of mass: Σ(signed area × centroid) over every ring, holes negative.
  let A = 0, mx = 0, my = 0;
  for (const p of polygons) {
    for (const [r, sign] of [[p.outer, 1], ...p.holes.map((h) => [h, -1] as const)] as [Ring, number][]) {
      const a = Math.abs(signedArea(r)) * sign, c = centroid(r);
      A += a; mx += a * c.x; my += a * c.y;
    }
  }
  const com = { x: mx / A, y: my / A };
  return {
    productId: product.id,
    text,
    preset: presetName,
    heightMm: height,
    // FLAT INSCRIPTIONS: the model emits the boundary surface without extruding it.
    thicknessMm: overrides.flatInscriptions ? 0.02 : cfg.thickness,
    polygons,
    loops,
    glyphs: asm.glyphs.map((g) => ({ name: g.name, inheritance: g.inheritance, pivot: g.pivot, missing: g.missing })),
    bbox,
    com,
    areaMm2: A,
    unsupported,
    missingGlyphs: asm.missing,
    missingAnchors,
  };
}
