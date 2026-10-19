import CategoryPageClientV1 from '../CategoryPageClientV1'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPageV1({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CategoryPageClientV1 />
}
