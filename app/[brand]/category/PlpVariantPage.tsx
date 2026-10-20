'use client'

// Shared body for the sticky-bar PLP prototypes ported from the design canvas:
//   /category/v1 — sticky toolbar under the title (filter · image view · grid)
//   /category/v2 — full-width three-part bar (filter/sort | grid | image view)
//   /category/v3 — sticky filter + count + grid, floating Product / Model toggle
//   /category/v4 — floating control bar pinned to the bottom of the viewport
// Both reuse the existing FilterPanel (CategoryFilterPanel.tsx).

import { useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '../_context/CartContext'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { FloatingCart } from '../_components/FloatingCart'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import { FilterPanel } from './CategoryFilterPanel'
import { PlpEmpty, PlpGridCard, PlpToolbar, usePlpControls } from './PlpControls'
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

// ─── Types ────────────────────────────────────────────────────────────────────

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

  const { FilterIcon, XIcon, ChevronIcon, CheckmarkIcon, GridSingleIcon, GridDoubleIcon, GridTripleIcon } = BRAND_ICONS[brand]

  // LAL is wall art — the second view is the piece in a room, not on a model.
  const modelLabel = brand === 'lal' ? 'In Room' : 'On Model'

  // ── View + filter state (shared with the other V1 category pages) ──
  const allProducts = useMemo(() => getBrandProducts(brand), [brand])
  const controls = usePlpControls(allProducts)
  const {
    view, setView, mobileCols, setMobileCols, desktopDense, setDesktopDense,
    activeMaterials, toggleMaterial, clearAllMaterials, sortKey, setSortKey,
    filterPanelOpen, setFilterPanelOpen, filtered: products,
  } = controls

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

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} revealOnScrollUp />

      <main id="main-content" className={variant === 'v3' || variant === 'v4' ? styles.mainFloating : undefined}>
        {/* ── Title ── */}
        <section className={styles.intro} aria-label="Category">
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Best Sellers</h1>
            {(variant === 'v1' || variant === 'v2') && <span className={styles.count}>{countLabel}</span>}
          </div>
          <p className={styles.description}>{PAGE_DESCRIPTION[brand]}</p>
        </section>

        {/* ── V1: sticky toolbar ── */}
        {variant === 'v1' && <PlpToolbar brand={brand} controls={controls} />}

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

        {/* ── V4: item count above the grid (centered mobile, right on desktop) ── */}
        {variant === 'v4' && (
          <div className={styles.countRow}>
            <span className={styles.count}>{countLabel}</span>
          </div>
        )}

        {/* ── Products ── */}
        <section aria-label="Products" className={styles.productsSection}>
          <div className={controls.gridClassName}>
            {products.map((p) => (
              <PlpGridCard key={p.id} product={p} brand={brand} controls={controls} />
            ))}
          </div>

          {products.length === 0 && <PlpEmpty controls={controls} />}
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
