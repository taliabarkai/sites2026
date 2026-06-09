'use client'

import { useParams } from 'next/navigation'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_HERO,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
} from './_config/siteContent'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from './_config/brandPaths'
import { useCart } from './_context/CartContext'
import { Footer } from './_components/Footer'
import { Header } from './_components/Header'
import { Hero } from './_components/Hero'
import { FloatingCart } from './_components/FloatingCart'
import { ProductCard } from './_components/ProductCard'
import { DEFAULT_PRODUCT_SWATCHES } from './_config/products'
import { getBrandProducts } from '../../data/products/getBrandProducts'
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

  const bestSellers = getBrandProducts(brand).slice(0, 8)

  const CATEGORY_TILES = [
    { label: 'Necklaces', href: `/${brand}/category` },
    { label: 'Bracelets', href: `/${brand}/category` },
    { label: 'Earrings', href: `/${brand}/category` },
    { label: 'Rings', href: `/${brand}/category` },
  ]

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

        {/* 4-up category grid */}
        <section className={styles.categoryGrid} aria-label="Shop by category">
          {CATEGORY_TILES.map(tile => (
            <a key={tile.label} href={tile.href} className={styles.categoryTile}>
              {/* image src to be filled with CDN links */}
              <span className={styles.categoryTileLabel}>{tile.label}</span>
            </a>
          ))}
        </section>

        {/* Best sellers carousel */}
        <section className={styles.bestSellers} aria-labelledby="best-sellers-title">
          <div className={styles.bestSellersHeader}>
            <h2 id="best-sellers-title" className={styles.bestSellersTitle}>Best Sellers</h2>
          </div>
          <div className={styles.carouselTrack}>
            {bestSellers.map(p => (
              <div key={p.id} className={styles.carouselCard}>
                <ProductCard
                  name={p.name}
                  price={p.price ?? ''}
                  originalPrice={p.originalPrice}
                  defaultImage={p.image}
                  hoverImage={p.hoverImage}
                  href={`/${brand}${p.href}`}
                  swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                />
              </div>
            ))}
          </div>
        </section>
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
  return <HomePageInner />
}
