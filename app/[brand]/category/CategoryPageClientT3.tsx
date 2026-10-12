'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '../_context/CartContext'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { FloatingCart } from '../_components/FloatingCart'
import { ProductCard, toQuickAddProduct } from '../_components/ProductCard'
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
import { tgrRatingProps } from './tgrProductRatings'
import { HotspotImage } from '../_components/HotspotImage'
import type { HotspotPinData } from '../_components/HotspotImage'
import type { QuickAddProduct } from '../_components/QuickAddPanel'
import { ShopTheLookBannerV1 } from '../_components/ShopTheLookBannerV1'
import { ShopTheLookBannerV3 } from '../_components/ShopTheLookBannerV3'
import { ShopTheLookPanel } from '../_components/ShopTheLookPanel'
import type { ShopTheLookItem } from '../_components/ShopTheLookPanel'
import { VariantToggle } from '../_components/VariantToggle'
import type { StlVariant } from './stlVariant'
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
    headline: 'Shop The Look',
    pins: STACK_EM_UP_PINS,
  },
}

function resolveTile(product: ProductItem): TileConfig {
  return TILE_CONFIGS[product.id] ?? TILE_CONFIGS[1]!
}

// ─── T3: Shop The Look preview variant (?stl=current | ?stl=v1) ───────────

const STL_VARIANT_OPTIONS: { value: StlVariant; label: string }[] = [
  { value: 'current', label: 'Current' },
  { value: 'v1',      label: 'V1' },
  { value: 'v2',      label: 'V2' },
  { value: 'v3',      label: 'V3' },
]

function formatCents(cents: number, currency = '$'): string {
  return `${currency}${(cents / 100).toFixed(0)}`
}

/**
 * Hotspot pins → ProductCard props for the Shop The Look panel. The pins are
 * the single source of truth, so the Current hotspots and the V1 panel always
 * show the same products. Card chrome follows the grid's rules: swatches on
 * every brand but LAL, review stars on TGR and LAL only.
 */
function pinsToLookItems(
  pins: HotspotPinData[],
  brand: string,
  StarIcon: React.ComponentType<{ size?: number }>,
): ShopTheLookItem[] {
  return pins.map(({ product: p }) => {
    const swatches = p.options
      .find((o) => o.type === 'swatch')
      ?.values?.map((v) => v.color)
      .filter((c): c is string => Boolean(c))
    const showRating = (brand === 'tgr' || brand === 'lal') && p.rating != null && p.reviewCount != null
    return {
      id: p.pdpUrl,
      name: p.title,
      price: formatCents(p.price, p.currency),
      originalPrice: p.salePrice ? formatCents(p.salePrice, p.currency) : undefined,
      defaultImage: p.images[0]?.src ?? '',
      hoverImage: p.images[1]?.src,
      href: `/${brand}${p.pdpUrl}`,
      quickAddProduct: p,
      squareImage: true,
      swatches: brand !== 'lal' ? swatches : undefined,
      ...(showRating ? { rating: p.rating, reviewCount: p.reviewCount, StarIcon } : {}),
    }
  })
}

// ─── T3: Desktop banner height — end at the product images, not the card text ─
//
// From 1440px a banner spans N grid rows of product cards. Left to stretch, it
// would run past the last row's product name and price; instead its height is
// set so its bottom lines up with the bottom of that row's product images.
// Below 1440px the banner is a full-width row sized by its image — untouched.

function useAlignBannerToCardImages(ref: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current
    const group = el?.parentElement
    if (!el || !group) return

    const desktop = window.matchMedia('(min-width: 1440px)')

    const align = () => {
      el.style.height = ''
      el.style.alignSelf = ''
      if (!desktop.matches) return

      const { gridRowStart, gridRowEnd } = getComputedStyle(el)
      const span = Number(gridRowEnd) - Number(gridRowStart)
      if (!Number.isFinite(span) || span < 1) return

      const top = el.getBoundingClientRect().top
      // One image per sibling card (the card's default image fills its frame).
      const images = Array.from(group.children)
        .filter((c) => c !== el)
        .map((c) => c.querySelector('img')?.getBoundingClientRect())
        .filter((r): r is DOMRect => Boolean(r) && r!.top >= top - 1)
      // Rows the banner spans, by distinct image top; take the last one's bottom.
      const rowTops = [...new Set(images.map((r) => Math.round(r.top)))].sort((a, b) => a - b)
      const lastRowTop = rowTops[span - 1]
      if (lastRowTop == null) return
      const bottom = Math.max(...images.filter((r) => Math.round(r.top) === lastRowTop).map((r) => r.bottom))

      el.style.alignSelf = 'start'
      el.style.height = `${bottom - top}px`
    }

    align()
    const ro = new ResizeObserver(align)
    Array.from(group.children).forEach((c) => { if (c !== el) ro.observe(c) })
    desktop.addEventListener('change', align)
    return () => {
      ro.disconnect()
      desktop.removeEventListener('change', align)
      el.style.height = ''
      el.style.alignSelf = ''
    }
  }, [ref])
}

// ─── T3: FeaturedCard — resolves to a tile config by product id ───────────

function FeaturedCard({
  product,
  swatches: _swatches,
  slotClassName,
  disableHotspots = false,
  stlVariant = 'current',
  onOpenShopTheLook,
}: {
  product: ProductItem
  swatches?: string[]
  slotClassName: string
  /** Render as a plain image + headline banner (no hotspot pins). */
  disableHotspots?: boolean
  /** Shop The Look preview variant — V1 replaces hotspot tiles with a CTA banner. */
  stlVariant?: StlVariant
  onOpenShopTheLook?: () => void
}) {
  const config = resolveTile(product)
  const articleRef = useRef<HTMLElement>(null)
  useAlignBannerToCardImages(articleRef)

  // V3 — touch: V1 (CTA opens the panel). Desktop pointer: CTA label; hover
  // reveals the dots, each with a mini-card popover + Quick Add.
  if (config.type === 'hotspot' && stlVariant === 'v3' && onOpenShopTheLook) {
    return (
      <article ref={articleRef} className={`${styles.featuredCard} ${slotClassName}`}>
        <ShopTheLookBannerV3
          image={config.image}
          imageAlt={config.imageAlt}
          heading={null}
          pins={config.pins}
          onOpen={onOpenShopTheLook}
        />
      </article>
    )
  }

  // V2 — V1's banner without a heading: just the "Shop The Look" CTA, which
  // opens the v2 panel (image with dots + selected product).
  if (config.type === 'hotspot' && stlVariant === 'v2' && onOpenShopTheLook) {
    return (
      <article ref={articleRef} className={`${styles.featuredCard} ${slotClassName}`}>
        <ShopTheLookBannerV1
          image={config.image}
          imageAlt={config.imageAlt}
          heading={null}
          onOpen={onOpenShopTheLook}
        />
      </article>
    )
  }

  // V1 — same image, no hotspots, heading + CTA that opens the STL panel.
  // Applies to every hotspot tile, including the one Current renders without pins.
  if (config.type === 'hotspot' && stlVariant === 'v1' && onOpenShopTheLook) {
    return (
      <article ref={articleRef} className={`${styles.featuredCard} ${slotClassName}`}>
        <ShopTheLookBannerV1
          image={config.image}
          imageAlt={config.imageAlt}
          // "Shop The Look" lives only in the CTA, so the heading names the look
          heading="Stack Em Up"
          onOpen={onOpenShopTheLook}
        />
      </article>
    )
  }

  if (config.type === 'hotspot' && !disableHotspots) {
    return (
      <article ref={articleRef} className={`${styles.featuredCard} ${slotClassName}`}>
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
    <article ref={articleRef} className={`${styles.featuredCard} ${slotClassName}`}>
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
  previewControl,
}: {
  itemCount: number
  onOpenFilters: () => void
  activeCount: number
  FilterIcon: React.ComponentType<{ size?: number }>
  /** Design-preview control shown beside the item count. */
  previewControl?: React.ReactNode
}) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterBarInner}>
        <div className={styles.filterRight}>
          <span className={styles.itemCountGroup}>
            {previewControl}
            <span className={styles.itemCount}>{itemCount} items</span>
          </span>
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

function CategoryPageInnerT3({ initialStlVariant }: { initialStlVariant: StlVariant }) {
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

  const icons = BRAND_ICONS[brand]
  const { FilterIcon, XIcon, ChevronIcon, CheckmarkIcon, StarIcon } = icons

  // TGR only: derive star-rating props for a product card
  const ratingProps = (p: ProductItem) => tgrRatingProps(brand, p, StarIcon)

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

  // Shop The Look preview — state is the source of truth; the URL mirrors it
  // (?stl=current | ?stl=v1) so a reload or shared link restores the variant.
  const [stlVariant, setStlVariant] = useState<StlVariant>(initialStlVariant)
  const changeStlVariant = (next: StlVariant) => {
    setStlVariant(next)
    const url = new URL(window.location.href)
    url.searchParams.set('stl', next)
    window.history.replaceState(window.history.state, '', url)
  }

  // Both banner instances share one panel, fed by the tile's hotspot pins.
  const [stlOpen, setStlOpen] = useState(false)
  const openShopTheLook = () => setStlOpen(true)
  const stlTile = featuredProducts[0] ? resolveTile(featuredProducts[0]) : TILE_CONFIGS[1]!
  const stlItems = stlTile.type === 'hotspot' ? pinsToLookItems(stlTile.pins, brand, StarIcon) : []

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
          previewControl={
            <VariantToggle
              label="Shop The Look banner preview"
              options={STL_VARIANT_OPTIONS}
              value={stlVariant}
              onChange={changeStlVariant}
            />
          }
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
                        quickAddProduct={toQuickAddProduct(p)}
                        squareImage
                        swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                        {...ratingProps(p)}
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
                      stlVariant={stlVariant}
                      onOpenShopTheLook={openShopTheLook}
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
                        quickAddProduct={toQuickAddProduct(p)}
                        squareImage
                        swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                        {...ratingProps(p)}
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
                      disableHotspots
                      stlVariant={stlVariant}
                      onOpenShopTheLook={openShopTheLook}
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
                        quickAddProduct={toQuickAddProduct(p)}
                        squareImage
                        swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                        {...ratingProps(p)}
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
                    stlVariant={stlVariant}
                    onOpenShopTheLook={openShopTheLook}
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
                      quickAddProduct={toQuickAddProduct(p)}
                      squareImage
                      swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                      {...ratingProps(p)}
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

      <ShopTheLookPanel
        isOpen={stlOpen}
        onClose={() => setStlOpen(false)}
        image={stlTile.image}
        imageAlt={stlTile.imageAlt}
        variant={stlVariant === 'v2' ? 'v2' : 'v1'}
        items={stlItems}
        pins={stlTile.type === 'hotspot' ? stlTile.pins : []}
      />
    </div>
  )
}

export default function CategoryPageClientT3({
  initialStlVariant = 'current',
}: {
  initialStlVariant?: StlVariant
}) {
  return <CategoryPageInnerT3 initialStlVariant={initialStlVariant} />
}
