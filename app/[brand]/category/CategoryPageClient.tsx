'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '../_context/CartContext'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { FloatingCart } from '../_components/FloatingCart'
import { ProductCard, toQuickAddProduct } from '../_components/ProductCard'
import { getBrandFromPathname } from '../_config/brands'
import { tgrRatingProps } from './tgrProductRatings'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
} from '../_config/siteContent'
import { DEFAULT_PRODUCT_SWATCHES } from '../_config/products'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import { BRAND_HIGHLIGHTS } from '../_config/highlights'
import { CategoryBanner } from '../_components/CategoryBanner'
import { CategoryHero } from '../_components/CategoryHero'
import { HighlightsBar } from '../_components/HighlightsBar'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './CategoryPage.module.css'
import {
  FilterPanel,
  type MaterialKey,
  type SortKey,
} from './CategoryFilterPanel'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const


// ─── Category image data ──────────────────────────────────────────────────────

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterBar({
  itemCount,
  activeCount,
  onOpenFilters,
  FilterIcon,
}: {
  itemCount: number
  activeCount: number
  onOpenFilters: () => void
  FilterIcon: React.ComponentType<{ size?: number }>
}) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterBarInner}>
        <div className={styles.filterRight}>
          <span className={styles.itemCount}>{itemCount} items</span>
          <button
            type="button"
            className={styles.filtersTrigger}
            onClick={onOpenFilters}
            aria-label="Open filters"
          >
            <FilterIcon size={24} />
            Filters{activeCount > 0 && <span className={styles.filtersTriggerCount}>({activeCount})</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CategoryPageInner() {
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

  // Story-style shortcuts, same source as the homepage's bar; every circle
  // points back at the category page.
  const highlights = BRAND_HIGHLIGHTS[brand].map((item) => ({
    ...item,
    href: `/${brand}/category`,
  }))

  const icons = BRAND_ICONS[brand]
  const { FilterIcon, XIcon, ChevronIcon, CheckmarkIcon, StarIcon } = icons

  const [activeMaterials, setActiveMaterials] = useState<Set<MaterialKey>>(new Set())
  const toggleMaterial = (key: MaterialKey) => {
    setActiveMaterials((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }
  const clearAllMaterials = () => setActiveMaterials(new Set())

  const [sortKey, setSortKey] = useState<SortKey>('featured')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const { items, isOpen, subtotal, closeCart, removeItem } = useCart()
  const router = useRouter()

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} sticky={false} />

      <main id="main-content">
        <HighlightsBar items={highlights} showOnDesktop />

        <CategoryBanner />

        {/* Text-only pills rather than the image cards — the banner above
            already carries the imagery for this page. */}
        <CategoryHero brand={brand} variant="text-only" title="Best Sellers" />

        <FilterBar
          itemCount={getBrandProducts(brand).length}
          activeCount={activeMaterials.size}
          onOpenFilters={() => setFilterPanelOpen(true)}
          FilterIcon={FilterIcon}
        />

        <section className={styles.productsSection} aria-label="Products">
          <div className={styles.productsGrid}>
            {getBrandProducts(brand).slice(0, 12).map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                price={p.price ?? ''}
                originalPrice={p.originalPrice}
                defaultImage={p.image}
                hoverImage={p.hoverImage}
                href={`/${brand}${p.href}`}
                quickAddProduct={toQuickAddProduct(p)}
                swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                {...tgrRatingProps(brand, p, StarIcon)}
              />
            ))}
          </div>

          <div className={styles.editorialBlock}>
            <p className={styles.editorialText}>
              &ldquo;These are pieces that live with you, not just on you. Something you don&rsquo;t have to take off when you move between roles in your day.&rdquo;
            </p>
          </div>

          {getBrandProducts(brand).length > 12 && (
            <div className={styles.productsGrid}>
              {getBrandProducts(brand).slice(12).map((p) => (
                <ProductCard
                  key={p.id}
                  name={p.name}
                  price={p.price ?? ''}
                  originalPrice={p.originalPrice}
                  defaultImage={p.image}
                  hoverImage={p.hoverImage}
                  href={`/${brand}${p.href}`}
                  quickAddProduct={toQuickAddProduct(p)}
                  swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                  {...tgrRatingProps(brand, p, StarIcon)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer columns={footerColumns} />

      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        activeMaterials={activeMaterials}
        onToggleMaterial={toggleMaterial}
        onClearAll={clearAllMaterials}
        sortKey={sortKey}
        onSortChange={setSortKey}
        itemCount={getBrandProducts(brand).length}
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

export default function CategoryPageClient() {
  return <CategoryPageInner />
}
