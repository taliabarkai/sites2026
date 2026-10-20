'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '../_context/CartContext'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { FloatingCart } from '../_components/FloatingCart'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
} from '../_config/siteContent'
import styles from './CategoryPageT3.module.css'
import plpStyles from './PlpVariant.module.css'
import { FilterPanel } from './CategoryFilterPanel'
import { PlpEmpty, PlpGridCard, PlpToolbar, usePlpControls } from './PlpControls'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import type { ProductItem } from '../../../data/products'
import { CategoryHero } from '../_components/CategoryHero'
import { getSeoCategoryVariant } from '../../../data/seoCategories/variantConfig'
import { HotspotImage } from '../_components/HotspotImage'
import type { HotspotPinData } from '../_components/HotspotImage'
import type { QuickAddProduct } from '../_components/QuickAddPanel'
import { ShopTheLookBannerV1 } from '../_components/ShopTheLookBannerV1'
import { ShopTheLookBannerV3 } from '../_components/ShopTheLookBannerV3'
import { ShopTheLookCta } from '../_components/ShopTheLookCta'
import { ShopTheLookPanel } from '../_components/ShopTheLookPanel'
import type { ShopTheLookItem } from '../_components/ShopTheLookPanel'
import { VariantToggle } from '../_components/VariantToggle'
import { parseStlVariant, type StlVariant } from './stlVariant'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// ─── Data — sourced from data/products registry ────────────────────────────

const DEFAULT_PRODUCT_SWATCHES = [
  'var(--sterling-silver-925)',
  'var(--gold-vermeil-18k)',
  'var(--solid-gold-14k)',
  'var(--rose-gold-plating-18k)',
]

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
  | {
      type: 'hotspot'
      image: string
      imageAlt: string
      headline: string
      pins: HotspotPinData[]
      /** NEW FINAL — optional live-text title above the CTA; omit for a CTA-only banner. */
      title?: string
    }

const TILE_CONFIGS: Record<number, TileConfig> = {
  1: {
    type: 'hotspot',
    image: 'https://cdn.oakandluna.com/digital-asset/banners/RINGS-banner_HP_OAL.jpg',
    imageAlt: 'Stack Em Up — ring collection',
    headline: 'Shop The Look',
    title: 'Stack Em Up',
    pins: STACK_EM_UP_PINS,
  },
}

function resolveTile(product: ProductItem): TileConfig {
  return TILE_CONFIGS[product.id] ?? TILE_CONFIGS[1]!
}

// ─── T3: Shop The Look preview variant (?stl=v1 | current | v2 | v3 | v4) ──
// v1 is NEW FINAL, the default; the param keeps its old value so links still work.

const STL_VARIANT_OPTIONS: { value: StlVariant; label: string }[] = [
  { value: 'v1',      label: 'NEW FINAL' },
  { value: 'current', label: 'Current' },
  { value: 'v2',      label: 'V2' },
  { value: 'v3',      label: 'V3' },
  { value: 'v4',      label: 'V4' },
]

// V4's CTA leaves the page for a category listing instead of opening a panel
const STL_V4_CATEGORY_PATH = '/category/t4'

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
// From 768px a banner spans N grid rows of product cards. Left to stretch, it
// would run past the last row's product name and price; instead its height is
// set so its bottom lines up with the bottom of that row's product images.
// Below 768px the banner is a full-width row sized by its image — untouched.

function useAlignBannerToCardImages(ref: React.RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current
    const group = el?.parentElement
    if (!el || !group) return

    const desktop = window.matchMedia('(min-width: 768px)')

    const align = () => {
      el.style.height = ''
      el.style.alignSelf = ''
      if (!desktop.matches) return

      // Rows spanned: "1 / 3" → 2; a lone start ("5", end "auto") or "span N".
      const { gridRowStart, gridRowEnd } = getComputedStyle(el)
      const spanMatch = /^span (\d+)$/.exec(gridRowEnd)
      const span = spanMatch ? Number(spanMatch[1])
        : gridRowEnd === 'auto' ? 1
        : Number(gridRowEnd) - Number(gridRowStart)
      if (!Number.isFinite(span) || span < 1) return

      const top = el.getBoundingClientRect().top
      // One image per sibling card: its largest, the product photo — not a
      // badge or swatch that may come first in the markup.
      const largestImage = (card: Element) => Array.from(card.querySelectorAll('img'))
        .map((img) => img.getBoundingClientRect())
        .reduce<DOMRect | undefined>((best, r) => (!best || r.width * r.height > best.width * best.height ? r : best), undefined)
      const images = Array.from(group.children)
        .filter((c) => c !== el)
        .map(largestImage)
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
  shopTheLookHref,
  productHref,
}: {
  product: ProductItem
  swatches?: string[]
  slotClassName: string
  /** Render as a plain image + headline banner (no hotspot pins). */
  disableHotspots?: boolean
  /** Shop The Look preview variant — V1 replaces hotspot tiles with a CTA banner. */
  stlVariant?: StlVariant
  onOpenShopTheLook?: () => void
  /** V4 — where the CTA links to. */
  shopTheLookHref?: string
  /** V4 — a dot's popover "Shop Now" links to the product's PDP. */
  productHref?: (product: QuickAddProduct) => string
}) {
  const config = resolveTile(product)
  const articleRef = useRef<HTMLElement>(null)
  useAlignBannerToCardImages(articleRef)

  // V4 — Current's tile (dots → Quick Add where Current has them) with V1's
  // CTA in place of the headline; the CTA links to another category page.
  // On desktop, hovering a dot shows V3's popover.
  if (config.type === 'hotspot' && stlVariant === 'v4' && shopTheLookHref) {
    const cta = (
      <div className={styles.bannerCta}>
        <ShopTheLookCta href={shopTheLookHref} />
      </div>
    )
    return (
      <article ref={articleRef} data-banner-fill className={`${styles.featuredCard} ${slotClassName}`}>
        {disableHotspots ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={config.image} alt={config.imageAlt} className={styles.bannerImage} loading="lazy" />
            {cta}
          </>
        ) : (
          <HotspotImage src={config.image} alt={config.imageAlt} pins={config.pins} popoverHref={productHref}>
            {cta}
          </HotspotImage>
        )}
      </article>
    )
  }

  // V3 — touch: V1 (CTA opens the panel). Desktop pointer: CTA label; hover
  // reveals the dots, each with a mini-card popover + Quick Add.
  if (config.type === 'hotspot' && stlVariant === 'v3' && onOpenShopTheLook) {
    return (
      <article ref={articleRef} data-banner-fill className={`${styles.featuredCard} ${slotClassName}`}>
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
      <article ref={articleRef} data-banner-fill className={`${styles.featuredCard} ${slotClassName}`}>
        <ShopTheLookBannerV1
          image={config.image}
          imageAlt={config.imageAlt}
          heading={null}
          onOpen={onOpenShopTheLook}
        />
      </article>
    )
  }

  // NEW FINAL (v1) — Current's hotspot dots (each opens Quick Add; on desktop
  // hover, V3's popover whose Shop Now opens the STL panel), the tile's
  // optional live-text title and a CTA that opens the STL panel.
  // Dots appear wherever Current has them; the wide banner keeps title + CTA.
  if (config.type === 'hotspot' && stlVariant === 'v1' && onOpenShopTheLook) {
    return (
      <article ref={articleRef} data-banner-fill className={`${styles.featuredCard} ${slotClassName}`}>
        <ShopTheLookBannerV1
          image={config.image}
          imageAlt={config.imageAlt}
          // "Shop The Look" lives only in the CTA, so the title names the look
          heading={config.title ?? null}
          pins={disableHotspots ? undefined : config.pins}
          onOpen={onOpenShopTheLook}
        />
      </article>
    )
  }

  if (config.type === 'hotspot' && !disableHotspots) {
    return (
      <article ref={articleRef} data-banner-fill className={`${styles.featuredCard} ${slotClassName}`}>
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
    <article ref={articleRef} data-banner-fill className={`${styles.featuredCard} ${slotClassName}`}>
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

  const { XIcon, ChevronIcon, CheckmarkIcon, StarIcon } = BRAND_ICONS[brand]

  const { items, isOpen, subtotal, closeCart, removeItem } = useCart()
  const router = useRouter()

  // The first three products feed the banner tiles; the rest fill the grid.
  const allBrandProducts = useMemo(() => getBrandProducts(brand), [brand])
  const featuredProducts = allBrandProducts.slice(0, 3)
  const gridProducts = useMemo(() => allBrandProducts.slice(3), [allBrandProducts])
  const controls = usePlpControls(gridProducts)
  const products = controls.filtered

  // Banner order in the grid: 4 cards, the main banner (2×2 on the right),
  // 8 cards, the wide banner (2 slots × 1 row), then the rest. The wide one
  // only shows once there are enough pieces around it to fill its rows.
  const leadCards = products.slice(0, 4)
  const middleCards = products.slice(4, 12)
  const showWideBanner = products.length >= 18
  const tailCards = products.slice(12)

  // Shop The Look preview — the URL (?stl=v1 | current | v2 | v3 | v4) is the
  // source of truth, so a reload, a shared link or going Back (e.g. from V4's
  // CTA) restores the variant. Next.js syncs useSearchParams with replaceState.
  const searchParams = useSearchParams()
  const stlVariant = searchParams.has('stl') ? parseStlVariant(searchParams.get('stl') ?? undefined) : initialStlVariant
  const changeStlVariant = (next: StlVariant) => {
    const url = new URL(window.location.href)
    url.searchParams.set('stl', next)
    // null (not history.state) so Next.js picks up the change and keeps its own state
    window.history.replaceState(null, '', url)
  }

  // Both banner instances share one panel, fed by the tile's hotspot pins.
  const [stlOpen, setStlOpen] = useState(false)
  const openShopTheLook = () => setStlOpen(true)
  const stlV4Href = `/${brand}${STL_V4_CATEGORY_PATH}`
  const stlV4ProductHref = (p: QuickAddProduct) => `/${brand}${p.pdpUrl}`
  const stlTile = featuredProducts[0] ? resolveTile(featuredProducts[0]) : TILE_CONFIGS[1]!
  const stlItems = stlTile.type === 'hotspot' ? pinsToLookItems(stlTile.pins, brand, StarIcon) : []

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} revealOnScrollUp />

      <main id="main-content">
        <CategoryHero brand={brand} variant={getSeoCategoryVariant(brand)} title="Shop All" />

        <PlpToolbar
          brand={brand}
          controls={controls}
          extra={
            <VariantToggle
              label="Shop The Look banner preview"
              options={STL_VARIANT_OPTIONS}
              value={stlVariant}
              onChange={changeStlVariant}
            />
          }
        />

        <section className={plpStyles.productsSection} aria-label="Products">
          <div className={`${controls.gridClassName} ${styles.stlGrid}`}>
            {leadCards.map((p) => (
              <PlpGridCard key={p.id} product={p} brand={brand} controls={controls} squareImage />
            ))}

            {/* Main banner — 2×2 on the right: cols 3–4 in the 4-up grid, 4–5 in
                the 5-up images-only grid. A full-width row after 4 cards on mobile. */}
            {featuredProducts[0] && products.length > 0 && (
              <FeaturedCard
                product={featuredProducts[0]}
                swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                slotClassName={`${styles.stlSlotMain} ${controls.desktopDense ? styles.stlSlotMainDense : ''}`}
                stlVariant={stlVariant}
                onOpenShopTheLook={openShopTheLook}
                shopTheLookHref={stlV4Href}
                productHref={stlV4ProductHref}
              />
            )}

            {middleCards.map((p) => (
              <PlpGridCard key={p.id} product={p} brand={brand} controls={controls} squareImage />
            ))}

            {/* Wide banner — 2 slots × 1 row on the left, at either grid size */}
            {showWideBanner && (
              <FeaturedCard
                product={featuredProducts[0]}
                swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
                slotClassName={`${styles.stlSlotWide} ${controls.desktopDense ? styles.stlSlotWideDense : ''}`}
                disableHotspots
                stlVariant={stlVariant}
                onOpenShopTheLook={openShopTheLook}
                shopTheLookHref={stlV4Href}
                productHref={stlV4ProductHref}
              />
            )}

            {tailCards.map((p) => (
              <PlpGridCard key={p.id} product={p} brand={brand} controls={controls} squareImage />
            ))}
          </div>

          {products.length === 0 && <PlpEmpty controls={controls} />}
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
        isOpen={controls.filterPanelOpen}
        onClose={() => controls.setFilterPanelOpen(false)}
        activeMaterials={controls.activeMaterials}
        onToggleMaterial={controls.toggleMaterial}
        onClearAll={controls.clearAllMaterials}
        sortKey={controls.sortKey}
        onSortChange={controls.setSortKey}
        itemCount={products.length}
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
