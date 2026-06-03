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
import styles from './CategoryPageT2.module.css'
import pcStyles from '../_components/ProductCard/ProductCard.module.css'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Product {
  id: number
  name: string
  price: string
  originalPrice?: string
  defaultImage: string
  hoverImage: string
}

const products: Product[] = [
  { id: 1,  name: 'Lock & Luna Charm with Round Cut Moissanite — Gold', price: '$105', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-6.jpg',  hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-4.jpg' },
  { id: 2,  name: 'Engraved Compass Necklace with Diamond — Gold Vermeil', price: '$150', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/engraved-comprass-necklace-gold-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/engraved-comprass-necklace-gold-vermeil-3.jpg' },
  { id: 3,  name: 'Willow Tag Initial Necklace with Diamond — Gold Vermeil', price: '$120', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-10.jpg' },
  { id: 4,  name: 'Herringbone Engraved Slim Chain Necklace — Gold Vermeil', price: '$95',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/herringbone-thin-chain-necklace-gold-vermeil-4.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/herringbone-thin-chain-necklace-gold-vermeil-2.jpg' },
  { id: 5,  name: 'Singapore Chain Name Necklace — Gold Vermeil', price: '$110', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-9.jpg' },
  { id: 6,  name: 'Inez Initial Heart Necklace with Diamond — Gold Vermeil', price: '$130', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/red-heart-inez-initial-necklace-with-diamond-gold-vermeil-2.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/red-heart-inez-initial-necklace-with-diamond-gold-vermeil-5.jpg' },
  { id: 7,  name: 'Initial Lock Necklace — Gold Plated', price: '$85',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/initial-lock-necklace-in-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/initial-lock-necklace-in-vermeil-3.jpg' },
  { id: 8,  name: 'Heart Charm Lock Necklace — Gold Plated', price: '$90',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/heart-charm-padlock-necklace-gold-vermeil-16.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/heart-charm-padlock-necklace-gold-vermeil-10.jpg' },
  { id: 9,  name: 'Inez Initial Necklace with Diamonds — Gold Vermeil', price: '$145', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-12.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-9.jpg' },
  { id: 10, name: 'Pillar Bar Necklace — Gold Plated', price: '$80',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/pillar-bar-necklace-18k-gold-vermeil-16.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/pillar-bar-necklace-18k-gold-vermeil-24.jpg' },
  { id: 11, name: 'Engraved Dot Bracelet — Silver', price: '$75',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/engraved-dot-bracelet-silver-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/engraved-dot-bracelet-silver-6.jpg' },
  { id: 12, name: 'Lock & Luna Charm with Emerald Cut Moissanite — Silver', price: '$115', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-emerald-cut-moissanite-silver-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-emerald-cut-moissanite-silver-4.jpg' },
  { id: 13, name: 'Belle Custom Name Necklace — Gold Plated', price: '$100', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/belle-custom-name-necklace-gold-vermeil-33.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/belle-custom-name-necklace-gold-vermeil-35.jpg' },
  { id: 14, name: 'Singapore Chain Name Necklace with Heart Shaped Gemstone — Gold Vermeil', price: '$135', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-with-pink-heart-mosinight-gold-vermeil-13.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-with-pink-heart-mosinight-gold-vermeil-15.jpg' },
  { id: 15, name: 'Ivy Name Paperclip Chain Bracelet — Gold Plated', price: '$88',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/ivy-name-link-chain-bracelet-gold-plating-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/ivy-name-link-chain-bracelet-gold-plating-11.jpg' },
  { id: 16, name: 'Multiple Name Necklace — Gold Vermeil', price: '$125', defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/multiple-name-necklace-vermeil-gold-plated-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/multiple-name-necklace-vermeil-gold-plated-3.jpg' },
  { id: 17, name: 'Mon Petit Name Necklace — Gold Plated', price: '$92',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/mon-petit-name-necklace-vermeil-gold-plated-14.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/mon-petit-name-necklace-gold-plated-1.jpg' },
  { id: 18, name: 'Bubble Up Initial Necklace — Gold Plated', price: '$78',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/bubble-up-initial-necklace-gold-vermeil-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/bubble-up-initial-necklace-gold-vermeil-4.jpg' },
  { id: 19, name: 'Petite Paperclip Necklace with Moissanite — Gold Plated', price: '$98',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/petite-paperclip-necklace-with-diamond-gold-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/petite-paperclip-necklace-with-diamond-gold-vermeil-5.jpg' },
  { id: 20, name: 'Puffy Heart Pendant — Gold Plated', price: '$72',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/puffy-heart-pendant-gold-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/puffy-heart-pendant-gold-2.jpg' },
  { id: 21, name: 'Willow Disc Initial Necklace — Gold Vermeil', price: '$108', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-disc-initial-necklace-gold-vermeil-9.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-disc-initial-necklace-gold-vermeil-13.jpg' },
  { id: 22, name: 'Ivy Name Paperclip Chain Necklace with Sparkling Stones — Gold Plated', price: '$118', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/ivy-name-link-chain-necklace-gold-plated-with-birthstones-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/ivy-name-link-chain-necklace-gold-plated-with-birthstones-3.jpg' },
  { id: 23, name: 'The Charmer Coins & Initials Necklace — Gold Plated', price: '$140', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/the-charmer-coins-initials-necklace-gold-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/the-charmer-coins-initials-necklace-gold-vermeil-3.jpg' },
  { id: 24, name: 'My Signature Initial — Gold', price: '$95',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/my-signature-initial-gold-vermeil-10.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/my-signature-initial-gold-vermeil-4.jpg' },
  { id: 25, name: 'Initial Necklace — Gold Plated', price: '$82',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/initial-necklace-gold-vermeil-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/initial-necklace-gold-vermeil-14.jpg' },
  { id: 26, name: 'Inez Initial Necklace — Gold Plated', price: '$79',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/inez-initial-necklace-gold-plated-2.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-plated-1.jpg' },
]

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

// ─── T2: Featured product data ────────────────────────────────────────────

const featuredProducts: Product[] = [
  {
    id: 100,
    name: 'Willow Tag Initial Necklace with Diamond — Gold Vermeil',
    price: '$120',
    defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-6.jpg',
    hoverImage:   'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-10.jpg',
  },
  {
    id: 101,
    name: 'Singapore Chain Name Necklace — Gold Vermeil',
    price: '$110',
    defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-8.jpg',
    hoverImage:   'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-9.jpg',
  },
  {
    id: 102,
    name: 'Lock & Luna Charm with Round Cut Moissanite — Gold Vermeil',
    price: '$105',
    defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-6.jpg',
    hoverImage:   'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-4.jpg',
  },
]

// ─── T2: Rhythm group types ────────────────────────────────────────────────

type RhythmGroup =
  | { type: 'A'; cards: Product[]; featured: Product }
  | { type: 'B'; cards: Product[] }
  | { type: 'C'; cards: Product[]; featured: Product }

function buildRhythmGroups(allProducts: Product[]): RhythmGroup[] {
  const groups: RhythmGroup[] = []
  let pi = 0
  let fi = 0

  while (pi < allProducts.length) {
    const cycle = groups.length % 3

    if (cycle === 0) {
      // Group A — 4 cards + featured RIGHT
      const cards = allProducts.slice(pi, pi + 4)
      if (cards.length === 0) break
      groups.push({ type: 'A', cards, featured: featuredProducts[fi % featuredProducts.length] })
      pi += cards.length
      fi++
    } else if (cycle === 1) {
      // Group B — 8 cards, no featured
      const cards = allProducts.slice(pi, pi + 8)
      if (cards.length === 0) break
      groups.push({ type: 'B', cards })
      pi += cards.length
    } else {
      // Group C — featured LEFT + 4 cards
      const cards = allProducts.slice(pi, pi + 4)
      if (cards.length === 0) break
      groups.push({ type: 'C', cards, featured: featuredProducts[fi % featuredProducts.length] })
      pi += cards.length
      fi++
    }
  }

  return groups
}

// ─── T2: FeaturedCard component ───────────────────────────────────────────

function FeaturedCard({
  product,
  swatches,
  slotClassName,
}: {
  product: Product
  swatches?: string[]
  slotClassName: string
}) {
  return (
    <article className={`${styles.featuredCard} ${slotClassName}`}>
      <div className={styles.featuredCardImageWrap}>
        <img
          src={product.hoverImage ?? product.defaultImage}
          alt={product.name}
          className={`${pcStyles.image} ${pcStyles.imageDefault}`}
          loading="lazy"
        />
        <img
          src={product.defaultImage}
          alt=""
          aria-hidden="true"
          className={`${pcStyles.image} ${pcStyles.imageHover}`}
          loading="lazy"
        />
      </div>
      {/* Info section uses ProductCard module classes directly — identical rendering guaranteed */}
      <div className={pcStyles.info}>
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

const CATEGORY_ITEMS = [
  { label: 'Best Selling Bracelets',    src: 'https://cdn.oakandluna.com/digital-asset/product/engraved-dot-bracelet-silver-8.jpg' },
  { label: 'Best Selling Earrings',     src: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-9.jpg' },
  { label: 'Best Selling Rings',        src: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-10.jpg' },
  { label: 'Best Selling Fine Jewelry', src: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-9.jpg' },
]

function CategoryHero({ brand }: { brand: string }) {
  const isOal = brand === 'oal'
  const count = CATEGORY_ITEMS.length
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

function CategoryPageInnerT2() {
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

  const rhythmGroups = buildRhythmGroups(products)

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} sticky={false} />

      <main id="main-content">
        <CategoryHero brand={brand} />

        <FilterBar
          itemCount={products.length}
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
                        price={p.price}
                        originalPrice={p.originalPrice}
                        defaultImage={p.defaultImage}
                        hoverImage={p.hoverImage}
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
                        price={p.price}
                        originalPrice={p.originalPrice}
                        defaultImage={p.defaultImage}
                        hoverImage={p.hoverImage}
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
                      price={p.price}
                      originalPrice={p.originalPrice}
                      defaultImage={p.defaultImage}
                      hoverImage={p.hoverImage}
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

export default function CategoryPageClientT2() {
  return <CategoryPageInnerT2 />
}
