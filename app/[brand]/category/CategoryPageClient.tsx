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
import { PRODUCTS, DEFAULT_PRODUCT_SWATCHES } from '../_config/products'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './CategoryPage.module.css'

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

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  isOpen,
  onClose,
  activeMaterials,
  onToggleMaterial,
  sortKey,
  onSortChange,
  XIcon,
  ChevronIcon,
}: {
  isOpen: boolean
  onClose: () => void
  activeMaterials: Set<MaterialKey>
  onToggleMaterial: (key: MaterialKey) => void
  sortKey: SortKey
  onSortChange: (key: SortKey) => void
  XIcon: React.ComponentType<{ size?: number }>
  ChevronIcon: React.ComponentType<{ size?: number }>
}) {
  const [sortExpanded, setSortExpanded] = useState(true)

  return (
    <>
      <div
        className={`${styles.filterOverlay} ${isOpen ? styles.filterOverlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.filterPanel} ${isOpen ? styles.filterPanelOpen : ''}`}
        role="dialog"
        aria-label="Filters"
        aria-modal="true"
      >
        <div className={styles.filterPanelHeader}>
          <h2 className={styles.filterPanelTitle}>Filters</h2>
          <button
            type="button"
            className={styles.filterPanelClose}
            aria-label="Close filters"
            onClick={onClose}
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className={styles.filterPanelBody}>
          {/* Sort By */}
          <div className={styles.filterSection}>
            <button
              type="button"
              className={styles.filterSortHeader}
              onClick={() => setSortExpanded(o => !o)}
              aria-expanded={sortExpanded}
            >
              <span className={styles.filterSectionTitle}>Sort By:</span>
              <span className={styles.filterSortValue}>
                {SORT_OPTIONS.find(o => o.key === sortKey)?.label}
                <span style={{ display: 'inline-flex', transform: sortExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform var(--transition-fast)' }}>
                  <ChevronIcon size={24} />
                </span>
              </span>
            </button>
            {sortExpanded && (
              <div className={styles.sortOptions} role="radiogroup" aria-label="Sort by">
                {SORT_OPTIONS.map((opt) => (
                  <label key={opt.key} className={styles.sortOption}>
                    <input
                      type="radio"
                      name="sort"
                      value={opt.key}
                      checked={sortKey === opt.key}
                      onChange={() => onSortChange(opt.key)}
                      className={styles.sortOptionInput}
                    />
                    <span className={styles.sortOptionLabel}>{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Materials */}
          <div className={styles.filterSection}>
            <p className={styles.filterSectionTitle}>Materials</p>
            <div className={styles.materialList}>
              {MATERIAL_FILTERS.map((m) => {
                const active = activeMaterials.has(m.key)
                return (
                  <button
                    key={m.key}
                    type="button"
                    className={`${styles.materialItem} ${active ? styles.materialItemActive : ''}`}
                    onClick={() => onToggleMaterial(m.key)}
                    aria-pressed={active}
                  >
                    <span
                      className={styles.materialSwatch}
                      style={{ background: m.swatch }}
                      aria-hidden="true"
                    />
                    <span className={styles.materialLabel}>{m.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Category image data ──────────────────────────────────────────────────────

const CATEGORY_ITEMS = [
  { label: 'Best Selling Bracelets',    src: 'https://cdn.oakandluna.com/digital-asset/product/engraved-dot-bracelet-silver-8.jpg' },
  { label: 'Best Selling Earrings',     src: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-9.jpg' },
  { label: 'Best Selling Rings',        src: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-10.jpg' },
  { label: 'Best Selling Fine Jewelry', src: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-9.jpg' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryHero({ brand }: { brand: string }) {
  const isOal = brand === 'oal'
  const count = CATEGORY_ITEMS.length
  // 2→2 cols, 4→4 cols, 6→3 cols (2 rows), etc.
  const oalCols = count <= 4 ? count : Math.ceil(count / 2)

  return (
    <section className={isOal ? styles.heroOal : styles.hero} aria-label="Category">
      <div className={isOal ? styles.heroTextOal : undefined}>
        <h1 className={styles.heroTitle}>Necklaces for Women</h1>
        <p className={styles.heroDescription}>
          Capture your unique personality effortlessly with pendants for women, as your jewelry should be just as unique as you are.
        </p>
      </div>
      <div
        className={isOal ? styles.categoryContainerOal : styles.categoryContainerDefault}
        style={isOal ? { maxWidth: `${oalCols * 160 + (oalCols - 1) * 16}px` } : undefined}
      >
        {CATEGORY_ITEMS.map((cat) => (
          <div key={cat.label} className={styles.categoryItem}>
            <div className={styles.categoryImageWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cat.src} alt={cat.label} className={styles.categoryImage} loading="lazy" />
            </div>
            <span className={styles.categoryLabel}>{cat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FilterBar({
  itemCount,
  onOpenFilters,
  FilterIcon,
}: {
  itemCount: number
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
            Filters
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
  }

  const icons = BRAND_ICONS[brand]
  const { FilterIcon, XIcon, ChevronIcon } = icons

  const [activeMaterials, setActiveMaterials] = useState<Set<MaterialKey>>(new Set())
  const toggleMaterial = (key: MaterialKey) => {
    setActiveMaterials((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const [sortKey, setSortKey] = useState<SortKey>('featured')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const { items, isOpen, subtotal, closeCart, removeItem } = useCart()
  const router = useRouter()

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} sticky={false} />

      <main id="main-content">
        <CategoryHero brand={brand} />

        <FilterBar
          itemCount={PRODUCTS.length}
          onOpenFilters={() => setFilterPanelOpen(true)}
          FilterIcon={FilterIcon}
        />

        <section className={styles.productsSection} aria-label="Products">
          <div className={styles.productsGrid}>
            {PRODUCTS.map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                price={p.price}
                originalPrice={p.originalPrice}
                defaultImage={p.defaultImage}
                hoverImage={p.hoverImage}
                href={`/${brand}/product/${p.id}`}
                swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer columns={footerColumns} />

      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        activeMaterials={activeMaterials}
        onToggleMaterial={toggleMaterial}
        sortKey={sortKey}
        onSortChange={setSortKey}
        XIcon={XIcon}
        ChevronIcon={ChevronIcon}
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
