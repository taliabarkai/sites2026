import { notFound } from 'next/navigation'
import { resolveBrand } from '../../_config/brands'
import ProductDetailPageClient from '../ProductDetailPageClient'
import { flowProductFor } from '../_templates'

/**
 * Custom Personalization: `/[brand]/product/custom-personalization` shows the
 * theme's jewelry with several options driving the preview (OAL Inez, TGR
 * Heritage multi-name) or LAL's Music Memories — everything on the page, one
 * version, the gallery first on mobile. Themes without one yet: not found.
 */
export default async function CustomPersonalizationPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const productId = flowProductFor('custom', resolveBrand(brand))
  if (productId === undefined) notFound()
  return <ProductDetailPageClient productId={productId} finalPreview />
}
