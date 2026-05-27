import CategoryPageClientT3 from '../CategoryPageClientT3'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPageT3({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CategoryPageClientT3 />
}
