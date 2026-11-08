/**
 * Port of Oleg's FONT ASSEMBLY script (INSCRIPTION cluster).
 *
 * Reference: engine/products/tg-carrie/data/scripts/INSCRIPTION__FONT_ASSEMBLY.py
 * Behaviour is kept line-for-line where it is observable — glyph choice,
 * kerning identity, the pivot advance formula — and every branch comment
 * names the Python function it mirrors.
 */
import type { Nurbs, Pt } from '../geom/types.ts';
import { flatten, placeNurbs } from '../geom/nurbs.ts';

export type Glyph = {
  width: number;
  base?: Nurbs[];
  _slots?: Nurbs[];
  _stones?: Nurbs[];
};

export type FontData = {
  name: string;
  sourceReferenceHeight: number;
  overrideValue: number | null;
  glyphs: Record<string, Glyph>;
  /** Kerning pair key -> raw_spacing. Keys as in pair_key(). */
  pairs: Record<string, number>;
  kerningAliases: Record<string, string>;
};

export type AssemblyOptions = {
  /** Rhino-unit letter height (the preset's font_rhino_size, e.g. 10.3 for art size 7.5). */
  height: number;
  alternativesFirst: Set<string>;
  alternativesSecond: Set<string>;
  finites: Set<string>;
  curled: Set<string>;
  curl: boolean;
  stoneFirst: boolean;
  /** Parsed KERNING GROUPS panel: main char -> its variants. */
  kerningGroups: Record<string, string>;
  overrideValue: number;
  missingWidth: number;
  /** Replacement geometry for missing glyphs, in source font units. */
  missingCurves: Nurbs[];
};

export type PlacedGlyph = {
  index: number;
  /** Glyph actually drawn, e.g. "a1", "_o", "e_curl". */
  name: string;
  /** Identity used for slot/stone/anchor fallback — the glyph before stone substitution. */
  inheritance: string;
  pivot: Pt;
  missing: boolean;
  base: Nurbs[];
  slots: Nurbs[];
  stones: Nurbs[];
};

export type Assembly = {
  glyphs: PlacedGlyph[];
  scale: number;
  missing: string[];
};

/** parse_kerning_groups */
export function parseKerningGroups(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const raw of text.replace(/\r/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line || !line.includes('=')) continue;
    const at = line.indexOf('=');
    const main = line.slice(0, at).trim();
    const variants = line.slice(at + 1).trim();
    if ([...main].length !== 1) continue;
    const cleaned: string[] = [];
    for (const ch of variants) if (ch !== main && !cleaned.includes(ch)) cleaned.push(ch);
    result[main] = cleaned.join('');
  }
  return result;
}

/** choose_glyph_names */
export function chooseGlyphNames(text: string, glyphs: Record<string, Glyph>, o: AssemblyOptions): { names: string[]; inheritance: string[] } {
  const chars = [...text];
  if (!chars.length) return { names: [], inheritance: [] };
  const result = [...chars];
  const usedAltFirst = chars.map(() => false);

  for (let i = 0; i < chars.length - 1; i++) {
    const left = chars[i], right = chars[i + 1];
    const pair = left + right;
    if (o.alternativesFirst.has(pair) && glyphs[left + '1']) {
      result[i] = left + '1';
      usedAltFirst[i] = true;
    }
    if (o.alternativesSecond.has(pair) && glyphs[right + '1']) {
      result[i + 1] = right + '1';
    }
  }

  // Last glyph: curl has priority over finite.
  const last = chars.length - 1;
  const lastChar = chars[last];
  let curlUsed = false;
  if (o.curl && o.curled.has(lastChar) && glyphs[lastChar + '_curl']) {
    result[last] = lastChar + '_curl';
    curlUsed = true;
  }
  if (!curlUsed && o.finites.has(lastChar) && glyphs['_' + lastChar]) {
    result[last] = '_' + lastChar;
  }

  const inheritance = [...result];

  // Stone target: first i, else first j, else first character. Applied last.
  if (o.stoneFirst) {
    let idx = chars.indexOf('i');
    if (idx < 0) idx = chars.indexOf('j');
    if (idx < 0) idx = 0;
    const c = chars[idx];
    const candidate = usedAltFirst[idx] ? c + '_stone_alt' : c + '_stone';
    if (glyphs[candidate]) result[idx] = candidate;
  }
  return { names: result, inheritance };
}

/** pair_key: one-character identities use code points, named glyphs stay readable. */
function pairKey(left: string, right: string): string {
  if ([...left].length === 1 && [...right].length === 1) return `${left.codePointAt(0)}|${right.codePointAt(0)}`;
  return `${left}|${right}`;
}

/** get_canonical_char */
function canonicalChar(groups: Record<string, string>, ch: string): string {
  if (ch in groups) return ch;
  for (const [main, variants] of Object.entries(groups)) if (variants.includes(ch)) return main;
  return ch;
}

/** get_kerning_id */
function kerningId(font: FontData, groups: Record<string, string>, glyphName: string): string {
  const name = glyphName ?? '';
  const alias = font.kerningAliases[name];
  if (alias !== undefined) return [...alias].length === 1 ? canonicalChar(groups, alias) : alias;
  const cps = [...name];
  if (cps.length === 1) return canonicalChar(groups, name);
  if (name.endsWith('1') && cps.length === 2) return canonicalChar(groups, cps[0]);
  if (name.startsWith('_') && cps.length === 2) return canonicalChar(groups, cps[1]);
  return name;
}

/** get_pair_spacing */
function pairSpacing(font: FontData, groups: Record<string, string>, leftName: string, rightName: string, leftChar: string, rightChar: string): number {
  const item = font.pairs[pairKey(kerningId(font, groups, leftName), kerningId(font, groups, rightName))];
  if (item !== undefined) return item;
  const base = font.pairs[pairKey(canonicalChar(groups, leftChar), canonicalChar(groups, rightChar))];
  return base ?? 0;
}

/** get_glyph_geometry_role_with_fallback: an explicit (even empty) role blocks inheritance. */
function roleWithFallback(glyph: Glyph, fallback: Glyph | undefined, role: '_slots' | '_stones'): Nurbs[] {
  if (role in glyph) return glyph[role] ?? [];
  return fallback?.[role] ?? [];
}

/** normalize_curve_input: centre X on 0, bottom on baseline, using the curves' true (tight) bounding box. */
function normalizeMissing(curves: Nurbs[]): Nurbs[] {
  if (!curves.length) return [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity;
  for (const c of curves) for (const { x, y } of flatten(c)) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
  }
  const cx = (minX + maxX) / 2;
  return curves.map((c) => placeNurbs(c, 1, -cx, -minY));
}

export function assemble(font: FontData, text: string, o: AssemblyOptions): Assembly {
  const scale = o.height / font.sourceReferenceHeight;
  const { names, inheritance } = chooseGlyphNames(text, font.glyphs, o);
  const chars = [...text];
  const missingCurves = normalizeMissing(o.missingCurves);
  const missing: string[] = [];

  const layout = names.map((name, i) => {
    const glyph = font.glyphs[name];
    const fallback = font.glyphs[inheritance[i]];
    if (!glyph) {
      if (!missing.includes(name)) missing.push(name);
      return { glyph: undefined, fallback, width: o.missingWidth, missing: true };
    }
    return { glyph, fallback, width: glyph.width, missing: false };
  });

  const placed: PlacedGlyph[] = [];
  let pivotX = 0;
  layout.forEach((item, i) => {
    const pivot = { x: pivotX, y: 0 };
    const place = (cs: Nurbs[]) => cs.map((c) => placeNurbs(c, scale, pivotX));
    placed.push({
      index: i,
      name: names[i],
      inheritance: inheritance[i],
      pivot,
      missing: item.missing,
      base: item.glyph ? place(item.glyph.base ?? []) : place(missingCurves),
      slots: item.glyph ? place(roleWithFallback(item.glyph, item.fallback, '_slots')) : [],
      stones: item.glyph ? place(roleWithFallback(item.glyph, item.fallback, '_stones')) : [],
    });
    if (i >= layout.length - 1) return;
    const next = layout[i + 1];
    // A missing glyph behaves like a space: no pair kerning on either side.
    const raw = item.missing || next.missing ? 0 : pairSpacing(font, o.kerningGroups, names[i], names[i + 1], chars[i], chars[i + 1]);
    pivotX += (item.width * 0.5 + raw * o.overrideValue + next.width * 0.5) * scale;
  });

  return { glyphs: placed, scale, missing };
}
