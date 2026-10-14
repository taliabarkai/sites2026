import CustomerFeedbackClient from './CustomerFeedbackClient'
import { parseSuccessVersion } from './successVersion'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CustomerFeedbackPage({ params, searchParams }: PageProps) {
  await params
  const { v } = await searchParams
  // The success version picked in ?v= carries through to the screen after Submit
  return <CustomerFeedbackClient initialVersion={parseSuccessVersion(v)} />
}
