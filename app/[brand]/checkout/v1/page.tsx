import CheckoutPageClientV1 from '../CheckoutPageClientV1'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CheckoutPageV1({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <CheckoutPageClientV1 />
}
