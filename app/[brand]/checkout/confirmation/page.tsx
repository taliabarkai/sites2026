import ConfirmationPageClient from './ConfirmationPageClient'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrderConfirmationPage({ params, searchParams }: PageProps) {
  await params
  await searchParams
  return <ConfirmationPageClient />
}
