import CategoryPageClientT4 from '../CategoryPageClientT4'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPageT4({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CategoryPageClientT4 />
}
