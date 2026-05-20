'use client'

import { useParams } from 'next/navigation'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_HERO,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
} from './_config/siteContent'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from './_config/brandPaths'
import { CartProvider, useCart } from './_context/CartContext'
import { Footer } from './_components/Footer'
import { Header } from './_components/Header'
import { Hero } from './_components/Hero'
import { FloatingCart } from './_components/FloatingCart'
import styles from './HomePage.module.css'

import { resolveBrand } from './_config/brands'

function HomePageInner() {
  const params = useParams()
  const brandParam = typeof params.brand === 'string' ? params.brand : 'oal'
  const brand = resolveBrand(brandParam)

  const { items, isOpen, subtotal, closeCart, removeItem } = useCart()

  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)

  const hero = {
    ...DEFAULT_HERO,
    ctaPrimary: {
      ...DEFAULT_HERO.ctaPrimary,
      href: withBrandPrefix(brand, DEFAULT_HERO.ctaPrimary.href),
    },
    ctaSecondary: {
      ...DEFAULT_HERO.ctaSecondary,
      href: withBrandPrefix(brand, DEFAULT_HERO.ctaSecondary.href),
    },
  }

  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref: withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
  }

  const transparentHeader = brand === 'oal'

  return (
    <div className={styles.page}>
      <Header
        variant={transparentHeader ? 'transparent' : 'white'}
        brand={brand}
        navLinks={navLinks}
        topline={topline}
      />
      <main id="main-content">
        <Hero {...hero} transparentHeader={transparentHeader} />
      </main>
      <Footer columns={footerColumns} />
      <FloatingCart
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        subtotal={subtotal}
        onRemoveItem={removeItem}
        onEditItem={() => {}}
        onContinueToCheckout={() => {}}
        onGenerateGiftNote={async () => 'Wishing you a wonderful day filled with joy!'}
      />
    </div>
  )
}

export function HomePageClient() {
  return (
    <CartProvider>
      <HomePageInner />
    </CartProvider>
  )
}
