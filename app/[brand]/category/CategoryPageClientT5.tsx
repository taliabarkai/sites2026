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
import styles from './CategoryPage.module.css'
import t5Styles from './CategoryPageT5.module.css'
import plpStyles from './PlpVariant.module.css'
import { FilterPanel } from './CategoryFilterPanel'
import { PlpEmpty, PlpGridCard, PlpToolbar, usePlpControls } from './PlpControls'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Data ─────────────────────────────────────────────────────────────────────

const SALE_TILES = [
  { label: 'Necklaces',  href: '#', image: 'https://cdn.oakandluna.com/digital-asset/banners/NECKLACES_banner_HP_OAL.jpg' },
  { label: 'Bracelets',  href: '#', image: 'https://cdn.oakandluna.com/digital-asset/banners/Bracelets-banner_HP_OAL.jpg' },
  { label: 'Earrings',   href: '#', image: 'https://cdn.oakandluna.com/digital-asset/banners/EARRINGS_banner_HP_OAL.jpg' },
  { label: 'Rings',      href: '#', image: 'https://cdn.oakandluna.com/digital-asset/banners/RINGS-banner_HP_OAL.jpg' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

function CategoryPageInnerT5() {
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

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} revealOnScrollUp />

      <main id="main-content">
        <CategoryHero
          brand={brand}
          variant="text-only"
          title="Sale"
          description="Rare, But Real: Grab those discounted Oak and Luna pieces. Shop now, thank us later."
          categories={[
            { label: 'All Trendy Jewelry', href: '#' },
            { label: 'Best Sellers',       href: '#' },
            { label: 'Gifts Under $250',   href: '#' },
            { label: 'Gifts Under $150',   href: '#' },
          ]}
        />

        {/* 4-tile promo grid — above filter bar, no gap */}
        <section className={t5Styles.saleTiles} aria-label="Shop sale by category">
          {SALE_TILES.map((tile) => (
            <a key={tile.label} href={tile.href} className={t5Styles.saleTile}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tile.image} alt={tile.label} className={t5Styles.saleTileImg} loading="lazy" />
              <span className={t5Styles.saleTileLabel}>{tile.label}</span>
            </a>
          ))}
        </section>

        <PlpToolbar brand={brand} controls={controls} />

        <section className={plpStyles.productsSection} aria-label="Products">
          <div className={controls.gridClassName}>
            {products.map((p) => (
              <PlpGridCard key={p.id} product={p} brand={brand} controls={controls} />
            ))}
          </div>

          {products.length === 0 && <PlpEmpty controls={controls} />}
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

export default function CategoryPageClientT5() {
  return <CategoryPageInnerT5 />
}
