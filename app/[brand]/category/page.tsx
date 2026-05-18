import CategoryPageClient from './CategoryPageClient'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CategoryPageClient />
}
