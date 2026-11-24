import { notFound } from 'next/navigation'
import { resolveBrand } from '../../_config/brands'
import ProductDetailPageClient from '../ProductDetailPageClient'
import { flowProductFor } from '../_templates'

/**
 * Simple Personalization: `/[brand]/product/simple-personalization` shows the
 * theme's single-name necklace (Classic Name) on the live preview's V2 —
 * gallery preview + new layout — with the gallery first on mobile and the
 * product name and details under it. No version switches (those stay on the
 * live preview prototype, /[brand]/product/livepreview).
 */
export default async function SimplePersonalizationPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const productId = flowProductFor('simple', resolveBrand(brand))
  if (productId === undefined) notFound()
  return <ProductDetailPageClient productId={productId} simpleFlow />
}
