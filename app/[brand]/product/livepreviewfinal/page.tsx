import { notFound } from 'next/navigation'
import { resolveBrand } from '../../_config/brands'
import ProductDetailPageClient from '../ProductDetailPageClient'
import { finalPreviewProductFor } from '../_templates'

/**
 * The final live preview: `/[brand]/product/livepreviewfinal` shows the
 * theme's final product (as live preview's, but TGR shows the Heritage
 * multiple-name necklace), on one version — the gallery
 * preview + new layout (live preview's V2) — with a mobile layout switch.
 * `/livepreview` itself is untouched.
 */
export default async function FinalLivePreviewPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const productId = finalPreviewProductFor(resolveBrand(brand))
  if (productId === undefined) notFound()
  return <ProductDetailPageClient productId={productId} finalPreview />
}
