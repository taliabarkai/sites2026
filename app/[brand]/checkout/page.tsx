import CheckoutPageClient from './CheckoutPageClient'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CheckoutPageClient />
}
