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
import baseStyles from './CategoryPage.module.css'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import { Button } from '../_components/Button'
import { FilterChips } from '../_components/FilterChips'
import type { ProductItem } from '../../../data/products'
import { CategoryHero } from '../_components/CategoryHero'
import { getSeoCategoryVariant } from '../../../data/seoCategories/variantConfig'
import { HotspotImage } from '../_components/HotspotImage'
import type { HotspotPinData } from '../_components/HotspotImage'
import type { QuickAddProduct } from '../_components/QuickAddPanel'
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
  | { type: 'B'; cards: ProductItem[]; trailingFeatured?: ProductItem }
  | { type: 'C'; cards: ProductItem[]; featured: ProductItem }
  | { type: 'D'; cards: ProductItem[]; featured: ProductItem }

function buildRhythmGroups(allProducts: ProductItem[], featuredProducts: ProductItem[]): RhythmGroup[] {
  const groups: RhythmGroup[] = []
  let pi = 0

  // Row 1: 4-slot banner (2 cols × 2 rows) + 4 cards
  const g0 = allProducts.slice(pi, pi + 4)
  if (g0.length > 0) { groups.push({ type: 'A', cards: g0, featured: featuredProducts[0] }); pi += g0.length }

  // Row 2: 8 plain cards
  const g1 = allProducts.slice(pi, pi + 8)
  if (g1.length > 0) { groups.push({ type: 'B', cards: g1 }); pi += g1.length }

  // Row 3: 2-slot banner (2 cols × 1 row) + 6 cards
  const g2 = allProducts.slice(pi, pi + 6)
  if (g2.length > 0) { groups.push({ type: 'D', cards: g2, featured: featuredProducts[0] }); pi += g2.length }

  // Remaining products: plain 8-up rows
  while (pi < allProducts.length) {
    const cards = allProducts.slice(pi, pi + 8)
    if (cards.length === 0) break
    groups.push({ type: 'B', cards })
    pi += cards.length
  }

  // Append 1-slot banner as the trailing item in the last B group so it
  // auto-places into the next available grid cell (not a new row)
  const lastB = groups.slice().reverse().find(g => g.type === 'B')
  if (lastB && lastB.type === 'B') {
    lastB.trailingFeatured = featuredProducts[0]
  }

  return groups
}

// ─── T3: Banner tile configs ───────────────────────────────────────────────

// Tile 2 — STACK EM UP: ring products with hotspot pins
const STACK_RING_1: QuickAddProduct = {
  title: 'Rix Solitaire Diamond Ring — Gold Vermeil',
  price: 12500,
  salePrice: 13500,
  currency: '$',
  rating: 4.8,
  reviewCount: 247,
  images: [
    { src: 'https://cdn.oakandluna.com/digital-asset/product/my-signature-initial-gold-vermeil-10.jpg', alt: 'Rix Solitaire Diamond Ring' },
    { src: 'https://cdn.oakandluna.com/digital-asset/product/my-signature-initial-gold-vermeil-4.jpg', alt: 'Rix Solitaire Diamond Ring detail' },
  ],
  pdpUrl: '/product/24',
  options: [
    {
      name: 'Metal',
      type: 'swatch',
      values: [
        { label: 'Gold Vermeil', value: 'vermeil', color: 'var(--gold-vermeil-18k)', price: 0 },
        { label: 'Sterling Silver', value: 'silver', color: 'var(--sterling-silver-925)', price: -2000 },
        { label: 'Solid 14k Gold', value: 'solid-14k', color: 'var(--solid-gold-14k)', price: 5000 },
        { label: 'Rose Gold', value: 'rose', color: 'var(--rose-gold-14k)', price: 1500 },
      ],
    },
    { name: 'Add Initials', type: 'text-input', maxLength: 2, placeholder: 'e.g. A' },
    {
      name: 'Ring Size',
      type: 'pills',
      values: ['5', '6', '7', '8', '9'].map(s => ({ label: s, value: s })),
    },
  ],
}

const STACK_RING_2: QuickAddProduct = {
  title: 'Wave Stacking Ring — Sterling Silver',
  price: 8500,
  currency: '$',
  rating: 4.6,
  reviewCount: 183,
  images: [
    { src: 'https://cdn.oakandluna.com/digital-asset/product/initial-necklace-gold-vermeil-8.jpg', alt: 'Wave Stacking Ring' },
    { src: 'https://cdn.oakandluna.com/digital-asset/product/initial-necklace-gold-vermeil-14.jpg', alt: 'Wave Stacking Ring detail' },
  ],
  pdpUrl: '/product/25',
  options: [
    {
      name: 'Metal',
      type: 'swatch',
      values: [
        { label: 'Sterling Silver', value: 'silver', color: 'var(--sterling-silver-925)', price: 0 },
        { label: 'Gold Vermeil', value: 'vermeil', color: 'var(--gold-vermeil-18k)', price: 2000 },
      ],
    },
    {
      name: 'Ring Size',
      type: 'pills',
      values: ['5', '6', '7', '8', '9'].map(s => ({ label: s, value: s })),
    },
  ],
}

const STACK_RING_3: QuickAddProduct = {
  title: 'Chunky Twisted Ring — Gold Plated',
  price: 9500,
  currency: '$',
  rating: 4.7,
  reviewCount: 312,
  images: [
    { src: 'https://cdn.oakandluna.com/digital-asset/product/puffy-heart-pendant-gold-1.jpg', alt: 'Chunky Twisted Ring' },
    { src: 'https://cdn.oakandluna.com/digital-asset/product/puffy-heart-pendant-gold-2.jpg', alt: 'Chunky Twisted Ring detail' },
  ],
  pdpUrl: '/product/26',
  options: [
    {
      name: 'Metal',
      type: 'swatch',
      values: [
        { label: 'Gold Plated', value: 'vermeil', color: 'var(--gold-vermeil-18k)', price: 0 },
        { label: 'Rose Gold', value: 'rose', color: 'var(--rose-gold-14k)', price: 1500 },
      ],
    },
    {
      name: 'Ring Size',
      type: 'pills',
      values: ['5', '6', '7', '8', '9'].map(s => ({ label: s, value: s })),
    },
  ],
}

const STACK_EM_UP_PINS: HotspotPinData[] = [
  { x: 63, y: 28, pinColor: 'dark', product: STACK_RING_1 }, // top-right: diamond solitaire ring
  { x: 26, y: 55, pinColor: 'dark', product: STACK_RING_2 }, // left: silver braided ring
  { x: 73, y: 71, pinColor: 'dark', product: STACK_RING_3 }, // bottom-center: gold chunky ring
]

// Map featured product id → tile config (id 1 = Wedding Shop, id 2 = Stack Em Up, id 3 = placeholder)
type TileConfig =
  | { type: 'static'; image: string; imageAlt: string; headline: string }
  | { type: 'hotspot'; image: string; imageAlt: string; headline: string; pins: HotspotPinData[] }

const TILE_CONFIGS: Record<number, TileConfig> = {
  1: {
    type: 'hotspot',
    image: 'https://cdn.oakandluna.com/digital-asset/banners/RINGS-banner_HP_OAL.jpg',
    imageAlt: 'Stack Em Up — ring collection',
    headline: 'Stack Em Up',
    pins: STACK_EM_UP_PINS,
  },
}

// ─── T3: FeaturedCard — resolves to a tile config by product id ───────────

function FeaturedCard({
  product,
  swatches: _swatches,
  slotClassName,
}: {
  product: ProductItem
  swatches?: string[]
  slotClassName: string
}) {
  const config = TILE_CONFIGS[product.id] ?? TILE_CONFIGS[1]!

  if (config.type === 'hotspot') {
    return (
      <article className={`${styles.featuredCard} ${slotClassName}`}>
        <HotspotImage
          src={config.image}
          alt={config.imageAlt}
          pins={config.pins}
        >
          <p className={styles.bannerHeadline}>{config.headline}</p>
        </HotspotImage>
      </article>
    )
  }

  // Static banner (Tiles 1 & 3)
  return (
    <article className={`${styles.featuredCard} ${slotClassName}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={config.image}
        alt={config.imageAlt}
        className={styles.bannerImage}
        loading="lazy"
      />
      <p className={styles.bannerHeadline}>{config.headline}</p>
    </article>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterPanel({
  isOpen,
  onClose,
  activeMaterials,
  onToggleMaterial,
  onClearAll,
  sortKey,
  onSortChange,
  itemCount,
  XIcon,
  ChevronIcon,
  CheckmarkIcon,
}: {
  isOpen: boolean
  onClose: () => void
  activeMaterials: Set<MaterialKey>
  onToggleMaterial: (key: MaterialKey) => void
  onClearAll: () => void
  sortKey: SortKey
  onSortChange: (key: SortKey) => void
  itemCount: number
  XIcon: React.ComponentType<{ size?: number }>
  ChevronIcon: React.ComponentType<{ size?: number }>
  CheckmarkIcon: React.ComponentType<{ size?: number }>
}) {
  const [sortExpanded, setSortExpanded] = useState(true)
  const activeList = MATERIAL_FILTERS.filter(m => activeMaterials.has(m.key))
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
        {activeList.length > 0 && (
          <div className={baseStyles.filterActiveChips}>
            <FilterChips
              chips={activeList.map(m => ({ value: m.key, label: m.label }))}
              onRemove={(value) => onToggleMaterial(value as MaterialKey)}
              onClearAll={onClearAll}
              XIcon={XIcon}
            />
          </div>
        )}
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


function FilterBar({
  itemCount,
  onOpenFilters,
  activeCount,
  FilterIcon,
}: {
  itemCount: number
  onOpenFilters: () => void
  activeCount: number
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
            Filters{activeCount > 0 && <span className={baseStyles.filtersTriggerCount}>({activeCount})</span>}
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

  const allBrandProducts = getBrandProducts(brand)
  const featuredProducts = allBrandProducts.slice(0, 3)
  const products = allBrandProducts.slice(3)
  const rhythmGroups = buildRhythmGroups(products, featuredProducts)

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} sticky={false} />

      <main id="main-content">
        <CategoryHero brand={brand} variant={getSeoCategoryVariant(brand)} title="Shop All" />

        <FilterBar
          itemCount={allBrandProducts.length}
          onOpenFilters={() => setFilterPanelOpen(true)}
          activeCount={activeMaterials.size}
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
                    {group.trailingFeatured && (
                      <FeaturedCard
                        product={group.trailingFeatured}
                        swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                        slotClassName={styles.featuredCardSingle}
                      />
                    )}
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

              // Group D — wide banner (2 cols × 1 row) + 6 cards
              if (group.type === 'D') {
                return (
                  <div key={gi} className={styles.rhythmGroup}>
                    <FeaturedCard
                      product={group.featured}
                      swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                      slotClassName={styles.featuredCardWide}
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
        onClearAll={clearAllMaterials}
        sortKey={sortKey}
        onSortChange={setSortKey}
        itemCount={allBrandProducts.length}
        XIcon={XIcon}
        ChevronIcon={ChevronIcon}
        CheckmarkIcon={CheckmarkIcon}
      />
    </div>
  )
}

export default function CategoryPageClientT3() {
  return <CategoryPageInnerT3 />
}
