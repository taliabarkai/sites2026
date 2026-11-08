/**
 * Every tunable, in one schema shared by the server, the client and the
 * settings panel.
 *
 * Sources:
 *   model  — a parameter on the live ShapeDiver model page
 *            (shapediver.com/app/m/tg-carrie-shapediver-10, read 2026-11-04);
 *            defaults are the LIVE values there, which differ from the .gh
 *            file's internalised slider values (e.g. CHAIN LENGTH 200 vs 276).
 *   gh     — a slider inside the .gh that the ShapeDiver page does not expose.
 *   studio — ours: physics feel and rendering, defaults from the POC's tuned
 *            Matter.js constants (poc/lib/plate/physics.ts).
 *
 * `where` decides who consumes it:
 *   plate     server, changes the solved geometry → part of the cache key
 *   render    server, changes the sprite/GLB bytes → part of the cache key
 *   necklace  client physics + layout, free to change live
 *   material  client 3D view
 */

export type Where = 'plate' | 'render' | 'necklace' | 'material';

type Base = { key: string; label: string; group: string; where: Where; source: 'model' | 'gh' | 'studio'; help?: string; unsupported?: boolean };
export type NumberParam = Base & { type: 'number'; default: number; min: number; max: number; step: number; unit?: string };
export type BoolParam = Base & { type: 'bool'; default: boolean };
export type ChoiceParam = Base & { type: 'choice'; default: string; options: string[] };
export type Param = NumberParam | BoolParam | ChoiceParam;

const PRESETS = [
  'DEFAULT', 'TEST', 'CNC_9.5_CURL', 'CNC_11.2', 'CNC_11.2_LEFT-LOOP', 'CNC_11.2_EMBED-DIA', 'CNC_11.2_CURL',
  'CNC_11.2_CURL_EMBED-DIA', 'CNC_11.2_CURL_MID-LOOPS', 'LC_6', 'LC_6_CURL', 'LC_6_LEFT-LOOP', 'LC_7.5', 'LC_7.5_CURL',
  'LC_7.5_SQUASHED', 'LC_9.5_EMBED-DIA', 'LC_9.5_EMBED-SQR', 'LC_9.5_CURL', 'LC_9.5_CURL_EMBED-SQR', 'LC_9.5_CURL_ADD-SQR',
  'LC_9.5_CURL_MID-LOOPS', 'LC_11.2', 'LC_11.2_CURL', 'LC_11.2_ADD-SQR', 'CNC_9.5',
];

/**
 * Removed on purpose (docs/15-studio-decisions-and-deferred-work.md):
 *   GravityStrength, Iterations, SMOOTH CHAIN, CHAIN SMOOTHNESS, SAMPLES,
 *   CHAIN TAIL, CHAIN LIFT — Grasshopper's static chain; Matter.js owns ours.
 *   STONE COLOR, chain diamonds, DIAMOND GAP, single-name additions —
 *   deferred; stones will be PNG overlays.
 */
export const PARAMS: Param[] = [
  // ---- Product
  { key: 'productType', label: 'Product', group: 'Product', where: 'necklace', source: 'studio', type: 'choice', default: 'multi', options: ['multi', 'single'],
    help: 'multi = 2–5 name plates; single = one nameplate. Each is sold at its own scale — save one profile per product.' },
  { key: 'preset', label: 'PRESET', group: 'Product', where: 'plate', source: 'model', type: 'choice', default: 'LC_7.5', options: PRESETS,
    help: 'Letter size, production method (LC/CNC), loop scheme and features. Presets that need stones or a left/mid loop scheme report what is not drawn yet.' },
  { key: 'coating', label: 'COATING', group: 'Product', where: 'render', source: 'model', type: 'choice', default: 'GP', options: ['SR', 'GP', 'VMGP', 'RGP', 'VMRGP'] },

  // ---- Lettering (sliders inside the .gh; not on the ShapeDiver page)
  { key: 'overrideValue', label: 'Kerning strength (OVERRIDE_VALUE)', group: 'Lettering', where: 'plate', source: 'gh', type: 'number', default: 8.09, min: 0, max: 10, step: 0.01,
    help: 'Multiplier on every kerning pair. Most pairs are negative, so HIGHER packs letters tighter (Yossi at LC_7.5: 8.09 → 22.1 mm wide, 4 → 25.4 mm).' },
  { key: 'minHoleArea', label: 'Min gap kept open (min area)', group: 'Lettering', where: 'plate', source: 'gh', type: 'number', default: 0.2, min: 0, max: 5, step: 0.01, unit: 'mm²',
    help: 'Enclosed gaps between joined letters smaller than this are filled with metal (CLEAN SHAPE).' },
  { key: 'missingGlyphWidth', label: 'Missing glyph width', group: 'Lettering', where: 'plate', source: 'gh', type: 'number', default: 5, min: 0.001, max: 50, step: 0.1, unit: 'font units' },
  { key: 'slotExtension', label: 'SLOT EXTENSIONS', group: 'Lettering', where: 'plate', source: 'gh', type: 'number', default: 0.3, min: 0.001, max: 2, step: 0.01, unit: 'mm', unsupported: true },
  { key: 'offsetDistance', label: 'OFFSET DISTANCE', group: 'Lettering', where: 'plate', source: 'gh', type: 'number', default: 0.12, min: 0.001, max: 2, step: 0.01, unit: 'mm', unsupported: true },

  // ---- 3D PARAMETERS
  { key: 'thickness', label: 'Plate thickness (THICKNESS)', group: '3D parameters', where: 'plate', source: 'gh', type: 'number', default: 1.1, min: 0.2, max: 3, step: 0.05, unit: 'mm' },
  { key: 'flatInscriptions', label: 'FLAT INSCRIPTIONS', group: '3D parameters', where: 'plate', source: 'model', type: 'bool', default: false,
    help: 'Model switch: emit the plate as a flat surface instead of a solid.' },
  { key: 'enable3dChain', label: 'ENABLE 3D CHAIN', group: '3D parameters', where: 'necklace', source: 'model', type: 'bool', default: true },
  { key: 'bevelMm', label: 'Sprite edge bevel', group: '3D parameters', where: 'render', source: 'studio', type: 'number', default: 0.2, min: 0, max: 0.6, step: 0.01, unit: 'mm',
    help: 'Rounded edge drawn into the sprite. 0.2 mm = the POC\'s accepted 4 px.' },

  // ---- MULTI NAME (2 LOOPS) NECKLACE MAKER
  { key: 'spacingMode', label: 'Name spacing', group: 'Necklace', where: 'necklace', source: 'studio', type: 'choice', default: 'model', options: ['model', 'gap'],
    help: 'Two-loop presets. model = Oleg\'s NAME POSITIONS: name centres at CHAIN LENGTH × (i+1)/(n+1). gap = a fixed chain length between names.' },
  { key: 'gapMm', label: 'Chain between names (gap mode)', group: 'Necklace', where: 'necklace', source: 'studio', type: 'number', default: 5, min: 0, max: 60, step: 0.5, unit: 'mm',
    help: 'Defaults to the single-loop maker\'s SPACE BETWEEN NAMES (5).' },
  { key: 'spaceBetweenNames', label: 'SPACE BETWEEN NAMES (one-loop presets)', group: 'Necklace', where: 'necklace', source: 'model', type: 'number', default: 5, min: 0, max: 100, step: 0.5, unit: 'mm',
    help: 'For presets whose plates have a single loop (LEFT-LOOP): distance along the chain between hanging points, as in the SINGLE LOOP maker.' },
  { key: 'chainLengthMm', label: 'CHAIN LENGTH', group: 'Necklace', where: 'necklace', source: 'model', type: 'number', default: 200, min: 60, max: 1000, step: 1, unit: 'mm' },
  { key: 'necklaceDepthMm', label: 'NECKLACE DEPTH', group: 'Necklace', where: 'necklace', source: 'model', type: 'number', default: 121, min: 10, max: 500, step: 1, unit: 'mm',
    help: 'How far the guide curve drops below the clasp line. Sets the clasp spacing for the given chain length.' },
  { key: 'linkPitchMm', label: 'LINK PITCH', group: 'Necklace', where: 'necklace', source: 'model', type: 'number', default: 1.2, min: 0.6, max: 4, step: 0.05, unit: 'mm' },
  { key: 'gravity', label: 'GRAVITY', group: 'Necklace', where: 'necklace', source: 'model', type: 'bool', default: true },

  // ---- Physics feel (POC Matter.js constants)
  { key: 'gravityScale', label: 'Gravity', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 1, min: 0.1, max: 3, step: 0.05,
    help: '1 = Matter.js default gravity — what the POC used.' },
  { key: 'solverIterations', label: 'Solver iterations', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 30, min: 4, max: 60, step: 1,
    help: 'Matter.js constraintIterations. POC: 18; 30 keeps joints closed under five heavy CNC plates (0.21 → 0.08 mm) for ~0.5 ms a frame. Drag feel is iteration-independent.' },
  { key: 'plateMassInLinks', label: 'Plate weight (in links)', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 16, min: 1, max: 80, step: 1,
    help: 'POC PLATE_MASS_IN_LINKS. Heavier plates pull the drape down and tilt less.' },
  { key: 'plateCollisions', label: 'Plates push each other apart (experimental)', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'bool', default: false,
    help: 'Off = like the model (Oleg\'s makers have no collisions). On = overlapping plate boxes are pushed apart. Good for two-loop necklaces; one-loop names hung 5 mm apart can\'t fully separate without rotating, so they strain the chain a little.' },
  { key: 'frictionAir', label: 'Air friction', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 0.04, min: 0, max: 0.3, step: 0.005 },
  { key: 'jointStiffness', label: 'Joint stiffness', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 0.96, min: 0.2, max: 1, step: 0.01 },
  { key: 'jointDamping', label: 'Joint damping', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 0.22, min: 0, max: 1, step: 0.01 },
  { key: 'dragStiffness', label: 'Drag stiffness', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 0.14, min: 0.01, max: 1, step: 0.01,
    help: 'POC value, meaning "at 18 solver iterations" — the feel stays the same when you change iterations.' },
  { key: 'dragSpeedMm', label: 'Max hand speed', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 2.5, min: 0.5, max: 20, step: 0.5, unit: 'mm/frame',
    help: 'How far the grab point may follow the pointer per frame. Stops a flick from teleporting a plate through its chain.' },
  { key: 'dragDamping', label: 'Drag damping', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 0.06, min: 0, max: 1, step: 0.01 },
  { key: 'maxJointGapMm', label: 'Let go when a joint opens past', group: 'Physics feel', where: 'necklace', source: 'studio', type: 'number', default: 0.35, min: 0.05, max: 2, step: 0.01, unit: 'mm',
    help: 'The guardrail: a real necklace goes taut and slips out of your fingers. Measured as stretch the drag ADDS on top of what the plates\' weight already causes. POC: 2 px ≈ 0.35 mm.' },

  // ---- METAL MATERIAL (3D view)
  { key: 'metalMetallic', label: 'Metalic Factor', group: 'Metal material', where: 'material', source: 'model', type: 'number', default: 0.87, min: 0.001, max: 1, step: 0.001 },
  { key: 'metalRoughness', label: 'Roughness Factor', group: 'Metal material', where: 'material', source: 'model', type: 'number', default: 0.344, min: 0.001, max: 1, step: 0.001 },
  { key: 'envIntensity', label: 'Environment light', group: 'Metal material', where: 'material', source: 'studio', type: 'number', default: 0.35, min: 0, max: 2, step: 0.01 },
  { key: 'viewTilt', label: 'Camera tilt', group: 'Metal material', where: 'material', source: 'studio', type: 'number', default: 18, min: 0, max: 60, step: 1, unit: '°' },
];

export type Settings = Record<string, number | boolean | string>;

export function defaults(): Settings {
  return Object.fromEntries(PARAMS.map((p) => [p.key, p.default]));
}

/** Clamp/validate an untrusted settings object against the schema. Unknown keys are dropped. */
export function sanitize(input: unknown): Settings {
  const src = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out = defaults();
  for (const p of PARAMS) {
    const v = src[p.key];
    if (v === undefined) continue;
    if (p.type === 'number') {
      const n = Number(v);
      if (Number.isFinite(n)) out[p.key] = Math.min(p.max, Math.max(p.min, n));
    } else if (p.type === 'bool') {
      out[p.key] = v === true || v === 'true' || v === 1 || v === '1';
    } else if (p.options.includes(String(v))) {
      out[p.key] = String(v);
    }
  }
  return out;
}

/** The subset that changes server output bytes, in stable key order — it goes into the cache key. */
export function serverSubset(s: Settings): Settings {
  return Object.fromEntries(PARAMS.filter((p) => p.where === 'plate' || p.where === 'render').map((p) => [p.key, s[p.key]]));
}
