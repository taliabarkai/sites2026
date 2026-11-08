# HANDOFF: Name Necklace Studio → XPM Catalog v2 preset

> **For the developer and for your AI assistant.** Read this file first, then `README.md`
> (architecture), then `docs/15-studio-decisions-and-deferred-work.md` (decisions you must not undo).
> Prepared 2026-11-04 by Yossi Mizrahi (Product Director) with Claude.

---

## 1. What this is, in one paragraph

A working, self-contained Next.js app that produces **personalised name-necklace previews for the
TG-CARRIE product without ShapeDiver and without Rhino**. Oleg's Grasshopper definition
(`source/tg-carrie-shapediver-10.gh`) was unpacked. Its embedded curve font, kerning, loop anchors,
presets and sliders were extracted to JSON (`engine/products/tg-carrie/data/`), and its plate-building
Python was ported to TypeScript (`engine/`). The **server** solves a name in ~10–30 ms and renders a gold
sprite PNG (~70 ms, pure JS) and a 3D GLB (~30 ms). The **browser** only downloads those files and runs
a Matter.js chain so shoppers can drag the necklace. It is verified against ShapeDiver: **50/50
reference plates match** (size within 0.003 mm, 0 px structural error).

## 2. The goal you are being handed

> **Create a new preset in XPM's Catalog v2, at product (SKU) level, that turns this preview on for a
> product, so it renders on that SKU's product page in `frontend-next`.**

This package is the **reference implementation and the engine**. It is not the production integration.
Your job is to move it into our stack, keeping its outputs and its checks.

### Where it plugs in: verify these, they are pointers, not facts

These were found in our indexed code. Our local clones were older than this feature, so **confirm on
current `develop` before building on them**:

| Side | Pointer | What it appears to do |
|---|---|---|
| XPM (site-experience-manager) frontend | `frontend/src/feature/catalogDashboard/productDetails/components/productPresentationTab/presetPicker/presetPicker.tsx` | Catalog v2 → product details → **Product Presentation** tab → pick / create / overwrite a named **preset** per site |
| XPM backend | `backend/.../Core/SiteExperienceManager.Core/Services/ProductPresentation/PresetService.cs` | Presets: `{ Id, Name, Presentation, SiteIds, UpdatedAt }` |
| Storefront (frontend-next) | `src/modules/product/(page)/features/productMedia/index.tsx` | Resolves the product's **presentation** (`multiStepVM.presentation` → `'modal'` / gallery) and already has a **live-preview POC SKU** path (`isLivePreviewPocSku`, `isLivePreviewEnabled`) |

**Suggested shape** (adapt to what the code really supports):

1. **A new preset/presentation type**, e.g. `necklacePreview`, selectable on the Product Presentation tab
   for a SKU. Its payload is a **studio settings profile**: the schema in `engine/settings.ts`
   (preset, coating defaults, chain length, depth, spacing mode, product type single/multi, physics
   feel). Store that JSON in the preset's `Presentation`.
2. **A server endpoint** in our stack (or this engine as a small service) that answers
   `GET plate?sku=…&name=…&coating=…` with sidecar JSON + sprite PNG + GLB, resolving the SKU to its
   preset's settings **server-side**. See §5 for why it must not accept raw settings from the browser in
   production.
3. **A storefront component** in `frontend-next` that, when the SKU's presentation is `necklacePreview`,
   mounts the necklace view (`components/necklace/*`): the PDP's inscription fields go in, the sprite
   (or 3D) necklace comes out, in the gallery or a modal per the presentation's display choice.

Load whatever XPM / frontend-next conventions your team already uses for components and presets before
writing code. This package does not attempt to follow them.

## 3. Run it (10 minutes)

Requirements: Node ≥ 22 (built on 25), pnpm 10. Python 3 only if you re-extract (§6).

```bash
pnpm install
pnpm dev                                                   # http://localhost:3100
pnpm golden                                                # must print 50/50
node --experimental-strip-types scripts/physics-check.ts  # must print 16 PASS
npx tsc --noEmit -p .                                      # must be clean
```

In the UI: type names, use the Single / Multi toggle, pick Sprite or 3D, drag a name, and open the
collapsed settings sections. Save a profile with "Save as" (it is written to `settings/tg-carrie.json`).

## 4. Map of the code

```
source/tg-carrie-shapediver-10.gh   Oleg's definition: the single source of truth
extract/                            .gh → JSON (offline, Python + rhino3dm, MIT). Re-run when the .gh changes
engine/                             SERVER ONLY. Never import this from client code except engine/settings.ts
  products/tg-carrie/data/          extracted font, anchors, presets, sliders, link meshes, Oleg's scripts (reference)
  font/assemble.ts                  port of FONT ASSEMBLY (glyph choice, kerning, placement)
  plate/solve.ts                    port of INNER\OUTER, Loops, CLEAN SHAPE (incl. step_split); outline + loop centres
  render/sprite.ts                  plate → gold PNG (distance-field bevel, studio light), no browser
  render/mesh.ts                    plate → GLB (1.1 mm extrusion, attach:FIRST/LAST nodes)
  render/linkSprite.ts, linkMesh.ts chain links (sprites + smooth tori at the .gh's link dimensions)
  service.ts                        request → content-hash key → disk cache → build on miss
  settings.ts                       THE schema: every tunable, its default, where it runs
  settingsStore.ts                  saved profiles (JSON file). Replace with XPM presets in production
app/api/                            plate, plate/file, links, links/file, settings routes
components/necklace/                client: Matter.js physics, chain dressing, sprite + three.js renderers
components/Studio.tsx               the internal studio page (NOT the PDP UI)
golden/shapediver-reference/        50 ShapeDiver-solved plates: the contract the port is held to
scripts/                            golden.ts, physics-check.ts, diff.ts (visual diff), sprite/glb/links helpers
docs/                               14 = why this exists; 15 = decisions and deferred work (READ)
```

## 5. Non-negotiables for production

1. **Keep `engine/` and the extracted data server-side.** They are the product's IP: the font and the
   letter-joining rules. The client must only ever receive PNG/GLB/sidecar. No source maps in production.
2. **The PDP must not send settings.** In this studio the browser sends every setting, which is fine for
   an internal tool. In production the browser sends `sku + name + coating`; the server looks up the
   SKU's preset. Otherwise anyone can render anything at any size.
3. **Lock down the settings API.** `app/api/settings` is open here. In production presets are edited in
   XPM only, behind XPM auth.
4. **Anti-harvesting.** A script requesting `Aa…Zz` against an open plate endpoint can rebuild the font.
   Use signed short-lived request tokens from the PDP server, rate-limit **cache misses** per
   client, keep sprites at display resolution, and serve GLB only when 3D is actually opened (or not at all).
5. **Keep the gates in CI.** `pnpm golden` (50/50) and `physics-check` (16/16) must pass on every change.
   They are what lets this code stand in for the Grasshopper model.
6. **Cache forever, by content key.** The key = engine version + extracted-data hash + name + server
   settings. Outputs are deterministic, so a CDN can cache them immutably. Bump `ENGINE_VERSION` in
   `engine/service.ts` whenever output bytes change.

## 6. When Oleg changes the .gh

```bash
python3 -m venv .venv && .venv/bin/pip install -r extract/requirements.txt
.venv/bin/python -I extract/extract_gh.py source/<new>.gh engine/products/tg-carrie/data
pnpm golden            # passes, or names the plates that drifted
```

Changed data means a changed data hash, so every cached asset retires automatically. Oleg's script sources are
re-exported to `data/scripts/` so a diff shows what logic changed. **Each other product (a different
`.gh`) is a separate port**: Oleg's letter-joining scripts are not shared across products.

## 7. Known gaps (do not be surprised)

| Gap | Status | Plan |
|---|---|---|
| Engraved join grooves (PAIR SLOTS, 1,258 lines) | not ported; silhouette unaffected | next engine task; needs a 3D reference |
| Stones / diamonds | deferred | **PNG overlays** supplied by Yossi, sized to the stone footprint and tinted per birthstone. Do NOT use the .gh stone breps (no meshes, not meshable without Rhino). docs/15 §1 |
| Plates bumping into each other | experimental setting, off | Matter contacts on pinned plates jitter; needs a fan-out contact. docs/15 §7 |
| Grasshopper-only chain settings (GravityStrength, Iterations, SMOOTH CHAIN, SAMPLES, CHAIN TAIL/LIFT) | removed on purpose | Matter.js owns the chain. docs/15 §2 |
| Symbols without a loop anchor (e.g. trailing `~`) | API returns 400 | matches the model's "Missing" |

## 8. Prompt you can give your AI to start

> You are integrating the Name Necklace Studio (this folder) into Tenengroup's stack. Read HANDOFF.md,
> README.md and docs/15 fully before proposing anything. Goal: a new product-level (SKU) preset in XPM's
> Catalog v2 Product Presentation tab that enables this necklace preview on the SKU's PDP in
> frontend-next. First verify the three pointers in HANDOFF §2 on current `develop` of
> site-experience-manager and frontend-next, and report how presets and `presentation` actually work.
> Then propose: (1) the preset payload, derived from engine/settings.ts; (2) where the engine runs and
> the endpoint contract, honouring every rule in HANDOFF §5; (3) the frontend-next component and how it
> reads the preset. Keep `pnpm golden` 50/50 and physics-check 16/16 passing. Do not change engine
> behaviour while integrating.
