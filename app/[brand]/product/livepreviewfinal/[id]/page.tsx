import ProductDetailPageClient from '../../ProductDetailPageClient'

/** Any product in the final live preview — the Best Sellers links on a final page land here. */
export default async function FinalLivePreviewProductPage({ params }: { params: Promise<{ brand: string; id: string }> }) {
  const { id } = await params
  return <ProductDetailPageClient productId={Number(id)} finalPreview />
}
