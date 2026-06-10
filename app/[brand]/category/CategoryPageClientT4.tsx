'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '../_context/CartContext'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { FloatingCart } from '../_components/FloatingCart'
import { ProductCard } from '../_components/ProductCard'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
} from '../_config/siteContent'
import { DEFAULT_PRODUCT_SWATCHES } from '../_config/products'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import { Button } from '../_components/Button'
import { FilterChips } from '../_components/FilterChips'
import { CategoryHero } from '../_components/CategoryHero'
import { getSeoCategoryVariant } from '../../../data/seoCategories/variantConfig'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import baseStyles from './CategoryPage.module.css'
import t4Styles from './CategoryPageT4.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Data ─────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { key: 'featured',    label: 'Featured' },
  { key: 'price-asc',  label: 'Price: Low to high' },
  { key: 'price-desc', label: 'Price: High to low' },
] as const

type SortKey = typeof SORT_OPTIONS[number]['key']

const MATERIAL_FILTERS = [
  { key: 'stainless-steel',   label: 'Stainless Steel',   swatch: '#a8a9ad' },
  { key: 'sterling-silver',   label: 'Sterling Silver',   swatch: 'var(--sterling-silver-925)' },
  { key: 'gold-vermeil',      label: 'Gold Vermeil',      swatch: 'var(--gold-vermeil-18k)' },
  { key: 'gold-plated',       label: 'Gold Plated',       swatch: 'var(--solid-gold-14k)' },
  { key: 'yellow-gold',       label: 'Yellow Gold',       swatch: 'var(--solid-gold-14k)' },
  { key: 'rose-gold-vermeil', label: 'Rose Gold Vermeil', swatch: 'var(--rose-gold-14k)' },
  { key: 'rose-gold-plating', label: 'Rose Gold Plating', swatch: 'var(--rose-gold-plating-18k)' },
  { key: 'rose-gold',         label: 'Rose Gold',         swatch: 'var(--rose-gold-14k)' },
  { key: 'white-gold',        label: 'White Gold',        swatch: 'var(--white-gold-14k)' },
  { key: 'mixed-metals',      label: 'Mixed Metals',      swatch: 'linear-gradient(135deg, var(--gold-vermeil-18k) 50%, var(--sterling-silver-925) 50%)' },
  { key: 'lab-diamond',       label: 'Lab Diamond',       swatch: '#f0f0f0' },
  { key: 'gemstones',         label: 'Gemstones',         swatch: '#2d6a4f' },
  { key: 'pearls',            label: 'Pearls',            swatch: '#f5f0eb' },
] as const

type MaterialKey = typeof MATERIAL_FILTERS[number]['key']

const CATEGORY_TILES = [
  { label: 'Shop Tennis Bracelets', href: '#', image: 'https://cdn.oakandluna.com/digital-asset/product/advantage-engraved-tennis-bracelet-silver-3.jpg' },
  { label: 'Shop Custom Name Necklaces', href: '#', image: 'https://cdn.oakandluna.com/digital-asset/product/soltale-bordeaux-belle-name-necklace-gold-vermeil-3.jpg' },
  { label: 'Shop Earrings', href: '#', image: 'https://cdn.oakandluna.com/digital-asset/product/interlace-earrings-gold-vermeil-4.jpg' },
]

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  isOpen,
  onClose,
  activeMaterials,
  onToggleMaterial,
  onClearAll,
  itemCount,
  sortKey,
  onSortChange,
  XIcon,
  ChevronIcon,
  CheckmarkIcon,
}: {
  isOpen: boolean
  onClose: () => void
  activeMaterials: Set<MaterialKey>
  onToggleMaterial: (key: MaterialKey) => void
  onClearAll: () => void
  itemCount: number
  sortKey: SortKey
  onSortChange: (key: SortKey) => void
  XIcon: React.ComponentType<{ size?: number }>
  ChevronIcon: React.ComponentType<{ size?: number }>
  CheckmarkIcon: React.ComponentType<{ size?: number }>
}) {
  const [sortExpanded, setSortExpanded] = useState(true)

  return (
    <>
      <div
        className={`${baseStyles.filterOverlay} ${isOpen ? baseStyles.filterOverlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${baseStyles.filterPanel} ${isOpen ? baseStyles.filterPanelOpen : ''}`}
        role="dialog"
        aria-label="Filters"
        aria-modal="true"
      >
        <div className={baseStyles.filterPanelHeader}>
          <h2 className={baseStyles.filterPanelTitle}>Filters</h2>
          <button
            type="button"
            className={baseStyles.filterPanelClose}
            aria-label="Close filters"
            onClick={onClose}
          >
            <XIcon size={24} />
          </button>
        </div>

        {(() => {
          const activeList = MATERIAL_FILTERS.filter(m => activeMaterials.has(m.key))
          return activeList.length > 0 && (
            <div className={baseStyles.filterActiveChips}>
              <FilterChips
                chips={activeList.map(m => ({ value: m.key, label: m.label }))}
                onRemove={(value) => onToggleMaterial(value as MaterialKey)}
                onClearAll={onClearAll}
                XIcon={XIcon}
              />
            </div>
          )
        })()}

        <div className={baseStyles.filterPanelBody}>
          <div className={baseStyles.filterSection}>
            <button
              type="button"
              className={baseStyles.filterSortHeader}
              onClick={() => setSortExpanded(o => !o)}
              aria-expanded={sortExpanded}
            >
              <span className={baseStyles.filterSectionTitle}>Sort By:</span>
              <span className={baseStyles.filterSortValue}>
                {SORT_OPTIONS.find(o => o.key === sortKey)?.label}
                <span style={{ display: 'inline-flex', transform: sortExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform var(--transition-fast)' }}>
                  <ChevronIcon size={24} />
                </span>
              </span>
            </button>
            {sortExpanded && (
              <div className={baseStyles.sortOptions} role="radiogroup" aria-label="Sort by">
                {SORT_OPTIONS.map((opt) => (
                  <label key={opt.key} className={baseStyles.sortOption}>
                    <input
                      type="radio"
                      name="sort"
                      value={opt.key}
                      checked={sortKey === opt.key}
                      onChange={() => onSortChange(opt.key)}
                      className={baseStyles.sortOptionInput}
                    />
                    <span className={baseStyles.sortOptionLabel}>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className={baseStyles.filterSection}>
            <p className={baseStyles.filterSectionTitle}>Materials</p>
            <div className={baseStyles.materialList}>
              {MATERIAL_FILTERS.map((m) => {
                const active = activeMaterials.has(m.key)
                return (
                  <button
                    key={m.key}
                    type="button"
                    className={`${baseStyles.materialItem} ${active ? baseStyles.materialItemActive : ''}`}
                    onClick={() => onToggleMaterial(m.key)}
                    aria-pressed={active}
                  >
                    <span
                      className={baseStyles.materialSwatch}
                      style={{ background: m.swatch }}
                      aria-hidden="true"
                    />
                    <span className={baseStyles.materialLabel}>{m.label}</span>
                    {active && (
                      <span className={baseStyles.materialCheck} aria-hidden="true">
                        <CheckmarkIcon size={18} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className={baseStyles.filterPanelFooter}>
          <Button variant="primary" className={baseStyles.filterViewItems} onClick={onClose}>
            View Items ({itemCount})
          </Button>
        </div>
      </div>
    </>
  )
}

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
    <div className={baseStyles.filterBar}>
      <div className={baseStyles.filterBarInner}>
        <div className={baseStyles.filterRight}>
          <span className={baseStyles.itemCount}>{itemCount} items</span>
          <button
            type="button"
            className={baseStyles.filtersTrigger}
            onClick={onOpenFilters}
            aria-label="Open filters"
          >
            <FilterIcon size={24} />
            Filters{activeCount > 0 && <span className={baseStyles.filtersTriggerCount}>({activeCount})</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

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
  }

  const icons = BRAND_ICONS[brand]
  const { FilterIcon, XIcon, ChevronIcon, CheckmarkIcon } = icons

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

  const allProducts = getBrandProducts(brand)
  const firstBatch = allProducts.slice(0, 12)
  const remainingBatch = allProducts.slice(12)

  return (
    <div className={baseStyles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} sticky={false} />

      <main id="main-content">
        <CategoryHero brand={brand} variant={getSeoCategoryVariant(brand)} title="New In" />

        <FilterBar
          itemCount={allProducts.length}
          activeCount={activeMaterials.size}
          onOpenFilters={() => setFilterPanelOpen(true)}
          FilterIcon={FilterIcon}
        />

        <section className={baseStyles.productsSection} aria-label="Products">
          {/* First 8 products */}
          <div className={baseStyles.productsGrid}>
            {firstBatch.map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                price={p.price ?? ''}
                originalPrice={p.originalPrice}
                defaultImage={p.image}
                hoverImage={p.hoverImage}
                href={`/${brand}${p.href}`}
                swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
              />
            ))}
          </div>

          {/* Best sellers carousel — full-bleed on mobile, within margins on desktop */}
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

          {/* Remaining products */}
          {remainingBatch.length > 0 && (
            <div className={baseStyles.productsGrid}>
              {remainingBatch.map((p) => (
                <ProductCard
                  key={p.id}
                  name={p.name}
                  price={p.price ?? ''}
                  originalPrice={p.originalPrice}
                  defaultImage={p.image}
                  hoverImage={p.hoverImage}
                  href={`/${brand}${p.href}`}
                  swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
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
        itemCount={allProducts.length}
        sortKey={sortKey}
        onSortChange={setSortKey}
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
