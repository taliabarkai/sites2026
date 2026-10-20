'use client'

// The V1 filter logic, shared by every category page that uses it:
//   /category/v1 (Best Sellers), /category/t3 (Shop the Look),
//   /category/t4 (New In), /category/t5 (Sale)
//
//   usePlpControls  — filter, sort, image view and grid state + the filtered list
//   PlpToolbar      — the sticky bar: Filters · Product/Model view · grid size
//   PlpGridCard     — a ProductCard wired to the current view and grid
//
// Pages render their own header and extras (banners, carousels, promo tiles)
// around these; the grid classes come from PlpVariant.module.css.

import { useMemo, useState, type ReactNode } from 'react'
import { ProductCard, toQuickAddProduct } from '../_components/ProductCard'
import { DEFAULT_PRODUCT_SWATCHES } from '../_config/products'
import type { ProductItem } from '../../../data/products'
import type { BrandKey } from '../_config/brands'
import { tgrRatingProps } from './tgrProductRatings'
import type { MaterialKey, SortKey } from './CategoryFilterPanel'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './PlpVariant.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Filtering ────────────────────────────────────────────────────────────────

/** Name-based material matching — the catalog has no material field yet. */
const MATERIAL_MATCHERS: Record<MaterialKey, RegExp> = {
  'stainless-steel':   /stainless/i,
  'sterling-silver':   /silver/i,
  'gold-vermeil':      /(?<!rose )gold vermeil/i,
  'gold-plated':       /(?<!rose )gold plat/i,
  'yellow-gold':       /\b(10|14|18)k gold\b(?! plat)/i,
  'rose-gold-vermeil': /rose gold vermeil/i,
  'rose-gold-plating': /rose gold plat/i,
  'rose-gold':         /rose gold/i,
  'white-gold':        /white gold/i,
  'mixed-metals':      /mixed metal/i,
  'lab-diamond':       /diamond|moissanite/i,
  'gemstones':         /birthstone|gemstone|emerald|enamel/i,
  'pearls':            /pearl/i,
}

const priceOf = (p: ProductItem) => p.priceInCents ?? (Number((p.price ?? '').replace(/[^0-9.]/g, '')) * 100 || 0)

export function filterAndSortProducts(list: ProductItem[], materials: Set<MaterialKey>, sortKey: SortKey): ProductItem[] {
  let out = list
  if (materials.size > 0) {
    const matchers = [...materials].map((k) => MATERIAL_MATCHERS[k])
    out = out.filter((p) => matchers.some((re) => re.test(p.name)))
  }
  if (sortKey === 'price-asc')  out = [...out].sort((a, b) => priceOf(a) - priceOf(b))
  if (sortKey === 'price-desc') out = [...out].sort((a, b) => priceOf(b) - priceOf(a))
  return out
}

// ─── State ────────────────────────────────────────────────────────────────────

export type ImageView = 'product' | 'model'
export type MobileCols = 1 | 2 | 3

export function usePlpControls(products: ProductItem[]) {
  const [view, setView] = useState<ImageView>('product')
  const [mobileCols, setMobileCols] = useState<MobileCols>(2)
  const [desktopDense, setDesktopDense] = useState(false)

  const [activeMaterials, setActiveMaterials] = useState<Set<MaterialKey>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey>('featured')
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const toggleMaterial = (key: MaterialKey) => {
    setActiveMaterials((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }
  const clearAllMaterials = () => setActiveMaterials(new Set())

  const filtered = useMemo(
    () => filterAndSortProducts(products, activeMaterials, sortKey),
    [products, activeMaterials, sortKey],
  )

  /** The grid's classes for the current column choice and image view. */
  const gridClassName = [
    styles.grid,
    mobileCols === 1 && styles.gridMobile1,
    mobileCols === 3 && styles.gridMobile3,
    desktopDense && styles.gridDesktopDense,
    view === 'model' && styles.modelView,
  ].filter(Boolean).join(' ')

  return {
    view, setView,
    mobileCols, setMobileCols,
    desktopDense, setDesktopDense,
    activeMaterials, toggleMaterial, clearAllMaterials,
    sortKey, setSortKey,
    filterPanelOpen, setFilterPanelOpen,
    filtered,
    gridClassName,
  }
}

export type PlpControls = ReturnType<typeof usePlpControls>

// ─── Toolbar ──────────────────────────────────────────────────────────────────

/**
 * The V1 sticky bar. Filters on the left; the image view and grid size on the
 * right on desktop. `extra` sits beside the Filters button (desktop only) —
 * for a page's own design-preview control.
 */
export function PlpToolbar({ brand, controls, extra }: { brand: BrandKey; controls: PlpControls; extra?: ReactNode }) {
  const { FilterIcon, GridSingleIcon, GridDoubleIcon, GridTripleIcon, ProductViewIcon, ModelViewIcon } = BRAND_ICONS[brand]
  const { view, setView, mobileCols, setMobileCols, desktopDense, setDesktopDense, activeMaterials, setFilterPanelOpen } = controls
  const filterCount = activeMaterials.size

  // LAL is wall art — the second view is the piece in a room, not on a model.
  const modelLabel = brand === 'lal' ? 'In Room' : 'On Model'
  const btnClass = (on: boolean) => `${styles.segmentBtn} ${styles.iconBtn} ${on ? styles.segmentBtnOn : ''}`

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarInner}>
        <button
          type="button"
          className={`${styles.ctl} ${styles.filterBtn}`}
          aria-label={filterCount > 0 ? `Filter and sort, ${filterCount} active` : 'Filter and sort'}
          onClick={() => setFilterPanelOpen(true)}
        >
          <FilterIcon size={22} />
          <span className="hidden md:inline">Filters</span>
          {filterCount > 0 && <span className={styles.badge}>{filterCount}</span>}
        </button>

        {extra && <div className="hidden md:flex">{extra}</div>}

        <button
          type="button"
          aria-pressed={view === 'model'}
          aria-label={view === 'model'
            ? `${modelLabel} view. Switch to product view`
            : `Product view. Switch to ${modelLabel.toLowerCase()} view`}
          onClick={() => setView((v) => (v === 'model' ? 'product' : 'model'))}
          className={`${styles.ctl} ${styles.viewToggle}`}
        >
          {/* Icon names the current view; LAL (wall art) is text only. */}
          {brand !== 'lal' && (view === 'model' ? <ModelViewIcon size={18} /> : <ProductViewIcon size={18} />)}
          {view === 'model' ? `${modelLabel === 'On Model' ? 'Model' : modelLabel} View` : 'Product View'}
        </button>

        <div role="group" aria-label="Grid view" className={`${styles.segment} flex md:hidden`}>
          {([
            [1, '1 column', GridSingleIcon],
            [2, '2 columns', GridDoubleIcon],
            [3, '3 columns, images only', GridTripleIcon],
          ] as const).map(([cols, label, Icon]) => (
            <button
              key={cols}
              type="button"
              aria-label={label}
              aria-pressed={mobileCols === cols}
              className={btnClass(mobileCols === cols)}
              onClick={() => setMobileCols(cols)}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>

        <div role="group" aria-label="Grid view" className={`${styles.segment} hidden md:flex`}>
          <button type="button" aria-label="4 columns" aria-pressed={!desktopDense} className={btnClass(!desktopDense)} onClick={() => setDesktopDense(false)}>
            <GridDoubleIcon size={18} />
          </button>
          <button type="button" aria-label="5 columns, images only" aria-pressed={desktopDense} className={btnClass(desktopDense)} onClick={() => setDesktopDense(true)}>
            <GridTripleIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

/** A product card that follows the toolbar: model shots in Model view, no hover swap images-only. */
export function PlpGridCard({ product: p, brand, controls, squareImage }: {
  product: ProductItem
  brand: BrandKey
  controls: Pick<PlpControls, 'view' | 'desktopDense'>
  squareImage?: boolean
}) {
  const { StarIcon } = BRAND_ICONS[brand]
  const showModel = controls.view === 'model' && !!p.hoverImage && p.hasModelImage !== false
  return (
    <ProductCard
      name={p.name}
      price={p.price ?? ''}
      originalPrice={p.originalPrice}
      defaultImage={showModel ? p.hoverImage! : p.image}
      // Images-only 5-column grid: no hover swap, just the gallery.
      hoverImage={controls.desktopDense ? undefined : showModel ? p.image : p.hoverImage}
      href={`/${brand}${p.href}`}
      quickAddProduct={toQuickAddProduct(p)}
      squareImage={squareImage}
      swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
      infoClassName={styles.cardInfo}
      quickAddClassName={styles.cardQuickAdd}
      {...tgrRatingProps(brand, p, StarIcon)}
    />
  )
}

/** "No pieces match" — shown under the grid when the filters leave nothing. */
export function PlpEmpty({ controls }: { controls: PlpControls }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>No pieces match those filters</p>
      <button type="button" className={styles.ctl} onClick={controls.clearAllMaterials}>
        Clear filters
      </button>
    </div>
  )
}
