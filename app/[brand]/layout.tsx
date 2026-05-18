import '@/styles/themes/oal.css'
import '@/styles/themes/tgr.css'
import '@/styles/themes/lal.css'
import '@/styles/themes/ib.css'
import '@/styles/themes/mnn.css'

import { isBrandKey } from './_config/brands'

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ brand: string }>
}) {
  const { brand } = await params
  const resolvedBrand = isBrandKey(brand) ? brand : 'oal'

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Akatab:wght@400;600;700&family=EB+Garamond:wght@400;700&family=Lato:wght@300;400;700&family=Poppins:wght@300;400;600;700&family=Assistant:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <div data-theme={resolvedBrand}>{children}</div>
    </>
  )
}
