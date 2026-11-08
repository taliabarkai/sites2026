# Owning the Solve: Options Without ShapeDiver

**Date:** 2026-11-04
**Status:** Option C chosen and **built**: see [`studio/`](../studio/README.md). The golden gate passes 50/50 against ShapeDiver.
**Input:** `tg-carrie-shapediver-10.gh` (2.2 MB), Oleg's TG-CARRIE definition, saved from Rhino 8.34 with ShapeDiver plugin 1.33. I unpacked it locally: the GH_IO archive, all 12 cluster documents, and every script component.
**Builds on:** [doc 12](12-rhino-compute-as-shapediver-alternative.md), which covered Rhino.Compute from the outside, before we had the file. This doc works from the file itself.

---

## 1. The Short Version

**The file shows the model is mostly a Python program with a font file inside it, not a Grasshopper node graph.** That opens a route doc 12 never considered: running the logic in our own code.

| Fact from the file | Why it matters |
|---|---|
| **23 CPython 3 scripts, ~7,700 lines**, all written against `Rhino.Geometry` (RhinoCommon) | The design logic can be read and ported. Letter joining, loops, stones, chain and layout are all here. |
| **The font is embedded as JSON:** `rhino-curve-font-v2`, 276 glyphs as NURBS control points + knots + widths, **3,763 kerning pairs**, kerning groups, alternates (`_curl`, `_stone`, `_stone_alt`, numbered variants) | No licensed font is involved, and no font engine is needed. Any language can load this file directly. |
| Further JSON blobs: `addition-anchors-v2` ×4 (two per font: `TG-CARRIE`, `7089`) and `pair-slot-overrides-v1` | Hand-tuned per-pair data. This is data, not logic, so a port reuses it as-is. |
| **Native GH components** carry only the 3D step: `Region Union`, `Boundary Surfaces`, `Merge Faces`, `Extrude`, `Mesh Brep`, `Move` | The plate is a **2.5D extrusion of a planar outline**. Our sprite route never needs the 3D, because the bevel is our own SDF. |
| **Plugins:** ShapeDiver (I/O and display only) and **Pufferfish 2.9** (in the necklace-layout cluster) | Pufferfish is only used for chain and layout, which Matter.js already replaces. Rhino.Compute would have to install it. |
| Heavy geometry calls are few: 1 `Curve.CreateBooleanUnion`, 2 `Curve.Offset`, 1 `CurveCurve` intersection, 1 `Brep.Split`, 1 `Mesh.CreateBooleanDifference`, plus transforms and curve evaluation | A small, well-known 2D toolkit: union, offset, intersect and containment. Clipper2 does all four. |

**Script map, by cluster:**

| Cluster | ×used | Scripts (lines) | Do we need it? |
|---|---|---|---|
| Per-name plate (`c0`, 385 KB) | ×5, one per name | FONT ASSEMBLY (1,493), PAIR SLOTS (1,258), Loops (684), SQUARE STONE (658), CLEAN SHAPE (506), STONE PREVIEW (54), INNER\OUTER (37) | **Yes. This is the plate.** ~4,000 lines without stones, ~4,700 with them. |
| Extrude/mesh (`c5`) | ×5 | MESH DIFF (20) + native Extrude/Mesh Brep | No for sprites. Only needed for 3D. |
| Necklace layout (`c10`) | ×1 | NECKLACE LAYOUT (741), CHAIN GENERATOR (373), GRAVITY LAYOUT (270), DIAMOND PLACEMENT (214), INSCRIPTION PLACER (196), NAME LAYOUT (174), … | **No.** Matter.js already does chain, drape and gravity. |
| Single-loop layout (`c11`) | ×1 | SINGLE LOOP LAYOUT (206), CHAIN GENERATOR (349) | No, same reason. |
| Top level | — | MAIN (294, the preset table), INSCRIPTIONS (45), ADDITION FILTER (72) | Port MAIN as data, in a few hours. |

---

## 2. The Options

Ordered by how much of the stack we end up owning.

### A. Rhino.Compute, self-hosted: run the file as-is

Covered in doc 12. The file adds three facts:

- **Windows Server only, and it must be Rhino 8.** The scripts are CPython 3 script components, which the Linux build does not support. This settles doc 12 §7 Q1: the Python is the model, so it cannot be removed.
- **Pufferfish must be installed** on the box. Packaging it is a small task, but it is one more dependency to keep current.
- **The change to the file is small:** swap ~10 ShapeDiver components (Direct Text Input, glTF Display, glTF Material, the named outputs) for plain params or Hops-style I/O. That is an hour or two of Oleg's time, not a refactor.

**Fidelity:** exact, because it is the same file. **Ops:** a Windows VM, Rhino service, core-hour token. **Cost:** ~$175–210/mo always-on, or ~$35/mo batch-only (doc 12 §3.1).

### B. Batch on a Rhino seat we already own: no server

Run the same definition on a studio machine overnight. Loop over a name list (historical orders plus a common-names list), write plate PNG + anchor JSON, and upload to the CDN. On the PDP, a cache miss falls back to `namePreview`, the path the POC already has.

- **The cheapest way to get exact fidelity.** No VM and no per-name bill.
- **Weakness:** a name nobody has ordered before gets no preview until the next batch. How much that matters depends on name cardinality (doc 04 Stage 0, still unmeasured).
- **⚠ Licence question, unresolved:** McNeel sells core-hour billing specifically for automated or server use. Whether scripting a commercial desktop seat for unattended batch is allowed needs a direct answer from McNeel. **Don't build on B before that.**

### C. Port the plate to our own code: no Rhino at all

Load the font JSON, run the plate logic in TypeScript, and output the outline polygon(s) plus ring centres. That feeds straight into the sprite renderer we already have.

**Why this is more feasible than it sounds:**

1. **Only the 2D plate is needed.** The sprite factory takes an outline and draws gold with its own SDF bevel and `sheen.ts`. No extrusion, no breps, no meshing.
2. **The hard part is already written down.** Letter joining was rated the hardest engineering in the programme (doc 01). Here it is as readable Python (PAIR SLOTS + CLEAN SHAPE) plus a pair-override table. Porting it means translating code, not inventing an approach.
3. **The geometry toolkit is small:** evaluate NURBS (sample to polylines; degree-2/3, a few hundred lines or `verb-nurbs`), then union, offset, intersect and containment with **Clipper2**. That covers everything the plate scripts call.
4. **It also answers doc 12 §7 Q3.** Ring centres become values we compute, not values measured from sprite alpha or recovered by mesh-signature matching (`docs/08` §14). The `LINK PITCH`-suppression anchor artifact (`docs/08` §14.6) goes away.
5. **Previews become instant.** Every name renders in the browser or at the edge in milliseconds. No cache misses, no pre-warm strategy, no cold start. Three open questions in the project note disappear: pre-warm, dedicated backend, 0.7–14.6 s solve variance.

**Why it may still be the wrong call:**

- **Drift from production. This is the big risk.** The factory still manufactures from Oleg's `.gh`. Each time Oleg edits the definition, our port can fall behind, and a preview that doesn't match the shipped piece is worse than none. The port only holds up with a **golden-image gate**: for a fixed set of ~200 names, our outline must match the Rhino outline within a tolerance (we already have the Rhino side as cached plates plus `/plate-verify`). It also needs an agreement that `.gh` changes trigger a re-run.
- **It is one font.** Each new SKU brings its own `.gh`. If Oleg's scripts are shared across fonts (the `rhino-curve-font-v2` and `addition-anchors-v2` names suggest a shared toolkit), the port carries over. If every product is custom, cost grows per SKU.
- **Effort.** ~4,000 lines of Python into TS, plus NURBS sampling and Clipper2 integration, plus the golden gate. Rough estimate: **3–5 engineer-weeks** for TG-CARRIE without stones, more for stone variants. Oleg reviews; he doesn't build.
- Float and tolerance differences between RhinoCommon booleans and Clipper2 will show up as small glitches at letter joins. The golden gate catches these; somebody still has to fix them.

### D. Hybrid: port the font, keep Rhino for the joins

Port only FONT ASSEMBLY (glyph layout + kerning), which is pure data plus transforms. Keep Rhino (A or B) as the authority. Use the port as a **fast first frame**: show the TS outline instantly and swap in the Rhino-exact sprite when it lands. Partial value; it doubles the code paths. **Not recommended** unless C's golden gate fails only at the joins.

---

## 3. Comparison

| | Fidelity to factory | Unseen name | Ops we own | Running cost | Upfront effort | Who's on the hook |
|---|---|---|---|---|---|---|
| **ShapeDiver (today)** | exact | 0.7–14.6 s solve | none | €499/mo + €0.04/name past 10k | done | ShapeDiver SLA |
| **A. Rhino.Compute** | exact | solve on our VM | Windows VM, Rhino, Pufferfish | ~$35–210/mo | ~1–2 wk (file swap + deploy) | us |
| **B. Desktop batch** | exact | fallback until next batch | one machine + a cron job | ~$0 | ~1 wk | us, **plus a licence question** |
| **C. TS port** | gated, ≈ | **instant** | none beyond our app | ~$0 | **3–5 wk** + per-`.gh` upkeep | us, **plus a drift contract with Oleg** |

---

## 4. Recommendation

> **Update, 2026-11-04 (Yossi):** the letter-join and clean-up scripts are **not shared** across products, so C is paid **per product**. TG-CARRIE comes first; ALWAYS IN MY HEART would be its own port. Yossi prefers C, wants it as a third local demo mode alongside the two existing ones, and rules out **any** paid licensing, which also removes A and B.

**Staged, cheapest gate first. Nothing below needs to be bought or deployed.**

1. **Spike C for 3–4 days before deciding anything.** Load the font JSON, lay out `Yossi`, `Jo`, `Silvia&André` with kerning, union with Clipper2, and diff against our cached Rhino plates in `/plate-verify`. That spike answers the only question that decides between C and A/B: **does the joining logic port cleanly?** If 90%+ of a 200-name set matches within tolerance, C is the long-term answer. If the joins fight us, stop and choose A.
2. **Ask Oleg two questions, both cheap:**
   - Are FONT ASSEMBLY / PAIR SLOTS / CLEAN SHAPE shared across all your fonts and products, or rewritten per product? This decides whether C costs once or per SKU.
   - Would you accept a "preview port" of your scripts, with a golden-image check that runs whenever you change the `.gh`? Without that agreement, C turns into drift.
3. **Ask McNeel** whether option B is allowed on a commercial seat. One email; it decides whether B exists at all.
4. **Keep ShapeDiver live** until one of these wins. Doc 12's verdict still holds for A.

**My expectation:** C wins for the PDP preview, because instant and free-per-name is the product we actually want, and the file turned out to be far more portable than a Grasshopper definition usually is. **A is the fallback** if the spike fails. B is only worth it if McNeel says yes and name cardinality turns out to be low.

---

## 5. Reproducing the Inspection

The `.gh` is a raw-deflate GH_IO archive. Cluster documents are nested raw-deflate streams starting 27 bytes after each `ClusterDocument` key. Script sources are base64, stored just before each `Title` key. Fonts and anchors are plain JSON beginning with `{"format": …}`. My extraction scripts are in the session scratchpad and are not committed; anyone repeating this should copy the `.gh` into an empty directory and run Python with `-I`.
