import type { PdpTemplate } from './pdpTemplate'
import type { PersonalizationFlow } from '../../_config/personalizationFlows'
import { lalMusicMemories } from './templates/lalMusicMemories'
import { tgrClassicName } from './templates/tgrClassicName'
import { tgrHeritageMultiName } from './templates/tgrHeritageMultiName'
import { oalInez } from './templates/oalInez'
import { oalInezHeartPremium } from './templates/oalInezHeartPremium'

export * from './pdpTemplate'

/** Every template the mockup knows, keyed by SKU — the same key Catalog 2.0 uses. */
export const PDP_TEMPLATES: Record<string, PdpTemplate> = Object.fromEntries(
  [lalMusicMemories, tgrClassicName, tgrHeritageMultiName, oalInez, oalInezHeartPremium].map((t) => [t.sku, t]),
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

/**
 * The personalization flows' product per theme (see _config/personalizationFlows):
 * Simple — the single-name necklace (Classic Name, on every jewelry theme);
 * Custom — the jewelry with several options (OAL Inez, TGR Heritage multi-name)
 * and LAL's Music Memories. A theme missing here has no page in that flow yet.
 */
const FINAL_FLOW_TEMPLATES: Partial<Record<PdpTemplate['brand'], string>> = {
  oal: 'tgr-classic-name', tgr: 'tgr-classic-name', ib: 'tgr-classic-name', mnn: 'tgr-classic-name', lal: 'lal-music-memories',
}

/**
 * The final flows' products with several options (complex), per theme — each
 * flow takes them as it takes the name necklace. Only the themes that have one.
 */
export const FINAL_FLOW_COMPLEX_TEMPLATES: Partial<Record<PdpTemplate['brand'], string>> = {
  oal: 'oal-inez', tgr: 'tgr-heritage-multi-name',
}

export const templateProductId = (templateId: string): number | undefined =>
  Object.values(PDP_TEMPLATES).find((t) => t.id === templateId)?.productId

export const FLOW_TEMPLATE_BY_BRAND: Record<PersonalizationFlow, Partial<Record<PdpTemplate['brand'], string>>> = {
  simple: { oal: 'tgr-classic-name', tgr: 'tgr-classic-name', ib: 'tgr-classic-name', mnn: 'tgr-classic-name' },
  custom: { oal: 'oal-inez', tgr: 'tgr-heritage-multi-name', lal: 'lal-music-memories' },
  // The final flows: the name necklace on every jewelry theme, Music Memories on LAL
  v1: FINAL_FLOW_TEMPLATES,
  v2: FINAL_FLOW_TEMPLATES,
  v3: FINAL_FLOW_TEMPLATES,
}

/** The product id a personalization flow's page renders for this theme. */
export const flowProductFor = (flow: PersonalizationFlow, brand: string): number | undefined => {
  const id = FLOW_TEMPLATE_BY_BRAND[flow][brand as PdpTemplate['brand']]
  return id ? Object.values(PDP_TEMPLATES).find((t) => t.id === id)?.productId : undefined
}

/** The template the PDP should render from — none when a bespoke customizer owns the page. */
export const renderedTemplateFor = (brand: string, productId: number): PdpTemplate | undefined => {
  const t = templateForProduct(brand, productId)
  return t && t.renderer !== 'bespoke' ? t : undefined
}

/** For the /live-preview index page. */
export const ALL_TEMPLATES: PdpTemplate[] = Object.values(PDP_TEMPLATES)
