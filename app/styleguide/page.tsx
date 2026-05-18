import StyleguidePageClient from './StyleguidePageClient'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function StyleguidePage({ searchParams }: PageProps) {
  await searchParams
  return <StyleguidePageClient />
}
