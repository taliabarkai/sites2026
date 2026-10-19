'use client'

// Shared body for the sticky-bar PLP prototypes ported from the design canvas:
//   /category/v1 — sticky toolbar under the title (filter · image view · grid)
//   /category/v2 — full-width three-part bar (filter/sort | grid | image view)
//   /category/v3 — sticky filter + count + grid, floating Product / Model toggle
//   /category/v4 — floating control bar pinned to the bottom of the viewport
// Both reuse the existing FilterPanel (CategoryFilterPanel.tsx).

import { useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '../_context/CartContext'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { FloatingCart } from '../_components/FloatingCart'
import { FilterChips } from '../_components/FilterChips'
import { ProductCard, toQuickAddProduct } from '../_components/ProductCard'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import { DEFAULT_PRODUCT_SWATCHES } from '../_config/products'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import type { ProductItem } from '../../../data/products'
import { tgrRatingProps } from './tgrProductRatings'
import { FilterPanel, MATERIAL_FILTERS, type MaterialKey, type SortKey } from './CategoryFilterPanel'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './PlpVariant.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Content ──────────────────────────────────────────────────────────────────

const PAGE_DESCRIPTION: Record<string, string> = {
  oal: 'Adored & Loved. Our most coveted pieces.',
  tgr: 'Our most-loved pieces, all in one place.',
  lal: 'Our most-loved prints and canvases, all in one place.',
  ib:  'Our most-loved pieces, all in one place.',
  mnn: 'Our most-loved pieces, all in one place.',
}

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

// ─── Types ────────────────────────────────────────────────────────────────────

type ImageView = 'product' | 'model'
type MobileCols = 1 | 2 | 3

export type PlpVariant = 'v1' | 'v2' | 'v3' | 'v4'

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PlpVariantPage({ variant }: { variant: PlpVariant }) {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:    withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref:   withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  const { FilterIcon, XIcon, ChevronIcon, CheckmarkIcon, StarIcon, GridSingleIcon, GridDoubleIcon, GridTripleIcon, ProductViewIcon, ModelViewIcon } = BRAND_ICONS[brand]

  // LAL is wall art — the second view is the piece in a room, not on a model.
  const modelLabel = brand === 'lal' ? 'In Room' : 'On Model'

  // ── View state ──
  const [view, setView] = useState<ImageView>('product')
  const [mobileCols, setMobileCols] = useState<MobileCols>(2)
  const [desktopDense, setDesktopDense] = useState(false)

  // ── Filter state (same shape as the Current page) ──
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

  const products = useMemo(() => {
    let list = getBrandProducts(brand)
    if (activeMaterials.size > 0) {
      const matchers = [...activeMaterials].map((k) => MATERIAL_MATCHERS[k])
      list = list.filter((p) => matchers.some((re) => re.test(p.name)))
    }
    if (sortKey === 'price-asc')  list = [...list].sort((a, b) => priceOf(a) - priceOf(b))
    if (sortKey === 'price-desc') list = [...list].sort((a, b) => priceOf(b) - priceOf(a))
    return list
  }, [brand, activeMaterials, sortKey])

  const activeChips = MATERIAL_FILTERS
    .filter((m) => activeMaterials.has(m.key))
    .map((m) => ({ value: m.key, label: m.label }))

  const { items, isOpen, subtotal, closeCart, removeItem } = useCart()
  const router = useRouter()

  const countLabel = `${products.length} ${products.length === 1 ? 'item' : 'items'}`
  const filterCount = activeMaterials.size

  // ── Shared controls ──
  const filterBadge = filterCount > 0 && <span className={styles.badge}>{filterCount}</span>

  // Grid buttons come in three looks: a bordered segment (V1, V3), plain icons
  // (V2) and a floating group (V4).
  type GridLook = 'segment' | 'plain' | 'float'
  const look: GridLook = variant === 'v4' ? 'float' : variant === 'v2' ? 'plain' : 'segment'
  const groupClass = { segment: styles.segment, plain: styles.plainGroup, float: styles.floatGroup }[look]
  const gridBtnClass = (on: boolean) =>
    look === 'plain'
      ? `${styles.plainIconBtn} ${on ? styles.plainIconBtnOn : ''}`
      : `${styles.segmentBtn} ${styles.iconBtn} ${on ? styles.segmentBtnOn : ''}`

  const mobileGrid = (
    <div role="group" aria-label="Grid view" className={`${groupClass} flex md:hidden`}>
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
          className={gridBtnClass(mobileCols === cols)}
          onClick={() => setMobileCols(cols)}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  )

  const desktopGrid = (
    <div role="group" aria-label="Grid view" className={`${groupClass} hidden md:flex`}>
      <button
        type="button"
        aria-label="4 columns"
        aria-pressed={!desktopDense}
        className={gridBtnClass(!desktopDense)}
        onClick={() => setDesktopDense(false)}
      >
        <GridDoubleIcon size={18} />
      </button>
      <button
        type="button"
        aria-label="5 columns, images only"
        aria-pressed={desktopDense}
        className={gridBtnClass(desktopDense)}
        onClick={() => setDesktopDense(true)}
      >
        <GridTripleIcon size={18} />
      </button>
    </div>
  )

  // Single toggle button (V1, V2) — the label names the current view.
  const viewToggleProps = {
    type: 'button' as const,
    'aria-pressed': view === 'model',
    'aria-label': view === 'model'
      ? `${modelLabel} view. Switch to product view`
      : `Product view. Switch to ${modelLabel.toLowerCase()} view`,
    onClick: () => setView((v) => (v === 'model' ? 'product' : 'model')),
  }
  const viewToggleLabel = view === 'model' ? modelLabel : 'Product'

  // Two-button Product / Model segment (V3, V4).
  const viewSegment = (extraBtnClass = '') => (
    <>
      <button
        type="button"
        aria-pressed={view === 'product'}
        className={`${styles.segmentBtn} ${styles.textBtn} ${extraBtnClass} ${view === 'product' ? styles.segmentBtnOn : ''}`}
        onClick={() => setView('product')}
      >
        Product
      </button>
      <button
        type="button"
        aria-pressed={view === 'model'}
        className={`${styles.segmentBtn} ${styles.textBtn} ${extraBtnClass} ${view === 'model' ? styles.segmentBtnOn : ''}`}
        onClick={() => setView('model')}
      >
        {modelLabel}
      </button>
    </>
  )

  const gridClasses = [
    styles.grid,
    mobileCols === 1 && styles.gridMobile1,
    mobileCols === 3 && styles.gridMobile3,
    desktopDense && styles.gridDesktopDense,
  ].filter(Boolean).join(' ')

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} revealOnScrollUp />

      <main id="main-content" className={variant === 'v3' || variant === 'v4' ? styles.mainFloating : undefined}>
        {/* ── Title ── */}
        <section className={styles.intro} aria-label="Category">
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Best Sellers</h1>
            {variant !== 'v3' && <span className={styles.count}>{countLabel}</span>}
          </div>
          <p className={styles.description}>{PAGE_DESCRIPTION[brand]}</p>
        </section>

        {/* ── V1: sticky toolbar ── */}
        {variant === 'v1' && (
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
                {filterBadge}
              </button>

              <button {...viewToggleProps} className={`${styles.ctl} ${styles.viewToggle}`}>
                {/* Icon names the current view; LAL (wall art) is text only. */}
                {brand !== 'lal' && (view === 'model' ? <ModelViewIcon size={18} /> : <ProductViewIcon size={18} />)}
                {view === 'model' ? `${modelLabel === 'On Model' ? 'Model' : modelLabel} View` : 'Product View'}
              </button>

              {mobileGrid}
              {desktopGrid}
            </div>
          </div>
        )}

        {/* ── V2: full-width three-part bar ── */}
        {variant === 'v2' && (
          <div className={`${styles.toolbar} ${styles.toolbarRuled}`}>
            <div className={styles.threePart}>
              <button
                type="button"
                className={styles.threePartFilter}
                aria-label={filterCount > 0 ? `Filter and sort, ${filterCount} active` : 'Filter and sort'}
                onClick={() => setFilterPanelOpen(true)}
              >
                <FilterIcon size={22} />
                <span>Filter/Sort</span>
                {filterCount > 0 && <span className={`${styles.badge} ${styles.badgeInline}`}>{filterCount}</span>}
              </button>
              {mobileGrid}
              <button {...viewToggleProps} className={styles.threePartView}>
                {viewToggleLabel}
              </button>
              {desktopGrid}
            </div>
          </div>
        )}

        {/* ── V3: sticky filter + count + grid ── */}
        {variant === 'v3' && (
          <div className={styles.toolbar}>
            <div className={`${styles.toolbarInner} ${styles.toolbarV3}`}>
              <button
                type="button"
                className={`${styles.ctl} ${styles.filterBtnLabeled}`}
                aria-label={filterCount > 0 ? `Filters, ${filterCount} active` : 'Filters'}
                onClick={() => setFilterPanelOpen(true)}
              >
                <FilterIcon size={22} />
                <span>Filters</span>
                {filterBadge}
              </button>
              <span className={`${styles.count} ${styles.toolbarCount}`}>{countLabel}</span>
              {mobileGrid}
              {desktopGrid}
            </div>
          </div>
        )}

        {/* ── Active filter chips ── */}
        {activeChips.length > 0 && (
          <div className={styles.chips}>
            <FilterChips
              chips={activeChips}
              onRemove={(value) => toggleMaterial(value as MaterialKey)}
              onClearAll={clearAllMaterials}
              XIcon={XIcon}
            />
          </div>
        )}

        {/* ── Products ── */}
        <section aria-label="Products" className={styles.productsSection}>
          <div className={`${gridClasses} ${view === 'model' ? styles.modelView : ''}`}>
            {products.map((p) => {
              const showModel = view === 'model' && !!p.hoverImage && p.hasModelImage !== false
              return (
                <ProductCard
                  key={p.id}
                  name={p.name}
                  price={p.price ?? ''}
                  originalPrice={p.originalPrice}
                  defaultImage={showModel ? p.hoverImage! : p.image}
                  // Images-only 5-column grid: no hover swap, just the gallery.
                  hoverImage={desktopDense ? undefined : showModel ? p.image : p.hoverImage}
                  href={`/${brand}${p.href}`}
                  quickAddProduct={toQuickAddProduct(p)}
                  swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                  infoClassName={styles.cardInfo}
                  quickAddClassName={styles.cardQuickAdd}
                  {...tgrRatingProps(brand, p, StarIcon)}
                />
              )
            })}
          </div>

          {products.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyText}>No pieces match those filters</p>
              <button type="button" className={styles.ctl} onClick={clearAllMaterials}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer columns={footerColumns} />

      {/* ── V4: floating control bar ── */}
      {variant === 'v4' && (
        <div
          aria-label="Filter and view"
          className={`${styles.floatBar} ${filterPanelOpen ? styles.floatBarHidden : ''}`}
        >
          <div role="group" aria-label="Filters" className={`${styles.floatGroup} flex`}>
            <button
              type="button"
              className={`${styles.segmentBtn} ${styles.floatFilterBtn}`}
              aria-label={filterCount > 0 ? `Filters, ${filterCount} active` : 'Filters'}
              onClick={() => setFilterPanelOpen(true)}
            >
              <FilterIcon size={22} />
              <span className="hidden md:inline">Filters</span>
              {filterBadge}
            </button>
          </div>

          {mobileGrid}
          {desktopGrid}

          <div role="group" aria-label="Image display" className={`${styles.floatGroup} flex`}>
            {viewSegment()}
          </div>
        </div>
      )}

      {/* ── V3: floating Product / Model toggle ── */}
      {variant === 'v3' && (
        <div
          role="group"
          aria-label="Image display"
          className={`${styles.floatBar} ${styles.floatGroup} ${filterPanelOpen ? styles.floatBarHidden : ''}`}
        >
          {viewSegment(styles.textBtnWide)}
        </div>
      )}

      <FilterPanel
        isOpen={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        activeMaterials={activeMaterials}
        onToggleMaterial={toggleMaterial}
        onClearAll={clearAllMaterials}
        sortKey={sortKey}
        onSortChange={setSortKey}
        itemCount={products.length}
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
