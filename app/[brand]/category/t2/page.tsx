import CategoryPageClientT2 from '../CategoryPageClientT2'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPageT2({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CategoryPageClientT2 />
}
