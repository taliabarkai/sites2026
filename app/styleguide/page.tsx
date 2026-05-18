import StyleguideClient from './StyleguideClient'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function StyleguidePage({ searchParams }: PageProps) {
  await searchParams
  return <StyleguideClient />
}
