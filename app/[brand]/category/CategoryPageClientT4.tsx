'use client'

import { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '../_context/CartContext'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { FloatingCart } from '../_components/FloatingCart'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
} from '../_config/siteContent'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import { CategoryHero } from '../_components/CategoryHero'
import { getSeoCategoryVariant } from '../../../data/seoCategories/variantConfig'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import baseStyles from './CategoryPage.module.css'
import plpStyles from './PlpVariant.module.css'
import { FilterPanel } from './CategoryFilterPanel'
import { PlpEmpty, PlpGridCard, PlpToolbar, usePlpControls } from './PlpControls'
import t4Styles from './CategoryPageT4.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORY_TILES = [
  { label: 'Shop Tennis Bracelets', href: '#', image: 'https://cdn.oakandluna.com/digital-asset/product/advantage-engraved-tennis-bracelet-silver-3.jpg' },
  { label: 'Shop Custom Name Necklaces', href: '#', image: 'https://cdn.oakandluna.com/digital-asset/product/soltale-bordeaux-belle-name-necklace-gold-vermeil-3.jpg' },
  { label: 'Shop Earrings', href: '#', image: 'https://cdn.oakandluna.com/digital-asset/product/interlace-earrings-gold-vermeil-4.jpg' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

function CategoryPageInnerT4() {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  const { XIcon, ChevronIcon, CheckmarkIcon } = BRAND_ICONS[brand]

  const { items, isOpen, subtotal, closeCart, removeItem } = useCart()
  const router = useRouter()

  const allProducts = useMemo(() => getBrandProducts(brand), [brand])
  const controls = usePlpControls(allProducts)
  const products = controls.filtered

  // Customer Faves sits after three full rows: 4 across, or 5 across images-only.
  const firstCount = controls.desktopDense ? 15 : 12
  const firstBatch = products.slice(0, firstCount)
  const remainingBatch = products.slice(firstCount)

  return (
    <div className={baseStyles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} revealOnScrollUp />

      <main id="main-content">
        <CategoryHero brand={brand} variant={getSeoCategoryVariant(brand)} title="New In" />

        <PlpToolbar brand={brand} controls={controls} />

        <section className={plpStyles.productsSection} aria-label="Products">
          <div className={controls.gridClassName}>
            {firstBatch.map((p) => (
              <PlpGridCard key={p.id} product={p} brand={brand} controls={controls} />
            ))}
          </div>

          {products.length === 0 && <PlpEmpty controls={controls} />}

          {/* Best sellers carousel — full-bleed on mobile, within margins on desktop */}
          {firstBatch.length > 0 && (
            <section className={t4Styles.categorySection} aria-label="Shop our best sellers">
              <h2 className={t4Styles.categorySectionTitle}>Customer Faves</h2>
              <div className={t4Styles.categoryCarouselTrack}>
                {CATEGORY_TILES.map((tile) => (
                  <div key={tile.label} className={t4Styles.categoryCarouselCard}>
                    <a href={tile.href} className={t4Styles.categoryCarouselImgLink}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tile.image} alt={tile.label} className={t4Styles.categoryCarouselImg} loading="lazy" />
                    </a>
                    <a href={tile.href} className={t4Styles.categoryCarouselCta}>{tile.label}</a>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Remaining products */}
          {remainingBatch.length > 0 && (
            <div className={controls.gridClassName}>
              {remainingBatch.map((p) => (
                <PlpGridCard key={p.id} product={p} brand={brand} controls={controls} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer columns={footerColumns} />

      <FilterPanel
        isOpen={controls.filterPanelOpen}
        onClose={() => controls.setFilterPanelOpen(false)}
        activeMaterials={controls.activeMaterials}
        onToggleMaterial={controls.toggleMaterial}
        onClearAll={controls.clearAllMaterials}
        itemCount={products.length}
        sortKey={controls.sortKey}
        onSortChange={controls.setSortKey}
        XIcon={XIcon}
        ChevronIcon={ChevronIcon}
        CheckmarkIcon={CheckmarkIcon}
      />

      <FloatingCart
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        subtotal={subtotal}
        onRemoveItem={removeItem}
        onEditItem={() => {}}
        onContinueToCheckout={() => router.push(`/${brand}/cart`)}
        onGenerateGiftNote={async () => 'Wishing you a wonderful day filled with joy!'}
      />
    </div>
  )
}

export default function CategoryPageClientT4() {
  return <CategoryPageInnerT4 />
}
