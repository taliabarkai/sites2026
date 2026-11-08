# Name Necklace Studio

TG-CARRIE name plates generated **on our Next.js server** from Oleg's Grasshopper
definition. No ShapeDiver, no Rhino, no paid licence, no geometry work in the
browser. Self-contained; see HANDOFF.md first.

```
pnpm install
pnpm dev                 # http://localhost:3100
pnpm golden              # port vs ShapeDiver, 50 cached reference plates
node --experimental-strip-types scripts/physics-check.ts
```

## How it works

```
.gh ──(offline, extract/extract_gh.py, rhino3dm MIT)──► engine/products/tg-carrie/data/*.json
                                                         font (276 NURBS glyphs, 3,763 kerning pairs),
                                                         loop anchors, presets, sliders, link meshes

GET /api/plate?name=Yossi&size=7.5&coating=GP     (Next.js route, Node runtime)
  └─ engine/service.ts   content key → .cache/studio/<key>.{json,png,glb}; miss → build
       ├─ plate/solve.ts        port of the INSCRIPTION cluster  (~10–30 ms)
       │    font/assemble.ts    FONT ASSEMBLY: glyph choice, kerning, placement
       │    INNER\OUTER, Loops, CLEAN SHAPE (incl. step_split), Boundary Surfaces
       │    → outline polygons, holes, loop centres (= chain attach points), COM
       ├─ render/sprite.ts      SDF bevel + studio light → PNG, pure JS + sharp (~70 ms)
       └─ render/mesh.ts        1.1 mm extrusion (Oleg's 3D PREVIEW) → GLB  (~30 ms)

Browser: fetches sidecar + PNG/GLB only.
  components/necklace/physics.ts   Matter.js chain at the .gh's link pitch; plates pinned
                                   to the end links at their computed loop centres
  drawSprite.ts / three.ts         same simulation, two renderers (Sprite | 3D)
```

## Settings

`engine/settings.ts` is the single schema covering every parameter on the
ShapeDiver model page (defaults = the live page's values, read 2026-11-04),
the .gh sliders the page doesn't expose, and the studio's physics/render knobs.
Each setting declares where it runs: `plate`/`render` are applied on the server
and are part of the cache key; `necklace` rebuilds the Matter.js world;
`material` updates the 3D view live. Parameters not ported yet (stones,
diamonds, slot grooves) are shown but disabled.

Profiles are saved on the server in `settings/tg-carrie.json`
(`GET/PUT/POST/DELETE /api/settings`). Every write is sanitised against the
schema. The built-in "ShapeDiver live defaults" profile is read-only.

## Physics

Matter.js with the POC's construction and constants: rigid 1.2 mm links pinned
end to end, plates weighing 16 links, gravity 1.0, 18 iterations, air friction
0.04. The drag is a soft spring whose anchor follows the pointer at most 2.5 mm
per frame, and it **lets go automatically when any joint opens past 0.35 mm**.
You can't stretch the chain. `scripts/physics-check.ts` flings a plate 300 mm
and checks that the worst joint stays under 0.9 mm (measured 0.38–0.54 mm) and
that a gentle drag is not dropped.

## Chain ↔ plate connection

Oleg's Loops script places a fixed-size loop at each end glyph's FIRST/LAST
anchor: `world = glyph pivot + anchor × font scale`. The loop's centre is
therefore computed, not measured. It's exported as `attachPx` (sprite),
`attachMm` and the `attach:FIRST/LAST` GLB nodes. The physics shares that point
between the chain and the plate. As in the definition's CHAIN GENERATOR, a flat
CONNECTION LINK sits on each loop, and the links alternate flat and edge-on.

## When Oleg changes the .gh

```
python3 -m venv .venv && .venv/bin/pip install rhino3dm
.venv/bin/python -I extract/extract_gh.py path/to/new.gh engine/products/tg-carrie/data
pnpm golden
```

The data hash is part of every cache key, so old assets retire automatically.
`pnpm golden` must still pass. If it doesn't, it names the plates that drifted.
Oleg's script sources are re-exported to `data/scripts/` so they can be diffed.

## Not ported yet

Listed in every sidecar's `unsupported` field. None of these change the
silhouette that the golden gate checks:
- **PAIR SLOTS**: the engraved grooves where letters join, cut into the 3D plate.
- **Stones**: embedded-stone and stone-addition presets.
- **Single-loop necklace maker**: the `LEFT/RIGHT` presets.
