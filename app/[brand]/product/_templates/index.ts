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
  Object.values(PDP_TEMPLATES).find(
    (t) => (t.brand === brand || t.alsoOn?.includes(brand as PdpTemplate['brand'])) && t.productId === productId && t.enabled,
  )

/**
 * The template `/[brand]/product/livepreview` shows for each theme — one URL
 * for the demo: switching theme in the header swaps the product too.
 */
export const LIVE_PREVIEW_TEMPLATE_BY_BRAND: Record<PdpTemplate['brand'], string> = {
  oal: 'oal-inez',
  tgr: 'tgr-classic-name',
  lal: 'lal-music-memories',
  ib:  'tgr-classic-name',
  mnn: 'tgr-classic-name',
}

/** The product id `/[brand]/product/livepreview` renders for this theme. */
export const livePreviewProductFor = (brand: string): number | undefined => {
  const id = LIVE_PREVIEW_TEMPLATE_BY_BRAND[brand as PdpTemplate['brand']]
  return Object.values(PDP_TEMPLATES).find((t) => t.id === id)?.productId
}

/** The template the PDP should render from — none when a bespoke customizer owns the page. */
export const renderedTemplateFor = (brand: string, productId: number): PdpTemplate | undefined => {
  const t = templateForProduct(brand, productId)
  return t && t.renderer !== 'bespoke' ? t : undefined
}

/** For the /live-preview index page. */
export const ALL_TEMPLATES: PdpTemplate[] = Object.values(PDP_TEMPLATES)
