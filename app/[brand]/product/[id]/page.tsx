import ProductDetailPageClient from '../ProductDetailPageClient'

type PageProps = {
  params: Promise<{ brand: string; id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  return <ProductDetailPageClient productId={Number(id)} />
}
