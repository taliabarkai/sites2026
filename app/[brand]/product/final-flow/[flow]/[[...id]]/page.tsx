import { notFound } from 'next/navigation'
import { resolveBrand } from '../../../../_config/brands'
import { isFinalFlow } from '../../../../_config/personalizationFlows'
import ProductDetailPageClient from '../../../ProductDetailPageClient'
import { flowProductFor } from '../../../_templates'

/**
 * The final flows: `/[brand]/product/final-flow/v1|v2|v3` shows the theme's
 * name necklace (Music Memories on LAL); `/…/v1/[id]` any other product in the
 * same flow — the complex ones (OAL Inez, TGR Heritage), and the Best Sellers
 * links on its pages. See _config/personalizationFlows.
 */
export default async function FinalFlowPage({ params }: { params: Promise<{ brand: string; flow: string; id?: string[] }> }) {
  const { brand, flow, id } = await params
  if (!isFinalFlow(flow) || (id && id.length > 1)) notFound()
  const productId = id?.[0] !== undefined ? Number(id[0]) : flowProductFor(flow, resolveBrand(brand))
  if (productId === undefined || Number.isNaN(productId)) notFound()
  return <ProductDetailPageClient productId={productId} finalFlow={flow} />
}
