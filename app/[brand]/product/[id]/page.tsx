import ProductDetailPageClient from '../ProductDetailPageClient'

type PageProps = {
  params: Promise<{ brand: string; id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams
  const previewId = typeof sp.preview === 'string' ? sp.preview : undefined
  // `4a` — product 4 as it was before its PDP template: the template is
  // skipped, so the product's own personalize flow shows
  const withoutTemplate = /^\d+a$/i.test(id)
  return (
    <ProductDetailPageClient
      productId={Number(withoutTemplate ? id.slice(0, -1) : id)}
      previewId={previewId}
      withoutTemplate={withoutTemplate}
    />
  )
}
