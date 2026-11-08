/**
 * Server-side studio settings per SKU — the stand-in for the XPM preset the
 * production integration will read (necklace-studio/HANDOFF.md §2, §5.2).
 * The page sends only sku + name + coating; everything that changes the
 * rendered plate is decided here, never by the browser.
 *
 * Only plate/render settings belong here (engine/settings.ts `where:
 * 'plate' | 'render'`); the chain's physics runs in the browser on the
 * schema defaults.
 */
export const NECKLACE_PROFILES: Record<string, Record<string, string>> = {
  // TGR Carrie (Classic Name): one plate
  'TGR-CLASSIC-COCKTAIL-NAME': { preset: 'LC_7.5' },
  // TGR Heritage: 2–5 plates on one chain
  'TGR-HERITAGE-MULTI-NAME': { preset: 'LC_7.5' },
}
