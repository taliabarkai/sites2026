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
import styles from './CategoryPageT3.module.css'
import pcStyles from '../_components/ProductCard/ProductCard.module.css'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import type { ProductItem } from '../../../data/products'
import { CategoryHero } from '../_components/CategoryHero'
import { getSeoCategoryVariant } from '../../../data/seoCategories/variantConfig'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Data — sourced from data/products registry ────────────────────────────

const MATERIAL_FILTERS = [
  { key: 'silver',  label: 'Silver',       swatchVar: 'var(--sterling-silver-925)' },
  { key: 'vermeil', label: 'Gold Vermeil', swatchVar: 'var(--gold-vermeil-18k)' },
  { key: 'solid',   label: 'Solid Gold',   swatchVar: 'var(--solid-gold-14k)' },
  { key: 'white',   label: 'White Gold',   swatchVar: 'var(--white-gold-14k)' },
] as const

type MaterialKey = (typeof MATERIAL_FILTERS)[number]['key']

const SORT_OPTIONS = [
  { key: 'featured',    label: 'Featured' },
  { key: 'price-asc',  label: 'Price: Low to high' },
  { key: 'price-desc', label: 'Price: High to low' },
] as const

type SortKey = typeof SORT_OPTIONS[number]['key']

const DEFAULT_PRODUCT_SWATCHES = [
  'var(--sterling-silver-925)',
  'var(--gold-vermeil-18k)',
  'var(--solid-gold-14k)',
  'var(--rose-gold-plating-18k)',
]

// ─── T3: Rhythm group types ────────────────────────────────────────────────

type RhythmGroup =
  | { type: 'A'; cards: ProductItem[]; featured: ProductItem }
  | { type: 'B'; cards: ProductItem[] }
  | { type: 'C'; cards: ProductItem[]; featured: ProductItem }

function buildRhythmGroups(allProducts: ProductItem[], featuredProducts: ProductItem[]): RhythmGroup[] {
  const groups: RhythmGroup[] = []
  let pi = 0
  let fi = 0

  while (pi < allProducts.length) {
    const cycle = groups.length % 3

    if (cycle === 0) {
      const cards = allProducts.slice(pi, pi + 4)
      if (cards.length === 0) break
      groups.push({ type: 'A', cards, featured: featuredProducts[fi % featuredProducts.length] })
      pi += cards.length
      fi++
    } else if (cycle === 1) {
      const cards = allProducts.slice(pi, pi + 8)
      if (cards.length === 0) break
      groups.push({ type: 'B', cards })
      pi += cards.length
    } else {
      const cards = allProducts.slice(pi, pi + 4)
      if (cards.length === 0) break
      groups.push({ type: 'C', cards, featured: featuredProducts[fi % featuredProducts.length] })
      pi += cards.length
      fi++
    }
  }

  return groups
}

// ─── T3: FeaturedCard — full-bleed image with overlaid product info ────────

function FeaturedCard({
  product,
  swatches,
  slotClassName,
}: {
  product: ProductItem
  swatches?: string[]
  slotClassName: string
}) {
  return (
    <article className={`${styles.featuredCard} ${slotClassName}`}>
      {/* Model image as default; packshot on hover */}
      <img
        src={product.hoverImage ?? product.image}
        alt={product.name}
        className={`${styles.featuredCardImage} ${styles.featuredCardImageDefault}`}
        loading="lazy"
      />
      <img
        src={product.image}
        alt=""
        aria-hidden="true"
        className={`${styles.featuredCardImage} ${styles.featuredCardImageHover}`}
        loading="lazy"
      />
      {/* Info overlaid at the bottom — same classes as ProductCard for identical typography */}
      <div className={styles.featuredCardInfo}>
        {swatches && swatches.length > 0 && (
          <ul className={pcStyles.swatches} aria-label="Available materials">
            {swatches.map((color, i) => (
              <li
                key={i}
                className={pcStyles.swatch}
                style={{ backgroundColor: color }}
                aria-label={`Material option ${i + 1}`}
              />
            ))}
          </ul>
        )}
        <p className={pcStyles.name}>{product.name}</p>
        <div className={pcStyles.prices}>
          {product.originalPrice && (
            <span className={pcStyles.priceOriginal}>{product.originalPrice}</span>
          )}
          <span className={pcStyles.price}>{product.price}</span>
        </div>
      </div>
    </article>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
          <button type="button" className={styles.filterPanelClose} aria-label="Close filters" onClick={onClose}>
            <XIcon size={24} />
          </button>
        </div>
        <div className={styles.filterPanelBody}>
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
                    <span className={styles.materialSwatch} style={{ background: m.swatchVar }} aria-hidden="true" />
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

function CategoryPageInnerT3() {
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

  const allBrandProducts = getBrandProducts(brand)
  const featuredProducts = allBrandProducts.slice(0, 3)
  const products = allBrandProducts.slice(3)
  const rhythmGroups = buildRhythmGroups(products, featuredProducts)

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} sticky={false} />

      <main id="main-content">
        <CategoryHero brand={brand} variant={getSeoCategoryVariant(brand)} />

        <FilterBar
          itemCount={allBrandProducts.length}
          onOpenFilters={() => setFilterPanelOpen(true)}
          FilterIcon={FilterIcon}
        />

        <section className={styles.productsSection} aria-label="Products">
          <div className={styles.productsGridT2}>
            {rhythmGroups.map((group, gi) => {
              if (group.type === 'B') {
                return (
                  <div key={gi} className={styles.rhythmGroup}>
                    {group.cards.map((p) => (
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
                )
              }

              if (group.type === 'A') {
                return (
                  <div key={gi} className={styles.rhythmGroup}>
                    {/* Featured RIGHT: cols 3–4 on desktop; pushed after cards on mobile via order:1 */}
                    <FeaturedCard
                      product={group.featured}
                      swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                      slotClassName={styles.featuredCardRight}
                    />
                    {group.cards.map((p) => (
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
                )
              }

              // Group C — featured LEFT
              return (
                <div key={gi} className={styles.rhythmGroup}>
                  {/* Featured LEFT: cols 1–2 on desktop; appears before cards on mobile */}
                  <FeaturedCard
                    product={group.featured}
                    swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                    slotClassName={styles.featuredCardLeft}
                  />
                  {group.cards.map((p) => (
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
              )
            })}
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
        onContinueToCheckout={() => router.push(`/${brand}/cart`)}
        onGenerateGiftNote={async () => 'Wishing you a wonderful day filled with joy!'}
      />

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
    </div>
  )
}

export default function CategoryPageClientT3() {
  return <CategoryPageInnerT3 />
}
