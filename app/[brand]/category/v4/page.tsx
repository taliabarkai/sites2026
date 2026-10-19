import CategoryPageClientV4 from '../CategoryPageClientV4'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPageV4({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CategoryPageClientV4 />
}
