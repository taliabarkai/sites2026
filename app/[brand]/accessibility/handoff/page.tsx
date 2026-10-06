import type { Metadata } from 'next'
import { getBrandMeta, resolveBrand } from '../../_config/brands'
import { HandoffShowcase } from './HandoffShowcase'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>
}): Promise<Metadata> {
  const { brand } = await params
  return { title: `Accessibility handoff — ${getBrandMeta(resolveBrand(brand)).label}` }
}

export default async function AccessibilityHandoffPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  return <HandoffShowcase brand={resolveBrand(brand)} />
}
