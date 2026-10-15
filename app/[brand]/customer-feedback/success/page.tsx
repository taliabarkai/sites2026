import CustomerFeedbackClient from '../CustomerFeedbackClient'
import { parseSuccessVersion } from '../successVersion'

type PageProps = {
  params: Promise<{ brand: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Shareable link straight to the feedback success screen — no need to fill in
 * and submit the form first. ?v=v1 | v2 | v3 | v4 picks the version (default v3).
 */
export default async function CustomerFeedbackSuccessPage({ params, searchParams }: PageProps) {
  await params
  const { v } = await searchParams
  return <CustomerFeedbackClient initialSubmitted initialVersion={parseSuccessVersion(v)} />
}
