import { notFound } from 'next/navigation'
import { resolveBrand } from '../../_config/brands'
import ProductDetailPageClient from '../ProductDetailPageClient'
import { livePreviewProductFor } from '../_templates'

/**
 * One URL for the live-preview demo: `/[brand]/product/livepreview` shows
 * that theme's live-preview product (see LIVE_PREVIEW_TEMPLATE_BY_BRAND), so
 * switching theme in the header swaps the product along with the theme.
 */
export default async function LivePreviewProductPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const productId = livePreviewProductFor(resolveBrand(brand))
  if (productId === undefined) notFound()
  return <ProductDetailPageClient productId={productId} />
}
