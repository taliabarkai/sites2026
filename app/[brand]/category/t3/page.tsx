import CategoryPageClientT3 from '../CategoryPageClientT3'
import { parseStlVariant } from '../stlVariant'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CategoryPageT3({ params, searchParams }: PageProps) {
  await params
  const { stl } = await searchParams
  // Shop The Look preview variant — restored from ?stl= on load (default: current)
  return <CategoryPageClientT3 initialStlVariant={parseStlVariant(stl)} />
}
