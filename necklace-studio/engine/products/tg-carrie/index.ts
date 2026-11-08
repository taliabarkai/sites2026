/**
 * TG-CARRIE product definition: the extracted .gh data plus the preset rules
 * from Oleg's MAIN and INSCRIPTIONS scripts.
 *
 * Data comes from `pnpm extract <file.gh> engine/products/tg-carrie/data`.
 * Nothing here is hand-typed from the .gh. A changed definition is one
 * re-extract, followed by the golden check (scripts/golden.ts).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { FontData } from '../../font/assemble.ts';
import { parseKerningGroups } from '../../font/assemble.ts';
import type { Nurbs, Pt } from '../../geom/types.ts';
import { linkDims, ovalTorus, type LinkDims } from '../../render/linkMesh.ts';
import { STUDIO_ROOT } from '../../root.ts';

const DATA_DIR = join(STUDIO_ROOT, 'engine', 'products', 'tg-carrie', 'data');
const read = (f: string) => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8'));

type RawCurve = { degree: number; points: number[][]; knots: number[]; closed?: boolean };

/** Asset curves carry [x, y, z, w]; the font carries [x, y, w]. Normalise to [x, y, w]. */
function toNurbs(c: RawCurve): Nurbs {
  return {
    degree: c.degree,
    knots: c.knots,
    closed: c.closed,
    points: c.points.map((p) => (p.length === 4 ? [p[0], p[1], p[3]] : [p[0], p[1], p[2]]) as [number, number, number]),
  };
}

export type Preset = {
  font_size: string;
  stone_type: 'DIAMOND' | 'SQUARE' | null;
  loop_scheme_index: number;
  add_stone_scheme_index: number | null;
  features: { 'Curled Last Letter': boolean; 'Embedded Stone': boolean; 'Offset Slots': boolean };
};

export type AnchorScheme = {
  name: string;
  anchors: Record<string, { FIRST?: Pt; LAST?: Pt }>;
  geometry: Nurbs[];
  pivot: Pt;
};

export type Product = {
  id: 'tg-carrie';
  font: FontData;
  presets: Record<string, Preset>;
  sizes: Record<string, number>;
  schemes: AnchorScheme[];
  config: {
    alternativesFirst: Set<string>;
    alternativesSecond: Set<string>;
    finites: Set<string>;
    curled: Set<string>;
    kerningGroups: Record<string, string>;
    overrideValue: number;
    missingWidth: number;
    slotExtension: number;
    offsetDistance: number;
    minHoleArea: number;
    thickness: number;
  };
  missingCurves: Nurbs[];
  /** Smooth regenerations at the .gh links' exact dimensions (render/linkMesh.ts). */
  chainLink: { positions: number[]; indices: number[] };
  connectionLink: { positions: number[]; indices: number[] };
  chainLinkDims: LinkDims;
  connectionLinkDims: LinkDims;
  /** LINK PITCH slider of the 2-loop necklace maker. */
  linkPitchMm: number;
  /** The PDP's letter-size ladder → preset. Same mapping the ShapeDiver POC used. */
  letterPresets: Record<string, string>;
  maxNameLength: number;
};

let cached: Product | null = null;

export function tgCarrie(): Product {
  if (cached) return cached;
  const fontRaw = read('font.json');
  const config = read('config.json');
  const anchors = read('anchors.json');
  const assets = read('assets.json');

  const glyphs: FontData['glyphs'] = {};
  for (const [name, g] of Object.entries<any>(fontRaw.glyphs)) {
    const out: any = { width: g.width };
    for (const role of ['base', '_slots', '_stones'] as const) if (role in g) out[role] = g[role].map(toNurbs);
    glyphs[name] = out;
  }
  const font: FontData = {
    name: fontRaw.name,
    sourceReferenceHeight: fontRaw.sourceReferenceHeight,
    overrideValue: fontRaw.overrideValue,
    glyphs,
    pairs: fontRaw.pairs,
    kerningAliases: fontRaw.kerningAliases ?? {},
  };

  const schemes: AnchorScheme[] = assets.schemes.map((s: any) => ({
    name: s.name,
    anchors: anchors[s.name].anchors,
    geometry: s.geometry.map(toNurbs),
    pivot: { x: s.pivot[0], y: s.pivot[1] },
  }));

  // The live KERNING GROUPS panel is wired into FONT ASSEMBLY and wins over
  // the JSON's stored groups whenever it parses to anything (resolve_live_kerning_groups).
  const kerningGroups = parseKerningGroups(config.kerningGroupsText ?? '');

  cached = {
    id: 'tg-carrie',
    font,
    presets: config.presets,
    sizes: config.sizes,
    schemes,
    config: {
      alternativesFirst: new Set(config.alternativesFirst),
      alternativesSecond: new Set(config.alternativesSecond),
      finites: new Set(config.finites),
      curled: new Set(config.curled),
      kerningGroups,
      overrideValue: config.sliders.overrideValue,
      missingWidth: config.sliders.missingGlyphWidth,
      slotExtension: config.sliders.slotExtension,
      offsetDistance: config.sliders.offsetDistance,
      minHoleArea: config.sliders.minHoleArea,
      thickness: config.sliders.thickness,
    },
    missingCurves: assets.missingGlyph.map(toNurbs),
    chainLink: ovalTorus(linkDims(assets.chainLink[0])),
    connectionLink: ovalTorus(linkDims(assets.connectionLink[0])),
    chainLinkDims: linkDims(assets.chainLink[0]),
    connectionLinkDims: linkDims(assets.connectionLink[0]),
    linkPitchMm: config.sliders.linkPitch,
    letterPresets: { '6': 'LC_6', '7.5': 'LC_7.5', '9.5': 'CNC_9.5', '11.2': 'CNC_11.2' },
    // The PDP's inscription field and the model's Direct Text Input both cap at 9.
    maxNameLength: 9,
  };
  return cached;
}
