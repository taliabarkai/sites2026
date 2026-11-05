import type { PdpTemplate } from './pdpTemplate'
import { lalMusicMemories } from './templates/lalMusicMemories'
import { tgrClassicName } from './templates/tgrClassicName'
import { tgrHeritageMultiName } from './templates/tgrHeritageMultiName'
import { oalInez } from './templates/oalInez'

export * from './pdpTemplate'

/** Every template the mockup knows, keyed by SKU — the same key Catalog 2.0 uses. */
export const PDP_TEMPLATES: Record<string, PdpTemplate> = Object.fromEntries(
  [lalMusicMemories, tgrClassicName, tgrHeritageMultiName, oalInez].map((t) => [t.sku, t]),
)

export const templateBySku = (sku: string): PdpTemplate | undefined => PDP_TEMPLATES[sku]

/** The mockup routes by brand + numeric product id; production routes by SKU. */
export const templateForProduct = (brand: string, productId: number): PdpTemplate | undefined =>
  Object.values(PDP_TEMPLATES).find((t) => t.brand === brand && t.productId === productId && t.enabled)

/** For the /live-preview index page. */
export const ALL_TEMPLATES: PdpTemplate[] = Object.values(PDP_TEMPLATES)
