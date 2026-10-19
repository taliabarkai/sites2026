import CategoryPageClientV3 from '../CategoryPageClientV3'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPageV3({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CategoryPageClientV3 />
}
