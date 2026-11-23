import ProductDetailPageClient from '../../ProductDetailPageClient'

/** Any product in Custom Personalization — the Best Sellers links on its pages land here. */
export default async function CustomPersonalizationProductPage({ params }: { params: Promise<{ brand: string; id: string }> }) {
  const { id } = await params
  return <ProductDetailPageClient productId={Number(id)} finalPreview />
}
