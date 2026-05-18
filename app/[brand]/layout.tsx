import '@/styles/themes/oal.css'
import '@/styles/themes/tgr.css'
import '@/styles/themes/lal.css'
import '@/styles/themes/ib.css'
import '@/styles/themes/mnn.css'

const VALID_BRANDS = ['oal', 'tgr', 'lal', 'ib', 'mnn']

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ brand: string }>
}) {
  const { brand } = await params
  const resolvedBrand = VALID_BRANDS.includes(brand) ? brand : 'oal'

  return <div data-theme={resolvedBrand}>{children}</div>
}
