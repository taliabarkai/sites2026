'use client'

import { usePathname } from 'next/navigation'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { ProductCard, toQuickAddProduct } from '../_components/ProductCard'
import type { QuickAddProduct } from '../_components/QuickAddPanel'
import { useNestedItems } from '../_components/NestedItems/useNestedItems'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import type { ProductItem } from '../../../data/products'
import { tgrRatingProps } from '../category/tgrProductRatings'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './panel-examples.module.css'

// Brand-scoped icons — resolved at runtime per the icon rules (never hardcode a brand).
const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

// Format integer cents as a whole-dollar string, e.g. 12500 → "$125"
function money(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

/** Adapt a catalog product to a QuickAddProduct, then override its gallery to a
 *  specific image count so we can show both panel variants (≤4 vs >4). */
function withImageCount(product: ProductItem, pool: { src: string; alt: string }[], count: number): QuickAddProduct {
  return { ...toQuickAddProduct(product), images: pool.slice(0, count) }
}

export default function PanelExamplesPage() {
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

  // Realistic placeholder products drawn from the brand catalog.
  const { StarIcon } = BRAND_ICONS[brand]
  const catalog = getBrandProducts(brand)
  const imgPool = catalog.map((p) => ({ src: p.image, alt: p.name })).filter((i) => i.src)

  // One product with ≤4 gallery images (carousel variant) and one with >4 (default).
  const fourImageProduct = withImageCount(catalog[0], imgPool, 4)
  // Same product, but its panel hides the image gallery entirely (options only).
  const noGalleryProduct: QuickAddProduct = { ...fourImageProduct, hideGallery: true }
  // A different product whose panel shows a single full-width image (no carousel),
  // using its own primary image rather than the shared pool.
  const singleImageBase = toQuickAddProduct(catalog[1] ?? catalog[0])
  const singleImageProduct: QuickAddProduct = {
    ...singleImageBase,
    images: singleImageBase.images.slice(0, 1),
  }
  // A gallery panel with the review stars omitted (no rating data).
  const noReviewsProduct: QuickAddProduct = {
    ...withImageCount(catalog[3] ?? catalog[0], imgPool, 4),
    rating: undefined,
    reviewCount: undefined,
  }
  // Hidden for now — restore alongside the commented card/nested section below.
  // const sixImageProduct  = withImageCount(catalog[1], imgPool, 6)

  // A nested item whose panel hides its gallery on mobile and shows 3 images on desktop.
  const noMobileImageProduct: QuickAddProduct = {
    ...withImageCount(catalog[2], imgPool, 3),
    hideGalleryOnMobile: true,
  }

  // Card review stars — TGR and LAL only, from the same helper the category
  // page uses, so the numbers match the rest of the site.
  const galleryStars = tgrRatingProps(brand, catalog[0], StarIcon)
  const singleStars  = tgrRatingProps(brand, catalog[1] ?? catalog[0], StarIcon)

  // Nested items open the same shared panel — one section each, the section title
  // naming the variant (so each is identifiable) while the card keeps the plain name.
  const nestedCarousel  = useNestedItems(brand, [fourImageProduct],    'With Gallery')
  // Hidden for now — restore to demo the two-column (>4 images) variant.
  // const nestedTwoColumn = useNestedItems(brand, [sixImageProduct],     '2 Columns 6 imgs')
  const nestedNoMobile  = useNestedItems(brand, [noMobileImageProduct], 'Without gallery for mobile only')

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content" className={styles.content}>
        <header>
          <h1 className={styles.pageTitle}>Panel Examples</h1>
          <p className={styles.intro}>
            A standalone showcase of the slide-in panel. Both the product card and the
            nested item below open the same shared panel — the gallery layout switches on
            image count: a single full-width image for one image, a carousel for 2–4, and
            the two-column layout for more.
          </p>
        </header>

        {/* Product card — opens the shared panel via its quick-add button */}
        <section className={styles.section} aria-labelledby="pe-cards">
          <h2 id="pe-cards" className={styles.sectionTitle}>Product Card</h2>
          <p className={styles.sectionNote}>
            Hover a card and tap the quick-add icon. Each opens the shared panel — with the
            4-image gallery, with the gallery hidden (options only), with a single full-width
            image, and a 4-image gallery with the panel&apos;s review stars hidden.
            The cards themselves show review stars on TGR and LAL only.
          </p>
          <div className={styles.cardGrid}>
            <div className={styles.cardExample}>
              <h3 className={styles.cardLabel}>With Gallery</h3>
              <ProductCard
                name={fourImageProduct.title}
                price={money(fourImageProduct.price)}
                originalPrice={fourImageProduct.salePrice ? money(fourImageProduct.salePrice) : undefined}
                defaultImage={fourImageProduct.images[0]?.src ?? ''}
                hoverImage={fourImageProduct.images[1]?.src}
                href="#"
                quickAddProduct={fourImageProduct}
                {...galleryStars}
              />
            </div>
            <div className={styles.cardExample}>
              <h3 className={styles.cardLabel}>Without Gallery</h3>
              <ProductCard
                name={noGalleryProduct.title}
                price={money(noGalleryProduct.price)}
                originalPrice={noGalleryProduct.salePrice ? money(noGalleryProduct.salePrice) : undefined}
                defaultImage={noGalleryProduct.images[0]?.src ?? ''}
                hoverImage={noGalleryProduct.images[1]?.src}
                href="#"
                quickAddProduct={noGalleryProduct}
                {...galleryStars}
              />
            </div>
            <div className={styles.cardExample}>
              <h3 className={styles.cardLabel}>Single Image</h3>
              <ProductCard
                name={singleImageProduct.title}
                price={money(singleImageProduct.price)}
                originalPrice={singleImageProduct.salePrice ? money(singleImageProduct.salePrice) : undefined}
                defaultImage={singleImageProduct.images[0]?.src ?? ''}
                href="#"
                quickAddProduct={singleImageProduct}
                {...singleStars}
              />
            </div>
            <div className={styles.cardExample}>
              <h3 className={styles.cardLabel}>With Gallery, No Reviews</h3>
              <ProductCard
                name={noReviewsProduct.title}
                price={money(noReviewsProduct.price)}
                originalPrice={noReviewsProduct.salePrice ? money(noReviewsProduct.salePrice) : undefined}
                defaultImage={noReviewsProduct.images[0]?.src ?? ''}
                hoverImage={noReviewsProduct.images[1]?.src}
                href="#"
                quickAddProduct={noReviewsProduct}
              />
            </div>
            {/* Hidden for now — the 6-image (two-column) product card. Restore to demo the >4 variant.
            <ProductCard
              name={sixImageProduct.title}
              price={money(sixImageProduct.price)}
              originalPrice={sixImageProduct.salePrice ? money(sixImageProduct.salePrice) : undefined}
              defaultImage={sixImageProduct.images[0]?.src ?? ''}
              hoverImage={sixImageProduct.images[1]?.src}
              href="#"
              quickAddProduct={sixImageProduct}
            />
            */}
          </div>
        </section>

        {/* Nested item — opens the same shared panel */}
        <section className={styles.section} aria-labelledby="pe-nested">
          <h2 id="pe-nested" className={styles.sectionTitle}>Nested Item</h2>
          <p className={styles.sectionNote}>
            Selecting a nested item opens the same shared panel (CTA reads “Add”). Each
            section below is titled by the panel variant it demonstrates.
          </p>
          <div className={styles.nestedWrap}>
            {nestedCarousel.ui}
            {/* Hidden for now — the two-column (6 images) nested section. Restore to demo the >4 variant.
            {nestedTwoColumn.ui}
            */}
            {nestedNoMobile.ui}
          </div>
        </section>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}
