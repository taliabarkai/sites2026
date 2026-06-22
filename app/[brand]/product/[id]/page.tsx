import ProductDetailPageClient from '../ProductDetailPageClient'

type PageProps = {
  params: Promise<{ brand: string; id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams
  const previewId = typeof sp.preview === 'string' ? sp.preview : undefined
  return <ProductDetailPageClient productId={Number(id)} previewId={previewId} />
}
