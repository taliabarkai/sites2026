import type { Metadata } from 'next'
import { getBrandMeta, resolveBrand } from '../_config/brands'
import { AccessibilityShowcase } from './AccessibilityShowcase'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>
}): Promise<Metadata> {
  const { brand } = await params
  return { title: `Accessibility — ${getBrandMeta(resolveBrand(brand)).label}` }
}

export default async function AccessibilityPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  return <AccessibilityShowcase brand={resolveBrand(brand)} />
}
