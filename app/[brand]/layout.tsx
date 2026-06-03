import '@/styles/themes/oal.css'
import '@/styles/themes/tgr.css'
import '@/styles/themes/lal.css'
import '@/styles/themes/ib.css'
import '@/styles/themes/mnn.css'
import '@/styles/typography-tokens.css'

import { isBrandKey } from './_config/brands'
import { CartProvider } from './_context/CartContext'

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
      {/* Google Fonts — all brands */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Bebas+Neue&family=Akatab:wght@400;600;700&family=Lato:wght@300;400;700&family=Poppins:wght@300;400;600;700&family=Assistant:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <CartProvider>
        <div data-theme={resolvedBrand}>{children}</div>
      </CartProvider>
    </>
  )
}
