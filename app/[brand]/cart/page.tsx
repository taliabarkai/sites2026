import CartPageClient from './CartPageClient'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CartPage({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CartPageClient />
}
