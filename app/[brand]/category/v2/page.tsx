import CategoryPageClientV2 from '../CategoryPageClientV2'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPageV2({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CategoryPageClientV2 />
}
