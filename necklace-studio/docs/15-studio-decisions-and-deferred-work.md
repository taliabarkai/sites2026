# Studio: Decisions and Deferred Work

**Date:** 2026-11-04
**Status:** Living record for `studio/`. Read this before picking up stones, diamonds or chain settings.
**Decided by:** Yossi, in the session that built `studio/` ([doc 14](14-owning-the-solve-without-shapediver.md), option C).

---

## 1. Stones and diamonds: image overlays, not Oleg's geometry

**Decision.** Stones (embedded or added to a letter) and diamonds (on the chain) will not use the
definition's stone geometry. Yossi will supply **PNG artwork**: a small set of stone and diamond images.
The studio will:

1. **Place** each stone where the definition puts it. Placement data is already extracted and needs no Rhino:
   - embedded stones: the glyph's `_stones` curves in `font.json` (FONT ASSEMBLY routes them per glyph,
     with the `_stone` / `_stone_alt` glyph variants and the i → j → first-letter priority);
   - stone additions: the "Finite Stone Addition" anchor scheme in `anchors.json` plus its socket curves
     in `assets.json`;
   - chain diamonds: a body on the Matter.js chain (our own logic, see §3).
2. **Size** the PNG to that stone's footprint: the bounding box of its marker curve, in mm, converted to sprite px.
3. **Colour** it with a tint overlay per STONE COLOR: 12 birthstones + DIAMOND. That means one master image
   per stone shape, recoloured at runtime or on the server, not 13 separate images.
4. Draw it on top of the plate sprite, and as a textured quad in the 3D view.

**Why.** The definition's stone and diamond shapes are stored only as Rhino solids with no mesh saved
alongside them (verified: 12 shapes, 0 with a saved mesh), and Rhino-free tools can't mesh them.
PNG overlays avoid that entirely and look better than flat-shaded gems.

**Until then:** presets with stones solve and draw the letters, and report `embedded stone` /
`stone addition` in `unsupported`. No stone settings are shown in the panel.

## 2. Chain settings that belonged to Grasshopper are gone

The ShapeDiver page's chain controls drive Oleg's **static** chain drawing and his GRAVITY LAYOUT
relaxation. The studio's chain is Matter.js, so these are removed from the system, not "not ported":

| Removed | What it did in the definition |
|---|---|
| GravityStrength, Iterations | Strength and iterations of the GRAVITY LAYOUT relaxation |
| SMOOTH CHAIN, CHAIN SMOOTHNESS, SAMPLES | How finely the static chain curve is drawn |
| CHAIN TAIL, CHAIN LIFT (FOR SINGLE NAME) | Shaping of the static chain's ends |

Kept, because they mean the same thing under physics: CHAIN LENGTH, NECKLACE DEPTH (the guide the chain
starts on), LINK PITCH, GRAVITY (on/off). Physics feel is ours: gravity, iterations, weight, friction,
drag and the "let go when taut" guardrail, with the POC's Matter.js constants as defaults.

## 3. Deferred, possibly replaced by our own logic

- **Chain diamonds**: DIAMOND GAP ×3, ENABLE CHAIN DIAMOND, DIAMOND TYPE, ADDITION WEIGHT, and the
  single-name addition trio (ALLOW / SIDE / DISTANCE). Likely re-specified as our own: a diamond body
  on the chain, with its own weight in links and a gap in mm. Removed from the panel until then.
- **3D PREVIEW** (the model's switch that emits no geometry when off): not needed by the studio.

## 4. Products the studio must support

The website sells this necklace as different products at **different scales**:

- **Single nameplate**: one plate, its own scale.
- **Multi-name**: **2–5 plates**, its own scale.

Both must work with **either loop layout** in the definition:

- **Two loops** (top loops, mid loops): the chain runs into one loop and out of the other.
- **One loop** (the LEFT-LOOP presets, Oleg's SINGLE LOOP maker): each plate hangs from a single loop on a
  continuous chain, spaced by SPACE BETWEEN NAMES.

In the studio, each product is a **settings profile**: product type, plate-count range, preset (letter
size, loop layout), chain length, depth, spacing. Defaults come from the ShapeDiver page. The exact
per-product scales are for product to set and save.

## 5. Working rule

Proceed **without requirements on Oleg**. Where the definition is ambiguous, pick the reading that
matches what ShapeDiver draws, write it down here, and keep it behind a setting so it can be changed
without code.

## 6. Built since (2026-11-04)

- **Product type** setting: `single` shows one inscription; `multi` requires 2–5. Scale (preset, chain
  length, depth, spacing) is per saved profile.
- **One-loop presets** (LEFT-LOOP) hang each plate from a single point on one continuous clasp-to-clasp
  chain, SPACE BETWEEN NAMES apart (5 mm default), with a connection ring at each hanging point.
  MID-LOOPS presets are two-loop and use the normal construction.
- Physics gate (`studio/scripts/physics-check.ts`): **16/16** across two-loop, one-loop and mid-loop
  presets, 1–5 names, both spacing modes. The guardrail now limits the stretch the **drag adds**,
  because five heavy CNC_11.2 plates already open joints ~0.2 mm at rest. Default solver iterations
  are 30 (POC 18): that closes those joints to ~0.08 mm for ~0.5 ms a frame, and the drag feel is
  iteration-independent.

## 7. Open: plates touching each other

Matter.js contacts between plates that are also pinned at a point **jitter forever** (measured
0.16 mm/frame with five hanging plates) and block drags. Sleeping, slop, friction and inertia
didn't help, and some made it worse. The studio uses its own position-only push instead, behind
**"Plates push each other apart (experimental)"**, **off by default**, matching Oleg's makers, which
have no collisions either. With it on, two-loop necklaces are fine, but one-loop names hung 5 mm apart
overlap near their loops and can't separate without rotating, so they strain the chain. The real fix is
a contact that makes plates rotate apart (fan out), the way the POC's charm cluster did.
