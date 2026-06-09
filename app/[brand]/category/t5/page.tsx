import CategoryPageClientT5 from '../CategoryPageClientT5'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPageT5({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CategoryPageClientT5 />
}
