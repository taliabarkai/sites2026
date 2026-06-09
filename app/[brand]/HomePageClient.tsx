'use client'

import { useParams } from 'next/navigation'
import { useRef } from 'react'
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
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

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
  const { ArrowIcon } = BRAND_ICONS[brand]
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (dir: 'prev' | 'next') => {
    if (!carouselRef.current) return
    const card = carouselRef.current.firstElementChild as HTMLElement
    const amount = card ? card.offsetWidth + 4 : 320
    carouselRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  // 'text-on-image' — title + CTA overlaid bottom-left, no padding between cards (OAL)
  // 'text-below'    — title + CTA below the image, with page-margin padding (all other brands)
  const promoVariant: 'text-on-image' | 'text-below' = brand === 'oal' ? 'text-on-image' : 'text-below'

  const CATEGORY_TILES = [
    { label: 'Necklaces', href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/NECKLACES_banner_HP_OAL.jpg' },
    { label: 'Bracelets', href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/Bracelets-banner_HP_OAL.jpg' },
    { label: 'Earrings',  href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/EARRINGS_banner_HP_OAL.jpg' },
    { label: 'Rings',     href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/RINGS-banner_HP_OAL.jpg' },
  ]

  const PROMO_TILES = [
    { title: 'The Summer Centerpiece', label: 'Shop Now', href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/Summer-shop-gradient.jpg?w=1920' },
    { title: 'His New Daily Anchor',   label: 'Shop Now', href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/oal-box1-Hexagon-F_Day.jpg?w=1920' },
    { title: 'Get Some Attention',     label: 'Shop Now', href: `/${brand}/category`, image: 'https://cdn.oakandluna.com/digital-asset/banners/oal-lower-banner-Compass-mb_2.jpg' },
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tile.image} alt={tile.label} className={styles.categoryTileImg} loading="lazy" />
              <span className={styles.categoryTileLabel}>{tile.label}</span>
            </a>
          ))}
        </section>

        {/* Best sellers carousel */}
        <section className={styles.bestSellers} aria-labelledby="best-sellers-title">
          <div className={styles.bestSellersHeader}>
            <h2 id="best-sellers-title" className={styles.bestSellersTitle}>Best Sellers</h2>
          </div>
          <div className={styles.carouselWrapper}>
            <div className={styles.carouselTrack} ref={carouselRef}>
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
            <button
              className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
              onClick={() => scrollCarousel('prev')}
              aria-label="Previous products"
            >
              <ArrowIcon size={24} color="white" />
            </button>
            <button
              className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
              onClick={() => scrollCarousel('next')}
              aria-label="Next products"
            >
              <ArrowIcon size={24} color="white" />
            </button>
          </div>
        </section>

        {/* Promo image carousel */}
        <section
          className={`${styles.promoCarousel} ${promoVariant === 'text-on-image' ? styles.promoCarouselOnImage : ''}`}
          aria-label="Featured collections"
        >
          <div className={`${styles.promoCarouselTrack} ${promoVariant === 'text-on-image' ? styles.promoCarouselTrackOnImage : ''}`}>
            {PROMO_TILES.map((tile, i) => promoVariant === 'text-on-image' ? (
              // Text overlaid on bottom-left of image — single link wraps everything
              <a key={i} href={tile.href} className={`${styles.promoCarouselCard} ${styles.promoCarouselCardOnImage}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tile.image} alt={tile.title} className={styles.promoCarouselImg} loading="lazy" />
                <div className={styles.promoCarouselOverlay}>
                  <h3 className={styles.promoCarouselTitle}>{tile.title}</h3>
                  <span className={styles.promoCarouselCta}>{tile.label}</span>
                </div>
              </a>
            ) : (
              // Text below the image
              <div key={i} className={styles.promoCarouselCard}>
                <a href={tile.href} className={styles.promoCarouselImgLink}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tile.image} alt={tile.title} className={styles.promoCarouselImg} loading="lazy" />
                </a>
                <h3 className={styles.promoCarouselTitle}>{tile.title}</h3>
                <a href={tile.href} className={styles.promoCarouselCta}>{tile.label}</a>
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
