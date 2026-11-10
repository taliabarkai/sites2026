'use client'

import { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { notFound, usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { useCart } from '../_context/CartContext'
import type { CartItem } from '../_context/CartContext'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { FloatingCart } from '../_components/FloatingCart'
import { Button } from '../_components/Button'
import { FilterChips } from '../_components/FilterChips'
import { ProductCard, toQuickAddProduct } from '../_components/ProductCard'
import { QuickAddPanel } from '../_components/QuickAddPanel'
import type { QuickAddFormValues, QuickAddOption, QuickAddProduct } from '../_components/QuickAddPanel'
import { OptionRadioGroup } from '../_components/ProductOptions/OptionRadioGroup'
import { NestedItems, NestedItemsDrawer, nestedItemKey, withBundleDiscount } from '../_components/NestedItems'
import type { NestedItemsDisplay } from '../_components/NestedItems'
import { ProductImageCarousel } from '../_components/ProductImageCarousel'
import { ReviewPhotoLightbox } from '../_components/ReviewPhotoLightbox'
import type { ReviewPhoto } from '../_components/ReviewPhotoLightbox'
import { getBrandFromPathname, materialLabel } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import {
  DEFAULT_PRODUCT_SWATCHES,
  materialSwatchesFor,
  BRAND_PACKAGING_IMAGES,
  DIAMOND_SHAPES,
  titleForMetal,
  CHAIN_LENGTHS,
  DEFAULT_CHAIN_LENGTH,
  MAX_ENGRAVE_CHARS,
} from '../_config/products'
import type { DiamondShape, MaterialSwatch } from '../_config/products'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import { getReviewSummary } from '../../../data/products/reviewSummary'
import { NESTED_DRAWER_DESCRIPTION, nestedCharms } from '../../../data/products/nestedCharms'
import type { ProductItem } from '../../../data/products'
import { LalCanvasCustomizer } from './LalCanvasCustomizer'
import { getGiftOptions } from '../_config/giftOptions'
import { GiftOptionsInfoPanel } from '../_components/cart/GiftingOptions'
import { PanelPortal } from '../_components/PanelPortal'
import { StickyCustomizeBar } from '../_components/StickyCustomizeBar'
import { useIsMobile } from '../_components/CustomizerPanel'
import { StickyProductBar } from '../_components/StickyProductBar'
import { TranslationAdvisor } from '../_components/TranslationAdvisor'
import type { TranslationAdvisorVariant } from '../_components/TranslationAdvisor'
import { MusicMemoriesCustomizer } from './MusicMemoriesCustomizer'
import { LivePreviewNote, TemplateCustomizer } from './TemplateCustomizer'
import { SliderGallery } from './SliderGallery'
import { renderedTemplateFor, type GalleryDisplay } from './_templates'
import { withExternalEngine } from './_templates/previewEngine'
import { AIPreviewCustomizer } from '../_components/AIPreviewCustomizer'
import { ProductOptions, useProductOptions } from '../_components/ProductOptions'
import type { OptionGroup, SelectedOption } from '../_components/ProductOptions'
import { OPTION_GROUPS, OPTIONS_SHOWCASE_PRODUCT_ID, optionsShowcaseProduct } from './[id]/_data/optionGroups'
import { isNestedDrawerProduct, personalizeFlowFor, readGalleryLayout, readNestedDescriptionState, readPersonalizePlacement, readNestedItemOn, readMaterialDisplay, readNestedDrawerCount, readMobileLayout } from '../_config/demoParams'
import type { DiamondSetting, PersonalizeFields, PersonalizeFlow } from '../_config/demoParams'

// LAL products that use the song-based Music Memories customizer
// (Custom Canvas, Acrylic Wall Art, Metal Wall Art, Square Custom Canvas)
const MUSIC_MEMORIES_PRODUCT_IDS = new Set([1, 16, 17, 19])

// LAL products that use the AI-preview customizer (Pop Your Memories)
const AI_PREVIEW_PRODUCT_IDS = new Set([2])
import styles from './ProductDetailPage.module.css'

const BRAND_ICONS = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib: ibIcons,
} as const

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`
}

// ─── Product carousel ─────────────────────────────────────────────────────────

function ProductCarousel({
  brand,
  title,
  ArrowIcon,
  lead = [],
  hrefFor,
}: {
  brand: string
  title: string
  ArrowIcon: React.ComponentType<{ size?: number; color?: string }>
  /** Product ids shown first, in this order (a template's `bestSellersLead`). */
  lead?: number[]
  /** Where a card links: the final live preview keeps its products inside it. */
  hrefFor?: (p: ProductItem) => string
}) {
  const all = getBrandProducts(brand)
  const leading = lead.map((id) => all.find((p) => p.id === id)).filter((p): p is ProductItem => !!p)
  const products = [...leading, ...all.filter((p) => !lead.includes(p.id))].slice(0, 8)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (dir: 'prev' | 'next') => {
    if (!carouselRef.current) return
    const card = carouselRef.current.firstElementChild as HTMLElement
    const amount = card ? card.offsetWidth + 4 : 320
    carouselRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <section className={styles.pdpCarousel} aria-label={title}>
      <div className={styles.pdpCarouselHeader}>
        <h2 className={styles.pdpCarouselTitle}>{title}</h2>
      </div>
      <div className={styles.pdpCarouselWrapper}>
        <div className={styles.pdpCarouselTrack} ref={carouselRef}>
          {products.map(p => (
            <div key={p.id} className={styles.pdpCarouselCard}>
              <ProductCard
                name={p.name}
                price={p.price ?? ''}
                originalPrice={p.originalPrice}
                defaultImage={p.image}
                hoverImage={p.hoverImage}
                href={hrefFor ? hrefFor(p) : `/${brand}${p.href}`}
                quickAddProduct={toQuickAddProduct(p)}
                swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
              />
            </div>
          ))}
        </div>
        <button
          className={`${styles.pdpCarouselArrow} ${styles.pdpCarouselArrowPrev}`}
          onClick={() => scrollCarousel('prev')}
          aria-label="Previous products"
        >
          <ArrowIcon size={24} color="white" />
        </button>
        <button
          className={`${styles.pdpCarouselArrow} ${styles.pdpCarouselArrowNext}`}
          onClick={() => scrollCarousel('next')}
          aria-label="Next products"
        >
          <ArrowIcon size={24} color="white" />
        </button>
      </div>
    </section>
  )
}

// ─── Reviews section ──────────────────────────────────────────────────────────

/** Review cards shown at a time — Load More reveals another page of them. */
const REVIEWS_PAGE_SIZE = 4

/**
 * Parked, not removed: flip to true to bring the "With photos" review filter
 * back. The chip, its state and the filtering it drives all stay where they
 * are, so this is a one-word change.
 */
const SHOW_PHOTOS_FILTER = false

/**
 * Products whose reviews carry only a handful of photos, so the sparse version
 * of the photo strip can be seen alongside the busy one. Everything else shows
 * the full set.
 */
const FEW_PHOTO_PRODUCT_IDS = new Set([2, 4, 6])
const FEW_PHOTO_LIMIT = 4

/** Sample customer photos — reused across the demo reviews below. */
const RP = {
  couple:    'https://cdn.limeandlou.com/digital-asset/category-banners/FOR_FAMILY.png',
  pet:       'https://cdn.limeandlou.com/digital-asset/category-banners/FOR_PET.png',
  portrait:  'https://cdn.theograce.com/digital-asset/banners/2506_Charmed_Collection_Landing_Page_IMG03.jpg',
  necklace:  'https://cdn.theograce.com/digital-asset/banners/02-%20Necklaces.jpg',
  bracelet:  'https://cdn.theograce.com/digital-asset/banners/03-%20Bracelets.jpg',
  rings:     'https://cdn.theograce.com/digital-asset/banners/04-%20Rings%20and%20Earrings.jpg',
  seaside:   'https://cdn.theograce.com/digital-asset/banners/category_promo1_saltwater.jpg',
  earrings:  'https://cdn.oakandluna.com/digital-asset/banners/oal-carousel_earrings_july26.jpg',
  layered:   'https://cdn.oakandluna.com/digital-asset/banners/oal-carousel_necklace_july26.jpg',
  bag:       'https://cdn.oakandluna.com/digital-asset/banners/oal-carousel_bags_july26.jpg',
  stack:     'https://cdn.oakandluna.com/digital-asset/banners/oal-carousel_bracelet_july26.jpg',
  summer:    'https://cdn.oakandluna.com/digital-asset/banners/Summer-shop-gradient.jpg',
}

const REVIEWS_DATA = {
  items: [
    { initials: 'A', name: 'Alexandra S.',  location: 'Texas, United States',      dateLabel: 'May 2025', dateMs: 1746057600000, rating: 5, body: 'Absolutely stunning — the quality exceeded my expectations. Arrived beautifully packaged and looks exactly as pictured.' },
    { initials: 'M', name: 'Maria T.',      location: 'London, United Kingdom',    dateLabel: 'Apr 2025', dateMs: 1743379200000, rating: 4, body: 'Really happy with this purchase. The craftsmanship is excellent and it feels very premium. Would definitely order again.' },
    { initials: 'J', name: 'Jessica R.',    location: 'Sydney, Australia',         dateLabel: 'Mar 2025', dateMs: 1740787200000, rating: 5, body: 'Great gift for my sister — she loved the personal touch. Delivery was fast and the packaging was lovely.' },
    { initials: 'S', name: 'Sofia K.',      location: 'Berlin, Germany',           dateLabel: 'Feb 2025', dateMs: 1738368000000, rating: 4, body: 'Beautiful piece. The engraving is crisp and the metal feels solid. Very pleased with the result.' , photos: [RP.couple, RP.portrait, RP.necklace] },
    { initials: 'L', name: 'Laura B.',      location: 'Paris, France',             dateLabel: 'Jan 2025', dateMs: 1735689600000, rating: 3, body: 'Nice product overall but shipping took longer than expected. The quality is good once it arrived.' , photos: [RP.pet] },
    { initials: 'R', name: 'Rachel M.',     location: 'New York, United States',   dateLabel: 'Dec 2024', dateMs: 1733011200000, rating: 5, body: 'Perfect in every way. The engraving looks gorgeous and the metal quality is excellent. Highly recommend.' , photos: [RP.seaside, RP.summer] },
    { initials: 'D', name: 'Diana P.',      location: 'Toronto, Canada',           dateLabel: 'Nov 2024', dateMs: 1730419200000, rating: 2, body: 'The item itself is fine but the clasp feels a bit flimsy. Customer service was helpful though.' , photos: [RP.rings, RP.earrings, RP.layered, RP.stack] },
    { initials: 'K', name: 'Karen W.',      location: 'Amsterdam, Netherlands',    dateLabel: 'Oct 2024', dateMs: 1727740800000, rating: 5, body: 'Incredibly well made. I have been wearing it every day and it still looks brand new. Amazing quality.' , photos: [RP.bracelet] },
    { initials: 'N', name: 'Natalie F.',    location: 'Melbourne, Australia',      dateLabel: 'Sep 2024', dateMs: 1725148800000, rating: 1, body: 'Unfortunately the sizing was not right for me and the return process was quite difficult.' },
    { initials: 'C', name: 'Claire H.',     location: 'Dublin, Ireland',           dateLabel: 'Aug 2024', dateMs: 1722470400000, rating: 4, body: 'Really elegant design. Bought as an anniversary gift and my partner absolutely loved it.' , photos: [RP.bag, RP.couple] },
  ],
}

const RATING_OPTIONS = [
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star'  },
]

const SORT_OPTIONS_REVIEWS = [
  { value: 'newest',  label: 'Newest Rating' },
  { value: 'oldest',  label: 'Oldest Rating' },
  { value: 'highest', label: 'Highest Rating' },
  { value: 'lowest',  label: 'Lowest Rating' },
]

function ReviewsSection({
  ChevronIcon,
  StarIcon,
  XIcon,
  CheckmarkIcon,
  CameraIcon,
  ArrowIcon,
  productId,
  productRating,
  productReviewCount,
}: {
  ChevronIcon: React.ComponentType<{ size?: number }>
  StarIcon: React.ComponentType<{ size?: number }>
  XIcon: React.ComponentType<{ size?: number }>
  CheckmarkIcon: React.ComponentType<{ size?: number }>
  CameraIcon: React.ComponentType<{ size?: number }>
  ArrowIcon: React.ComponentType<{ size?: number }>
  productId: number
  productRating: number
  productReviewCount: number
}) {
  const [ratingOpen, setRatingOpen] = useState(false)
  const [sortOpen, setSortOpen]     = useState(false)
  const [selectedRatings, setSelectedRatings] = useState<Set<string>>(new Set())
  const [selectedSort, setSelectedSort]       = useState('newest')
  // Four reviews on screen to start; Load More reveals another four.
  const [shownReviews, setShownReviews]       = useState(REVIEWS_PAGE_SIZE)
  // "With photos" filter, and the open photo in the site-wide photo list.
  const [photosOnly, setPhotosOnly]           = useState(false)
  const [lightboxIndex, setLightboxIndex]     = useState<number | null>(null)
  // 'grid' opens the lightbox as a gallery of every photo ("View All").
  const [lightboxMode, setLightboxMode]       = useState<'single' | 'grid'>('single')
  // True while the open photo was reached through the "View All" grid, so the
  // lightbox can offer a way back to it.
  const [cameFromGrid, setCameFromGrid]       = useState(false)

  // Score, total and bar breakdown all derive from the product's own numbers.
  const summary = getReviewSummary(productRating, productReviewCount)

  const sortLabel = SORT_OPTIONS_REVIEWS.find(o => o.value === selectedSort)?.label ?? 'Newest Rating'

  const toggleRating = (value: string) => {
    setSelectedRatings(prev => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }

  const closeAll = () => { setRatingOpen(false); setSortOpen(false) }

  const visibleCount = selectedRatings.size === 0
    ? summary.total
    : summary.breakdown
        .filter(b => selectedRatings.has(b.value))
        .reduce((sum, b) => sum + b.count, 0)

  // Some products keep only the first few photos; the rest show the full set.
  let photoBudget = FEW_PHOTO_PRODUCT_IDS.has(productId) ? FEW_PHOTO_LIMIT : Infinity
  const reviewItems = REVIEWS_DATA.items.map(review => {
    const photos = review.photos ?? []
    if (photos.length === 0 || photoBudget <= 0) return { ...review, photos: undefined }
    const kept = photos.slice(0, photoBudget)
    photoBudget -= kept.length
    return { ...review, photos: kept }
  })

  // Every photo across every review, ordered by review, so the lightbox arrows
  // walk one review's photos before moving to the next.
  const allPhotos: ReviewPhoto[] = []
  reviewItems.forEach(review => {
    const photos = review.photos ?? []
    const reviewStart = allPhotos.length
    photos.forEach(src => {
      allPhotos.push({
        src,
        reviewStart,
        reviewPhotos: photos,
        initials: review.initials,
        name: review.name,
        location: review.location,
        dateLabel: review.dateLabel,
        rating: review.rating,
        body: review.body,
      })
    })
  })

  // Where each review's photos start, so a review's thumbnails can open the
  // lightbox at the right point in the global list.
  const photoStartByName = new Map<string, number>()
  allPhotos.forEach(photo => {
    if (!photoStartByName.has(photo.name)) photoStartByName.set(photo.name, photo.reviewStart)
  })

  const reviewsWithPhotos = reviewItems.filter(r => (r.photos?.length ?? 0) > 0).length

  const togglePhotosOnly = () => {
    setPhotosOnly(value => !value)
    setShownReviews(REVIEWS_PAGE_SIZE)
    closeAll()
  }

  const filteredReviews = reviewItems
    .filter(r => !photosOnly || (r.photos?.length ?? 0) > 0)
    .filter(r => selectedRatings.size === 0 || selectedRatings.has(String(r.rating)))
    .sort((a, b) => {
      if (selectedSort === 'oldest')  return a.dateMs - b.dateMs
      if (selectedSort === 'highest') return b.rating - a.rating
      if (selectedSort === 'lowest')  return a.rating - b.rating
      return b.dateMs - a.dateMs // newest (default)
    })

  const visibleReviews = filteredReviews.slice(0, shownReviews)

  return (
    <section id="reviews" className={styles.reviews} aria-label="Customer reviews">
      {/* Summary: score + bar breakdown */}
      <div className={styles.reviewsSummary}>
        {/* Score block */}
        <div className={styles.reviewsScoreBlock}>
          <h2 className={styles.reviewsTitle}>Reviews</h2>
          <p className={styles.reviewsScore}>{summary.rating}</p>
          <div className={styles.reviewsStars} aria-label={`${summary.rating} out of 5 stars`}>
            {[1,2,3,4,5].map(i => (
              <span
                key={i}
                className={i <= Math.round(summary.rating) ? styles.starFilled : styles.starEmpty}
              >
                <StarIcon size={32} />
              </span>
            ))}
          </div>
          <p className={styles.reviewsBasedOn}>Based on {summary.total} global reviews</p>
        </div>

        {/* Bar breakdown — clicking a row applies that rating filter */}
        <div className={styles.reviewsBars} aria-label="Rating breakdown">
          {summary.breakdown.map(row => (
            <button
              key={row.label}
              type="button"
              className={`${styles.reviewsBarRow} ${selectedRatings.has(row.value) ? styles.reviewsBarRowActive : ''}`}
              onClick={() => { toggleRating(row.value); setRatingOpen(false); setSortOpen(false) }}
              aria-pressed={selectedRatings.has(row.value)}
            >
              <span className={styles.reviewsBarLabel}>{row.label}</span>
              <div className={styles.reviewsBarTrack} role="presentation">
                <div className={styles.reviewsBarFill} style={{ width: `${row.pct}%` }} />
              </div>
              <span className={styles.reviewsBarCount}>{row.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter section: bar + active chips, owns the 24px bottom margin */}
      <div className={styles.reviewsFilterSection}>
      {(ratingOpen || sortOpen) && (
        <div className={styles.reviewsDropdownBackdrop} aria-hidden="true" onClick={closeAll} />
      )}
      <div className={styles.reviewsFilterBar} role="toolbar" aria-label="Filter and sort reviews">
        {/* Rating chip — left side */}
        <div className={styles.reviewsFilterLeft}>
          <div className={styles.reviewsDropdownWrap}>
            <button
              type="button"
              className={`${styles.reviewsFilterChip} ${ratingOpen ? styles.reviewsFilterChipOpen : ''}`}
              aria-expanded={ratingOpen}
              onClick={() => { setRatingOpen(o => !o); setSortOpen(false) }}
            >
              Filter by Ratings
              <span className={`${styles.reviewsChevron} ${ratingOpen ? styles.reviewsChevronOpen : ''}`}><ChevronIcon size={24} /></span>
            </button>
            {ratingOpen && (
              <div className={styles.reviewsDropdown} role="listbox" aria-label="Filter by rating">
                {RATING_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={selectedRatings.has(opt.value)}
                    className={`${styles.reviewsDropdownItem} ${selectedRatings.has(opt.value) ? styles.reviewsDropdownItemActive : ''}`}
                    onClick={() => { toggleRating(opt.value); setRatingOpen(false) }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Photos filter — sits next to the ratings chip on both breakpoints */}
          {SHOW_PHOTOS_FILTER && reviewsWithPhotos > 0 && (
            <button
              type="button"
              className={`${styles.reviewsFilterChip} ${photosOnly ? styles.reviewsFilterChipActive : ''}`}
              aria-pressed={photosOnly}
              onClick={togglePhotosOnly}
            >
              <span className={styles.reviewsChipIcon} aria-hidden="true"><CameraIcon size={20} /></span>
              With photos ({reviewsWithPhotos})
            </button>
          )}

          {/* Active chips — inline on desktop, hidden on mobile */}
          {selectedRatings.size > 0 && (
            <div className={styles.reviewsActiveFiltersInline}>
              <FilterChips
                chips={RATING_OPTIONS.filter(o => selectedRatings.has(o.value)).map(o => ({ value: o.value, label: o.label }))}
                onRemove={toggleRating}
                onClearAll={() => setSelectedRatings(new Set())}
                XIcon={XIcon}
              />
            </div>
          )}

          {/* Sort chip — inline on mobile, hidden here on desktop */}
          <div className={`${styles.reviewsDropdownWrap} ${styles.reviewsSortMobile}`}>
            <button
              type="button"
              className={`${styles.reviewsFilterChip} ${sortOpen ? styles.reviewsFilterChipOpen : ''}`}
              aria-expanded={sortOpen}
              onClick={() => { setSortOpen(o => !o); setRatingOpen(false) }}
            >
              Sort: {sortLabel}
              <span className={`${styles.reviewsChevron} ${sortOpen ? styles.reviewsChevronOpen : ''}`}><ChevronIcon size={24} /></span>
            </button>
            {sortOpen && (
              <div className={styles.reviewsDropdown} role="listbox" aria-label="Sort reviews">
                {SORT_OPTIONS_REVIEWS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={selectedSort === opt.value}
                    className={`${styles.reviewsDropdownItem} ${selectedSort === opt.value ? styles.reviewsDropdownItemActive : ''}`}
                    onClick={() => { setSelectedSort(opt.value); setSortOpen(false) }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sort chip — right side on desktop */}
        <div className={`${styles.reviewsDropdownWrap} ${styles.reviewsSortDesktop}`}>
          <button
            type="button"
            className={`${styles.reviewsFilterChip} ${sortOpen ? styles.reviewsFilterChipOpen : ''}`}
            aria-expanded={sortOpen}
            onClick={() => { setSortOpen(o => !o); setRatingOpen(false) }}
          >
            Sort: {sortLabel}
            <span className={`${styles.reviewsChevron} ${sortOpen ? styles.reviewsChevronOpen : ''}`}><ChevronIcon size={24} /></span>
          </button>
          {sortOpen && (
            <div className={`${styles.reviewsDropdown} ${styles.reviewsDropdownRight}`} role="listbox" aria-label="Sort reviews">
              {SORT_OPTIONS_REVIEWS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selectedSort === opt.value}
                  className={`${styles.reviewsDropdownItem} ${selectedSort === opt.value ? styles.reviewsDropdownItemActive : ''}`}
                  onClick={() => { setSelectedSort(opt.value); setSortOpen(false) }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>


      </div>

      {/* Active rating filters row — mobile only */}
      {selectedRatings.size > 0 && (
        <div className={styles.reviewsActiveFilters}>
          <FilterChips
            chips={RATING_OPTIONS.filter(o => selectedRatings.has(o.value)).map(o => ({ value: o.value, label: o.label }))}
            onRemove={toggleRating}
            onClearAll={() => setSelectedRatings(new Set())}
            XIcon={XIcon}
          />
        </div>
      )}
      </div>

      {/* Customer photos strip — every photo across all reviews */}
      {allPhotos.length > 0 && (
        <div className={styles.reviewsPhotoStrip}>
          <div className={styles.reviewsPhotoStripHead}>
            <h3 className={styles.reviewsPhotoStripTitle}>Customer reviews with photos</h3>
            <button
              type="button"
              className={styles.reviewsPhotoViewAll}
              onClick={() => { setLightboxMode('grid'); setCameFromGrid(true); setLightboxIndex(0) }}
            >
              View All
            </button>
          </div>
          <ul className={styles.reviewsPhotoTrack}>
            {allPhotos.map((photo, i) => (
              <li key={`${photo.src}-${i}`} className={styles.reviewsPhotoItem}>
                <button
                  type="button"
                  className={styles.reviewsPhotoBtn}
                  aria-label={`Open photo from ${photo.name}'s review`}
                  onClick={() => { setLightboxMode('single'); setCameFromGrid(false); setLightboxIndex(i) }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.src}
                    alt={`Photo from ${photo.name}'s review`}
                    className={styles.reviewsPhotoImg}
                    loading="lazy"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review cards */}
      <div className={styles.reviewsGrid}>
        {visibleReviews.map((review, i) => (
          <article key={i} className={styles.reviewCard}>
            <div className={styles.reviewCardHeader}>
              <div className={styles.reviewCardMeta}>
                <div className={styles.reviewAvatarWrap} aria-hidden="true">
                  <div className={styles.reviewAvatar}>{review.initials}</div>
                  <span className={styles.reviewAvatarBadge}><CheckmarkIcon size={10} /></span>
                </div>
                <div className={styles.reviewCardNameBlock}>
                  <span className={styles.reviewCardName}>{review.name}</span>
                  <span className={styles.reviewCardLocation}>{review.location}</span>
                </div>
              </div>
              <span className={styles.reviewCardDate}>{review.dateLabel}</span>
            </div>

            <div className={styles.reviewCardStars} aria-label={`${review.rating} out of 5 stars`}>
              {[1,2,3,4,5].map(s => (
                <span
                  key={s}
                  className={s <= review.rating ? styles.starFilled : styles.starEmpty}
                >
                  <StarIcon size={20} />
                </span>
              ))}
            </div>

            <div className={styles.reviewCardBodyRow}>
            <p className={styles.reviewCardBody}>{review.body}</p>

            {/* Photos sit in a right-hand column: two thumbs, then a bordered
                "+N" tile standing in for the rest. */}
            {(review.photos?.length ?? 0) > 0 && (() => {
              const photos = review.photos ?? []
              const start = photoStartByName.get(review.name) ?? 0
              const shown = photos.slice(0, 2)
              const extra = photos.length - shown.length
              return (
                <ul className={styles.reviewCardThumbs}>
                  {shown.map((src, i) => (
                    <li key={`${src}-${i}`}>
                      <button
                        type="button"
                        className={styles.reviewCardThumb}
                        aria-label={`Open photo ${i + 1} from ${review.name}'s review`}
                        onClick={() => { setLightboxMode('single'); setCameFromGrid(false); setLightboxIndex(start + i) }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Photo from ${review.name}'s review`}
                          className={styles.reviewCardThumbImg}
                          loading="lazy"
                        />
                      </button>
                    </li>
                  ))}
                  {extra > 0 && (
                    <li>
                      <button
                        type="button"
                        className={styles.reviewCardThumbMore}
                        aria-label={`Open all ${photos.length} photos from ${review.name}'s review`}
                        onClick={() => { setLightboxMode('single'); setCameFromGrid(false); setLightboxIndex(start + shown.length) }}
                      >
                        +{extra}
                      </button>
                    </li>
                  )}
                </ul>
              )
            })()}
            </div>
          </article>
        ))}
      </div>

      {/* Load more — hidden once every filtered review is on screen */}
      {filteredReviews.length > shownReviews && (
        <div className={styles.reviewsLoadMore}>
          <Button
            variant="secondary"
            onClick={() => setShownReviews(count => count + REVIEWS_PAGE_SIZE)}
          >
            Load More Reviews
          </Button>
        </div>
      )}

      <ReviewPhotoLightbox
        photos={allPhotos}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => { setLightboxIndex(null); setCameFromGrid(false) }}
        mode={lightboxMode}
        onSelectPhoto={(i) => { setLightboxMode('single'); setLightboxIndex(i) }}
        onBack={cameFromGrid && lightboxMode === 'single' ? () => setLightboxMode('grid') : undefined}
        StarIcon={StarIcon}
        ArrowIcon={ArrowIcon}
        XIcon={XIcon}
        CheckmarkIcon={CheckmarkIcon}
      />
    </section>
  )
}

// ─── Mobile swipeable gallery ─────────────────────────────────────────────────

/** Mobile PDP image gallery — the shared carousel, hidden on desktop via CSS. */
function MobileGallery({ images, modelImages, livePreview, ribbons, previewNote, floatingProgress }: { images: string[]; modelImages: string[]; livePreview?: string | null; ribbons?: string[]; previewNote?: React.ReactNode; floatingProgress?: boolean }) {
  const ribbonIcon = useContext(RibbonIconContext)
  return <ProductImageCarousel images={images} modelImages={modelImages} livePreview={livePreview} livePreviewRibbons={ribbons} ribbonIcon={ribbonIcon} saleRibbons={ribbonIcon?.sale} livePreviewOverlay={previewNote} progressPlacement={floatingProgress ? 'floating' : 'below'} className={styles.mobileGallery} />
}

/**
 * The ribbons on a template PDP's main image, stacked top left in the theme's
 * ribbon colors: "Your Personalization" (once personalized) above the
 * product's own badges ("15% off").
 */
/** An icon drawn before one ribbon's text — the personalization badge's wand. */
type RibbonIcon = { on: string; icon: React.ReactNode; sale?: string[] }
// Provided by the page (the template's ribbon + the brand's wand), so every
// desktop gallery's ribbon stack picks it up without threading a prop through each
const RibbonIconContext = createContext<RibbonIcon | undefined>(undefined)

function RibbonStack({ items }: { items?: string[] }) {
  if (!items?.length) return null
  const ri = useContext(RibbonIconContext)
  // Stacked top left: the personalization badge (with its wand) above the product's own
  return (
    <div className={styles.ribbonStack}>
      {items.map((text) => (
        <span key={text} className={`${styles.livePreviewRibbon} ${styles.livePreviewRibbonThemed} ${ri?.on === text ? styles.ribbonWithIcon : ''} ${ri?.sale?.includes(text) ? styles.ribbonSale : ''}`}>
          {ri?.on === text && ri.icon}
          {text}
        </span>
      ))}
    </div>
  )
}

/** A gallery image's class — packshots blend onto the tint, on-model shots don't. */
function galleryImageClass(base: string, src: string, modelImages: string[]): string {
  return modelImages.includes(src) ? `${base} ${styles.galleryModelImage}` : base
}

// ─── Desktop 2×2 static grid (non-OAL) ───────────────────────────────────────

// `rootRef` — the gallery's own box, for the desktop sticky bar to watch
type GalleryRootRef = React.RefObject<HTMLDivElement | null>

function DesktopGallery({ images, modelImages, name, rootRef, livePreview, ribbons, previewNote }: {
  images: string[]; modelImages: string[]; name: string; rootRef?: GalleryRootRef
  /** A live-preview image, drawn in the first cell with its ribbons (template PDPs). */
  livePreview?: string | null; ribbons?: string[]; previewNote?: React.ReactNode
}) {
  const withPreview = livePreview ? [livePreview, ...images] : images
  // At least a full 2×2 — short galleries repeat; longer ones show every image
  const gridImages = withPreview.length >= 4 ? withPreview : [...withPreview, ...withPreview].slice(0, 4)
  return (
    <div ref={rootRef} className={styles.desktopGallery}>
      {gridImages.map((src, i) => (
        <div key={i} className={styles.desktopGridCell}>
          {livePreview && i === 0 && <RibbonStack items={ribbons} />}
          {livePreview && i === 0 && previewNote && <div className={styles.livePreviewNote}>{previewNote}</div>}
          <img
            src={src}
            alt={i === 0 ? name : ''}
            className={galleryImageClass(styles.desktopGridImage, src, modelImages)}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Hero grid: first image full width, the rest two across (template PDPs) ──

/**
 * The live preview, once there is one, takes the full-width hero with its
 * ribbon and pushes the default first image down into the grid.
 */
function HeroGridGallery({ images, modelImages, name, rootRef, livePreview, ribbons, previewNote }: {
  images: string[]; modelImages: string[]; name: string; rootRef?: GalleryRootRef
  livePreview?: string | null; ribbons?: string[]; previewNote?: React.ReactNode
}) {
  const [hero, ...rest] = livePreview ? [livePreview, ...images] : images
  const heroRef = useRef<HTMLDivElement>(null)
  const glideRef = useRef<number | null>(null)

  // Typing while scrolled down brings the preview back into focus: when it
  // updates and the hero has scrolled up under the header, glide back to it.
  // The form column is sticky, so the field being typed in stays in view.
  //
  // The glide is driven frame by frame and re-aims at the hero every frame:
  // the first preview pushes an image into the grid, and that layout shift
  // cancels a native smooth scroll. A wheel or touch hands control back.
  useEffect(() => {
    const el = heroRef.current
    if (!livePreview || !el || el.offsetParent === null) return // hidden below desktop
    // While the steps are open the preview is pinned in view: the page never moves
    if (getComputedStyle(el).position === 'sticky') return
    // Distance from the hero to its resting place under the sticky header (negative: scrolled past)
    const offset = () => el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)
    if (offset() >= -1 || glideRef.current !== null) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, window.scrollY + offset())
      return
    }

    const DURATION = 520
    const from = window.scrollY
    const start = performance.now()
    const stop = () => {
      if (glideRef.current !== null) cancelAnimationFrame(glideRef.current)
      glideRef.current = null
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
    }
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      const eased = 1 - (1 - t) ** 3 // ease-out
      const target = window.scrollY + offset()
      window.scrollTo(0, from + (target - from) * eased)
      if (t < 1) glideRef.current = requestAnimationFrame(step)
      else stop()
    }
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    glideRef.current = requestAnimationFrame(step)
    // A page that isn't being painted (a background or unfocused window) gets
    // no frames: land on the hero directly rather than leave it out of focus
    // (Not cleared on the next preview: typing keeps updating it mid-glide.)
    setTimeout(() => {
      if (!el.isConnected || glideRef.current === null || window.scrollY !== from) return
      stop()
      window.scrollTo(0, window.scrollY + offset())
    }, 150)
  }, [livePreview])
  useEffect(() => () => { if (glideRef.current !== null) cancelAnimationFrame(glideRef.current) }, [])

  return (
    <div ref={rootRef} className={styles.heroGridGallery}>
      {/* The hero in a row of its own, which holds it pinned beside the open steps */}
      <div className={styles.heroGridHeroSlot}>
        <div ref={heroRef} className={`${styles.desktopGridCell} ${styles.heroGridHero}`}>
          <RibbonStack items={ribbons} />
          {livePreview && previewNote && <div className={styles.livePreviewNote}>{previewNote}</div>}
          <img src={hero} alt={name} className={galleryImageClass(styles.desktopGridImage, hero, modelImages)} loading="eager" />
        </div>
      </div>
      {rest.map((src, i) => (
        <div key={`${src.slice(0, 64)}-${i}`} className={styles.desktopGridCell}>
          <img src={src} alt="" className={galleryImageClass(styles.desktopGridImage, src, modelImages)} loading="lazy" />
        </div>
      ))}
    </div>
  )
}

// ─── Overlay thumbnails: one full-width image, thumbnails floating over it ────

function OverlayThumbsGallery({ images, modelImages, name, rootRef, livePreview, ribbons, previewNote }: {
  images: string[]; modelImages: string[]; name: string; rootRef?: GalleryRootRef
  livePreview?: string | null; ribbons?: string[]; previewNote?: React.ReactNode
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const hadPreview = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const allImages = livePreview ? [livePreview, ...images] : images

  /** Slides the track to image `i` (thumbnails, the preview's first appearance). */
  const goTo = useCallback((i: number, smooth = true) => {
    const track = trackRef.current
    if (!track) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollTo({ left: i * track.clientWidth, behavior: smooth && !reduce ? 'smooth' : 'auto' })
    setActiveIdx(i)
  }, [])

  // Jump to the live preview the first time it appears, as the LAL gallery does
  useEffect(() => {
    if (livePreview && !hadPreview.current) { goTo(0, false); hadPreview.current = true }
    if (!livePreview) hadPreview.current = false
  }, [livePreview, goTo])

  // Swiping (a trackpad, or scrolling sideways) moves the active thumbnail with it
  const onScroll = () => {
    const track = trackRef.current
    if (!track || !track.clientWidth) return
    const i = Math.round(track.scrollLeft / track.clientWidth)
    if (i !== activeIdx) setActiveIdx(i)
  }

  // A mouse drags the strip like a finger would, then settles on the nearest image
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (e.pointerType !== 'mouse' || e.button !== 0 || !track) return
    drag.current = { x: e.clientX, left: track.scrollLeft, moved: false }
    track.style.scrollSnapType = 'none'
    track.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!drag.current || !track) return
    const dx = e.clientX - drag.current.x
    if (Math.abs(dx) > 3) drag.current.moved = true
    track.scrollLeft = drag.current.left - dx
  }
  const onPointerUp = () => {
    const track = trackRef.current
    if (!drag.current || !track) return
    const start = Math.round(drag.current.left / track.clientWidth)
    const dx = drag.current.left - track.scrollLeft
    drag.current = null
    track.style.scrollSnapType = ''
    // A short flick is enough to change image; otherwise it settles back
    const step = Math.abs(dx) > track.clientWidth * 0.15 ? (dx < 0 ? 1 : -1) : 0
    goTo(Math.max(0, Math.min(allImages.length - 1, start + step)))
  }

  return (
    <div ref={rootRef} className={styles.overlayGallery}>
      <div
        ref={trackRef}
        className={`${styles.overlayMain} ${styles.overlayTrack}`}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-roledescription="carousel"
        aria-label={`${name} images`}
      >
        {allImages.map((src, i) => (
          <div key={i} className={styles.overlaySlide} aria-roledescription="slide" aria-label={`Image ${i + 1} of ${allImages.length}`}>
            {/* The ribbons and note ride on the live preview's own slide */}
            {i === 0 && livePreview && <RibbonStack items={ribbons} />}
            {i === 0 && livePreview && previewNote && <div className={styles.livePreviewNote}>{previewNote}</div>}
            <img src={src} alt={i === 0 ? name : ''} draggable={false} className={galleryImageClass(styles.desktopGridImage, src, modelImages)} loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
      </div>
      <div className={styles.overlayThumbs}>
        {allImages.map((thumb, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`${styles.lalThumb} ${styles.overlayThumb} ${i === activeIdx ? styles.lalThumbActive : ''}`}
            aria-label={`View image ${i + 1}`}
            aria-pressed={i === activeIdx}
          >
            <img src={thumb} alt="" aria-hidden="true" className={galleryImageClass(styles.oalGalleryImage, thumb, modelImages)} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── OAL: sticky-left hero + vertical scroll right ────────────────────────────

function LALDesktopGallery({ images, modelImages, name, livePreview, rootRef, ribbons, previewNote }: {
  images: string[]; modelImages: string[]; name: string; livePreview?: string | null; rootRef?: GalleryRootRef
  /** Template PDPs: a ribbon stack in the theme's colors, and a note on the preview. MM passes neither ("Live Preview"). */
  ribbons?: string[]; previewNote?: React.ReactNode
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const hadPreview = useRef(false)
  const allImages = livePreview ? [livePreview, ...images] : images

  // Jump to the live preview the first time it appears
  useEffect(() => {
    if (livePreview && !hadPreview.current) { setActiveIdx(0); hadPreview.current = true }
    if (!livePreview) hadPreview.current = false
  }, [livePreview])

  const showRibbon = !!livePreview && activeIdx === 0

  return (
    <div ref={rootRef} className={styles.lalGallery}>
      {/* Thumbnails — left column */}
      <div className={styles.lalThumbCol}>
        {allImages.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIdx(i)}
            className={`${styles.lalThumb} ${i === activeIdx ? styles.lalThumbActive : ''}`}
            aria-label={`View image ${i + 1}`}
          >
            <img src={src} alt="" aria-hidden="true" className={galleryImageClass(styles.oalGalleryImage, src, modelImages)} loading="lazy" />
          </button>
        ))}
      </div>
      {/* Main image — right */}
      <div className={styles.lalMainCell}>
        {showRibbon && (ribbons
          ? <RibbonStack items={ribbons} />
          : <span className={styles.livePreviewRibbon}>Live Preview</span>)}
        {showRibbon && previewNote && <div className={styles.livePreviewNote}>{previewNote}</div>}
        <img src={allImages[activeIdx]} alt={name} className={galleryImageClass(styles.oalGalleryImage, allImages[activeIdx], modelImages)} loading="eager" />
      </div>
    </div>
  )
}

function OALDesktopGallery({ images, modelImages, name, rootRef }: { images: string[]; modelImages: string[]; name: string; rootRef?: GalleryRootRef }) {
  const scrollImages = [images[1], images[0], images[1]]
  return (
    <div ref={rootRef} className={styles.oalGallery}>
      <div className={styles.oalMainCell}>
        <img src={images[0]} alt={name} className={galleryImageClass(styles.oalGalleryImage, images[0], modelImages)} loading="eager" />
      </div>
      <div className={styles.oalScrollCol}>
        {scrollImages.map((src, i) => (
          <div key={i} className={styles.oalScrollCell}>
            <img
              src={src}
              alt=""
              className={galleryImageClass(styles.oalGalleryImage, src, modelImages)}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({
  rating,
  reviewCount,
  StarIcon,
}: {
  rating: number
  reviewCount: number
  StarIcon: React.ComponentType<{ size?: number }>
}) {
  const filled = Math.round(rating)
  return (
    <div className={styles.ratingRow}>
      <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= filled ? styles.starFilled : styles.starEmpty}>
            <StarIcon size={20} />
          </span>
        ))}
      </div>
      <span className={styles.ratingValue}>{rating}</span>
      <a
        href="#reviews"
        className={styles.ratingCount}
        onClick={e => {
          e.preventDefault()
          document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      >{reviewCount.toLocaleString()} Reviews</a>
    </div>
  )
}

// ─── Material swatch selector ─────────────────────────────────────────────────

function SwatchSelector({
  swatches,
  basePrice,
  selectedKey,
  onSelect,
}: {
  swatches: MaterialSwatch[]
  basePrice: number
  selectedKey: string
  onSelect: (key: MaterialSwatch['key']) => void
}) {
  return (
    <div className={styles.swatchSection}>
      <p className={styles.fieldLabel}>
        Metal Type:{' '}
        <span className={styles.fieldLabelValue}>
          {swatches.find((s) => s.key === selectedKey)?.label}
        </span>
      </p>
      <div className={styles.swatchGrid}>
        {swatches.map((s) => {
          const variantPrice = basePrice + s.priceOffset
          const isSelected = s.key === selectedKey
          return (
            <button
              key={s.key}
              type="button"
              className={`${styles.swatchBtn} ${isSelected ? styles.swatchBtnActive : ''}`}
              aria-pressed={isSelected}
              aria-label={`${s.label}, ${formatPrice(variantPrice)}`}
              onClick={() => onSelect(s.key)}
            >
              <span
                className={styles.swatchCircle}
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              <span className={styles.swatchPrice}>{formatPrice(variantPrice)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Trust badges ─────────────────────────────────────────────────────────────

function TrustBadges({
  ShippingIcon,
  ReturnIcon,
  WarrantyIcon,
  GiftIcon,
  onSeeGiftDetails,
}: {
  ShippingIcon: React.ComponentType<{ size?: number }>
  ReturnIcon: React.ComponentType<{ size?: number }>
  WarrantyIcon: React.ComponentType<{ size?: number }>
  GiftIcon: React.ComponentType<{ size?: number }>
  /** Opens the gift options panel. Omit to render the row without a link. */
  onSeeGiftDetails?: () => void
}) {
  const badges = [
    { Icon: GiftIcon,      text: 'Gift options available at checkout', action: onSeeGiftDetails },
    { Icon: ShippingIcon,  text: 'Free shipping on all orders' },
    { Icon: ReturnIcon,    text: '60-day extended returns' },
    { Icon: WarrantyIcon,  text: '5 year warranty' },
  ]

  return (
    <ul className={styles.trustBadges} aria-label="Trust badges">
      {badges.map(({ Icon, text, action }) => (
        <li key={text} className={styles.trustItem}>
          <span className={styles.trustIcon} aria-hidden="true">
            <Icon size={24} />
          </span>
          <span className={styles.trustText}>{text}</span>
          {action && (
            <button type="button" className={styles.trustLink} onClick={action}>
              See details
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}

/** The four USPs with their gift-options panel — under a CTA outside ProductForm (template PDPs). */
function UspBadges({ brand, icons }: { brand: string; icons: (typeof BRAND_ICONS)[keyof typeof BRAND_ICONS] }) {
  const [giftInfoOpen, setGiftInfoOpen] = useState(false)
  return (
    <>
      <TrustBadges
        ShippingIcon={icons.ShippingIcon}
        ReturnIcon={icons.ReturnIcon}
        WarrantyIcon={icons.WarrantyIcon}
        GiftIcon={icons.GiftIcon}
        onSeeGiftDetails={() => setGiftInfoOpen(true)}
      />
      {giftInfoOpen && (
        <GiftOptionsInfoPanel
          options={getGiftOptions(brand).map(o => ({
            id:          o.id,
            name:        o.name,
            description: o.description,
            price:       o.price,
            imageUrl:    o.image,
          }))}
          onClose={() => setGiftInfoOpen(false)}
        />
      )}
    </>
  )
}

/**
 * Which Translation Advisor treatment to show (demo toggle, IB only).
 * v1 — floating launcher in the corner. v2 — inline under the engrave field.
 *
 * Held at module scope so the choice survives a client-side remount while SSR
 * and the first client render still agree on the default.
 */
let lastAdvisorVariant: TranslationAdvisorVariant = 'floating'

// ─── Product form panel ───────────────────────────────────────────────────────

interface ProductFormProps {
  brand: string
  product: ProductItem
  icons: (typeof BRAND_ICONS)[keyof typeof BRAND_ICONS]
  /** Companion / add-on products shown in the Nested Items section. */
  nestedItems?: QuickAddProduct[]
  /** Inline card list (default) or one trigger that opens a multi-select drawer. */
  nestedDisplay?: NestedItemsDisplay
  /** Drawer only: an optional line under the trigger's heading. */
  nestedDescription?: string
  onAddToBag: (
    selectedSwatchKey: MaterialSwatch['key'],
    engravedText: string,
    chainLength: string,
    nestedCartItems: CartItem[],
  ) => void
  /**
   * Config-driven option groups. When set they replace the metal, inscription
   * and chain length controls, and the price, subtotal and Add to Bag read
   * from them (see `onAddConfigured`).
   */
  optionGroups?: OptionGroup[]
  onAddConfigured?: (price: number, selectedOptions: SelectedOption[], isPersonalized: boolean, nestedCartItems: CartItem[]) => void
  /** A personalize-flow demo (see `PersonalizeFlow`) in place of the standard form. */
  flow?: PersonalizeFlow
  /** The desktop gallery beside the form — the desktop sticky bar comes up once it's passed. */
  galleryRef?: GalleryRootRef
}

const NO_OPTION_GROUPS: OptionGroup[] = []

const METAL_OPTION = 'Metal Type'
const DIAMOND_OPTION = 'Diamond Shape'
const CHAIN_LENGTH_OPTION = 'Chain Length'
const INSCRIPTION_OPTION = 'Inscription'

const CHAIN_LENGTH_DROPDOWN: QuickAddOption = {
  name: CHAIN_LENGTH_OPTION,
  type: 'dropdown',
  values: CHAIN_LENGTHS.map((len) => ({ label: len, value: len })),
}

// Personalize-now flow: the PDP's metal picker as the options' standard-image
// carousel — each metal's own shot where the product has one, else its swatch,
// and its full price (with the diamond picked, where there is one)
function metalCarouselGroup(product: ProductItem, extra: number, brand: string) {
  const base = (product.priceInCents ?? 0) + extra
  return {
    id: 'metal-type',
    label: `Select ${materialLabel(brand).toLowerCase()}:`,
    display: 'carousel' as const,
    tile: 'standard' as const,
    values: materialSwatchesFor(product).map((s) => ({
      id: s.key,
      label: s.label,
      image: product.metalImages?.[s.key]?.[0],
      swatchColor: s.color,
      priceLabel: formatPrice(base + s.priceOffset),
    })),
  }
}

// The PDP's diamond shape picker — the options' standard-image carousel, like
// the material's (on desktop the tiles fit, so it shows no arrows)
const DIAMOND_SHAPE_GROUP = {
  id: 'diamond-shape',
  label: 'Diamond shape:',
  display: 'carousel' as const,
  tile: 'standard' as const,
  values: DIAMOND_SHAPES.map((d) => ({ id: d.key, label: d.label, image: d.image })),
}

// The personalize panels: just the personalisation — the names (a count and a
// field per name) or one inscription field, then the chain length — priced and
// titled for the metal (and diamond) already picked on the page.
function toPersonalizationPanel(
  product: ProductItem,
  price: number,
  metal: MaterialSwatch['key'],
  fields: PersonalizeFields,
): QuickAddProduct {
  return {
    ...toQuickAddProduct(product),
    title: titleForMetal(product.name, metal),
    price,
    hideGallery: true,
    engraving: fields === 'names' ? 'names' : 'fields',
    options: fields === 'names'
      ? [CHAIN_LENGTH_DROPDOWN]
      : [
          { name: INSCRIPTION_OPTION, type: 'text-input', maxLength: MAX_ENGRAVE_CHARS, placeholder: 'e.g. Sofia' },
          CHAIN_LENGTH_DROPDOWN,
        ],
  }
}

// Two-step flow's nested offer: a second of the same necklace at half price.
// It's a necklace of its own, so it asks for its own metal (and diamond)
// beside the personalisation — every price halved, the full price crossed out.
const SECOND_NECKLACE_DISCOUNT = 0.5
const SECOND_NECKLACE_TITLE = 'Buy a second necklace at 50% off'

// An optional diamond's "None" — the last tile, an empty circle, the default
const NO_DIAMOND = 'none'
type DiamondChoice = DiamondShape['key'] | typeof NO_DIAMOND

// The diamond shape as a Quick Add option — the carousel of image tiles, each
// priced by its offset, then "None" where the diamond is optional — drawn
// above the names, so the price-setting choices come first
function diamondQuickAddOption(setting: DiamondSetting): QuickAddOption[] {
  if (!setting) return []
  return [{
    name: DIAMOND_OPTION,
    type: 'grid',
    carousel: true,
    beforeNames: true,
    values: [
      ...DIAMOND_SHAPES.map((d) => ({ label: d.label, value: d.key, image: d.image, price: d.priceOffset })),
      ...(setting === 'optional' ? [{ label: 'None', value: NO_DIAMOND, price: 0 }] : []),
    ],
  }]
}

// Personalize-now flow: everything but the metal (the page's) in the Quick Add
// panel, with the gallery — the diamond shape, then the personalisation —
// priced and titled for the page's metal. The gallery is that metal's own
// shots where the product has them.
function toConfigurationPanel(
  product: ProductItem,
  metal: MaterialSwatch['key'],
  fields: PersonalizeFields,
  diamondShape: DiamondSetting,
): QuickAddProduct {
  const swatch = materialSwatchesFor(product).find((s) => s.key === metal)!
  const base = toPersonalizationPanel(product, (product.priceInCents ?? 0) + swatch.priceOffset, metal, fields)
  const metalShots = product.metalImages?.[metal]
  return {
    ...base,
    hideGallery: false,
    images: metalShots?.length
      ? metalShots.map((src) => ({ src, alt: base.title }))
      : toQuickAddProduct(product).images,
    options: [...diamondQuickAddOption(diamondShape), ...base.options],
  }
}

// `metalStyle` matches the page's own picker: the priced swatches, or (where
// the page has it) the material carousel
function toSecondNecklace(
  product: ProductItem,
  fields: PersonalizeFields,
  diamondShape: DiamondSetting,
  metalStyle: 'swatches' | 'carousel',
  brand: string,
): QuickAddProduct {
  const base = toPersonalizationPanel(product, product.priceInCents ?? 0, 'silver', fields)
  const discount = (cents: number) => Math.round(cents * (1 - SECOND_NECKLACE_DISCOUNT))
  const priceSetting: QuickAddOption[] = [
    {
      name: METAL_OPTION,
      ...(metalStyle === 'carousel'
        ? { type: 'material-carousel' as const, label: `Select ${materialLabel(brand).toLowerCase()}:` }
        : { type: 'swatch' as const, showPrices: true }),
      values: materialSwatchesFor(product).map((s) => ({ label: s.label, value: s.key, color: s.color, price: s.priceOffset })),
    },
    ...diamondQuickAddOption(diamondShape),
  ]
  return {
    ...base,
    // Untitled by metal here — the panel renames it for the metal it picks
    title: product.name,
    // Its own nested-item key, apart from the main product's url
    pdpUrl: `${base.pdpUrl}#second`,
    price: discount(base.price),
    salePrice: base.price,
    ribbon: '50% off',
    options: [...priceSetting, ...base.options].map((opt) => ({
      ...opt,
      values: opt.values?.map((v) => ({ ...v, price: v.price != null ? discount(v.price) : v.price })),
    })),
  }
}

function ProductForm({ brand, product, icons, nestedItems = [], nestedDisplay = 'inline', nestedDescription, onAddToBag, optionGroups, onAddConfigured, flow, galleryRef }: ProductFormProps) {
  // Personalize-now is the two-step flow with the whole configuration in its panel
  const personalizeNow = flow?.kind === 'personalize-now'
  const twoStep = flow?.kind === 'two-step' || personalizeNow
  const shortcut = flow?.kind === 'shortcut'
  const saveFlow = flow?.kind === 'save'
  const fields: PersonalizeFields = flow && flow.kind !== 'shortcut' ? flow.fields : 'inscription'
  const diamondSetting: DiamondSetting = (flow && flow.kind !== 'shortcut' && flow.diamondShape) || false
  const hasDiamond = Boolean(diamondSetting)
  const [selectedSwatchKey, setSelectedSwatchKey] = useState<MaterialSwatch['key']>(
    product.defaultSwatchKey ?? 'vermeil'
  )
  const [engravedText, setEngravedText] = useState('')
  // Shortcut flow: the inscription is required on the page too, as in its panel —
  // a blocked Add to Bag marks the field
  const [inscriptionError, setInscriptionError] = useState(false)
  const [chainLength, setChainLength] = useState(DEFAULT_CHAIN_LENGTH)
  // Diamond pieces' shape — price-setting, so it stays on the page beside the metal
  const [diamondKey, setDiamondKey] = useState<DiamondChoice>(
    diamondSetting === 'optional' ? NO_DIAMOND : DIAMOND_SHAPES[0].key,
  )
  // None when the diamond is optional and left off — no price, no bag line
  const diamond = hasDiamond ? DIAMOND_SHAPES.find((d) => d.key === diamondKey) : undefined
  const diamondOffset = diamond?.priceOffset ?? 0

  // Config-driven options — one state for every group, the price and the subtotal
  const usesOptions = optionGroups !== undefined
  const options = useProductOptions(optionGroups ?? NO_OPTION_GROUPS, product.priceInCents ?? 0)
  // The Translation Advisor fills the first text field, whichever form is showing
  const engravingGroupId = optionGroups?.find((g) => g.kind === 'text-input')?.id
  const useName = (name: string) => {
    if (usesOptions && engravingGroupId) options.setText(engravingGroupId, name)
    else setEngravedText(name)
  }
  const { DropdownIcon, StarIcon, ShippingIcon, ReturnIcon, WarrantyIcon, GiftIcon, ChevronIcon } = icons

  // "See details" on the gift USP row opens a read-only packaging panel.
  const [giftInfoOpen, setGiftInfoOpen] = useState(false)

  // Sticky "continue customization" bar watches the CTA and returns here.
  const addToBagRef = useRef<HTMLDivElement>(null)
  const formPanelRef = useRef<HTMLElement>(null)
  // Sticky-personalize: the selections after the metal start here — the bars
  // step aside from here down to the CTA, which does their job in that stretch
  const selectionsStartRef = useRef<HTMLDivElement>(null)

  // Translation Advisor treatment — demo toggle, IB only.
  const [advisorVariant, setAdvisorVariant] = useState<TranslationAdvisorVariant>(() => lastAdvisorVariant)
  useEffect(() => { lastAdvisorVariant = advisorVariant }, [advisorVariant])

  // ── Nested Items — staged companion products + quick-add panel state ──────
  // `staged` maps a nested item's key → its fully configured cart item.
  const [staged, setStaged] = useState<Record<string, CartItem>>({})
  const [panelItem, setPanelItem] = useState<QuickAddProduct | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  // Two-step flow — step 2 is the personalisation in the Quick Add panel; what
  // the shopper enters there is kept, so reopening it picks up where it was
  const [personalizeOpen, setPersonalizeOpen] = useState(false)
  // The panel's nested offer — the second necklace, in place of the page's companions
  const offerItems = twoStep
    ? [toSecondNecklace(product, fields, diamondSetting, personalizeNow ? 'carousel' : 'swatches', brand)]
    : nestedItems
  // Once added, the card names the metal it was personalised in
  const offerCards = offerItems.map((it) => {
    const added = staged[nestedItemKey(it)]
    return added ? { ...it, title: added.name } : it
  })
  const [personalizeValues, setPersonalizeValues] = useState<QuickAddFormValues>({ selectedOptions: {}, names: [''] })
  const personalizeInitial: QuickAddFormValues = {
    ...personalizeValues,
    // The PDP's default length until one is picked; personalize-now's diamond
    // is always the page's
    selectedOptions: {
      [CHAIN_LENGTH_OPTION]: DEFAULT_CHAIN_LENGTH,
      ...personalizeValues.selectedOptions,
      ...(personalizeNow && hasDiamond ? { [DIAMOND_OPTION]: diamondKey } : {}),
    },
  }
  // Personalize-now: the diamond picked in the panel is mirrored on the page,
  // so the page's price follows it
  const handlePersonalizeChange = (values: QuickAddFormValues) => {
    setPersonalizeValues(values)
    const shape = values.selectedOptions[DIAMOND_OPTION] as DiamondChoice | undefined
    if (personalizeNow && shape && shape !== diamondKey) setDiamondKey(shape)
  }

  const checkedKeys = new Set(Object.keys(staged))
  // The drawer's picks carry its 2+ discount into the subtotal and the bag
  const stagedItems = nestedDisplay === 'drawer' ? withBundleDiscount(Object.values(staged)) : Object.values(staged)
  const stagedCount = stagedItems.length
  const nestedTotal = stagedItems.reduce((sum, it) => sum + it.price, 0)

  // Marked as a companion, so the cart treats it as part of the main item (no
  // protection plan of its own) — the same as `useNestedItems` does.
  const stage = (key: string, item: CartItem) => setStaged((prev) => ({ ...prev, [key]: { ...item, isCompanion: true } }))
  const unstage = (key: string) =>
    setStaged((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })

  // Bumped on every pick, so the companion's panel starts over from its defaults
  const [nestedFormKey, setNestedFormKey] = useState(0)

  const handleToggle = (item: QuickAddProduct, checked: boolean) => {
    if (checked) {
      // Selecting opens the quick-add panel to configure the companion product.
      setPanelItem(item)
      setNestedFormKey((k) => k + 1)
      setPanelOpen(true)
    } else {
      // Unchecking removes it directly — no panel.
      unstage(nestedItemKey(item))
    }
  }

  // The product's own materials where it lists them, else the standard four
  const swatches = materialSwatchesFor(product)
  const selectedSwatch = swatches.find((s) => s.key === selectedSwatchKey) ?? swatches[0]
  const currentPrice = usesOptions
    ? options.itemPrice
    : (product.priceInCents ?? 0) + selectedSwatch.priceOffset + diamondOffset
  const subtotalValue = (usesOptions ? options.subtotal : currentPrice) + nestedTotal
  // N = 1 (main product) + staged nested items.
  const ctaLabel = stagedCount === 0 ? 'Add to Bag' : `Add ${1 + stagedCount} Items to bag`
  // The personalize flows' panel CTAs carry the bag total — what the picks
  // cost, a discounted companion at its price paid — after an em dash (the
  // page's own CTAs don't). Whole dollars unless a half-price option leaves
  // cents, so it matches the bag.
  const subtotalLabel = Number.isInteger(subtotalValue / 100)
    ? formatPrice(subtotalValue)
    : `$${(subtotalValue / 100).toFixed(2)}`
  const withTotal = (label: string) => `${label} — ${subtotalLabel}`
  // The page's own CTA in the personalize flows opens the panel; it reads as
  // plain Add to Bag, or Personalize Now where the panel holds everything
  const personalizeLabel = flow?.kind === 'personalize-now' ? flow.cta ?? 'Personalize Now' : 'Add to Bag'
  // The two-step panel's Add to Bag — with the bag total, unless the flow says not
  const personalizePanelCta = flow?.kind === 'personalize-now' && flow.panelTotal === false
    ? ctaLabel
    : withTotal(ctaLabel)

  // The personalize flows' add: the page's price-setting choices, then the
  // personalisation the panel built — with any companions picked, then the bag
  const priceSettingOptions: SelectedOption[] = [
    { label: materialLabel(brand), value: selectedSwatch.label },
    ...(diamond ? [{ label: DIAMOND_OPTION, value: diamond.label }] : []),
  ]
  const { addItem, openCart } = useCart()
  const addPersonalized = (personalization: SelectedOption[]) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      name: titleForMetal(product.name, selectedSwatchKey),
      price: currentPrice,
      originalPrice: undefined,
      image: product.image,
      isPersonalized: personalization.length > 0,
      rating: product.rating,
      reviewCount: product.reviewCount,
      selectedOptions: [...priceSettingOptions, ...personalization],
    })
    stagedItems.forEach((it) => addItem(it))
    setStaged({})
    openCart(true)
  }
  // Two-step: the panel's Add to Bag. The diamond, picked in personalize-now's
  // panel, is already among the page's price-setting choices
  const handlePersonalizeAdd = (item: CartItem) =>
    addPersonalized((item.selectedOptions ?? []).filter((o) => o.label !== DIAMOND_OPTION))

  // Save flow — "Add Personalization" opens the personalisation (a fresh form
  // from what's saved, each time); Save keeps it on the page, summarised and
  // editable. Add to Bag sits below either way — personalising is optional
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveKey, setSaveKey] = useState(0)
  const [saved, setSaved] = useState<{ values: QuickAddFormValues; lines: SelectedOption[] } | null>(null)
  const openSavePanel = () => {
    setSaveKey((k) => k + 1)
    setSaveOpen(true)
  }
  const handleSavedAdd = () => addPersonalized(saved?.lines ?? [])

  // Sticky-personalize flow — the panel opens from the page's inscription and
  // chain length (a fresh form each time) and writes every change back, so
  // its Add to Bag is the page's own
  const [quickPersonalizeOpen, setQuickPersonalizeOpen] = useState(false)
  const [quickPersonalizeKey, setQuickPersonalizeKey] = useState(0)
  const openQuickPersonalize = () => {
    setQuickPersonalizeKey((k) => k + 1)
    setQuickPersonalizeOpen(true)
  }
  const quickPersonalizeProduct = shortcut
    ? toPersonalizationPanel(product, currentPrice, selectedSwatchKey, 'inscription')
    : null
  // The two-step and save flows' panel — the same personalisation-only form
  const personalizeProduct = personalizeNow
    ? toConfigurationPanel(product, selectedSwatchKey, fields, diamondSetting)
    : twoStep || saveFlow
      ? toPersonalizationPanel(product, currentPrice, selectedSwatchKey, fields)
      : null
  const handleQuickPersonalizeChange = (values: QuickAddFormValues) => {
    setEngravedText(values.selectedOptions[INSCRIPTION_OPTION] ?? '')
    setChainLength(values.selectedOptions[CHAIN_LENGTH_OPTION] ?? DEFAULT_CHAIN_LENGTH)
  }

  const handleMainAdd = () => {
    if (shortcut && !engravedText.trim()) {
      setInscriptionError(true)
      const input = document.getElementById('engrave-input')
      input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      input?.focus({ preventScroll: true })
      return
    }
    if (usesOptions) {
      const personalized = Boolean(engravingGroupId && options.state.text[engravingGroupId]?.trim())
      onAddConfigured?.(options.subtotal, options.selectedOptions, personalized, stagedItems)
    }
    else onAddToBag(selectedSwatchKey, engravedText, chainLength, stagedItems)
    setStaged({})
  }

  // IB only: the inline / link advisor sits under the text field it fills
  const inlineAdvisor = brand === 'ib' && (advisorVariant === 'inline' || advisorVariant === 'link') && (
    <TranslationAdvisor variant={advisorVariant} onUseName={useName} />
  )

  return (
    <section
      ref={formPanelRef}
      className={`${styles.formPanel} ${usesOptions ? styles.formPanelOptions : ''}`}
      aria-label="Product options"
    >
      {/* Header group: breadcrumb / title+price / stars */}
      <div className={styles.productHeader}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <ol className={styles.breadcrumbList}>
            <li>
              <Link href={`/${brand}`} className={styles.breadcrumbLink}>
                Home
              </Link>
            </li>
            <li aria-hidden="true" className={styles.breadcrumbSep}>
              <ChevronIcon size={20} />
            </li>
            <li>
              <Link href={`/${brand}/category`} className={styles.breadcrumbLink}>
                Best Sellers
              </Link>
            </li>
          </ol>
        </nav>

        <div className={styles.productTitlePriceGroup}>
          {/* Follows the metal picked, unless the config-driven options own the form */}
          <h1 className={styles.productTitle}>{usesOptions ? product.name : titleForMetal(product.name, selectedSwatchKey)}</h1>
          <div className={styles.priceRow}>
            <span className={styles.priceCurrent}>{currentPrice > 0 ? formatPrice(currentPrice) : product.price ?? ''}</span>
          </div>
        </div>

        <StarRating
          rating={product.rating ?? 0}
          reviewCount={product.reviewCount ?? 0}
          StarIcon={StarIcon}
        />
      </div>

      {twoStep || saveFlow ? (
        /* Two-step and save: the price-setting choices stay on the page — the
           metal, and the diamond shape where there is one; the rest is in the
           panel. Personalize-now keeps only the metal, as a standard-image
           carousel. */
        <>
          {personalizeNow ? (
            <div className={styles.materialPicker}>
              <OptionRadioGroup
                group={metalCarouselGroup(product, diamondOffset, brand)}
                value={selectedSwatchKey}
                onChange={(id) => setSelectedSwatchKey(id as MaterialSwatch['key'])}
              />
            </div>
          ) : (
            <SwatchSelector
              swatches={swatches}
              basePrice={(product.priceInCents ?? 0) + diamondOffset}
              selectedKey={selectedSwatchKey}
              onSelect={setSelectedSwatchKey}
            />
          )}
          {hasDiamond && !personalizeNow && (
            <OptionRadioGroup
              group={DIAMOND_SHAPE_GROUP}
              value={diamondKey}
              onChange={(id) => setDiamondKey(id as DiamondShape['key'])}
            />
          )}
        </>
      ) : usesOptions ? (
        <ProductOptions
          groups={optionGroups}
          options={options}
          basePrice={product.priceInCents ?? 0}
          slots={engravingGroupId ? { [engravingGroupId]: inlineAdvisor } : undefined}
        />
      ) : (
        <>
        {/* Swatch selector */}
        <SwatchSelector
          swatches={swatches}
          basePrice={product.priceInCents ?? 0}
          selectedKey={selectedSwatchKey}
          onSelect={setSelectedSwatchKey}
        />

        {/* Engrave input */}
        <div ref={selectionsStartRef} className={styles.fieldGroup}>
          <div className={styles.fieldLabelRow}>
            <label className={styles.fieldLabel} htmlFor="engrave-input">
              Inscription:
            </label>
            {/* No destination yet — wire to the font guide when it exists */}
            <button type="button" className={styles.fieldLabelLink}>
              Font Guide
            </button>
          </div>
          <div className={styles.inputWrap}>
            <input
              id="engrave-input"
              type="text"
              value={engravedText}
              maxLength={MAX_ENGRAVE_CHARS}
              placeholder="e.g. Sofia"
              className={`${styles.textInput} ${inscriptionError && !engravedText.trim() ? styles.textInputError : ''}`}
              required={shortcut || undefined}
              aria-invalid={(inscriptionError && !engravedText.trim()) || undefined}
              aria-describedby={inscriptionError && !engravedText.trim() ? 'engrave-input-error' : undefined}
              onChange={(e) => setEngravedText(e.target.value)}
            />
          </div>
          {inscriptionError && !engravedText.trim() && (
            <p id="engrave-input-error" className={styles.errorMsg}>
              Please enter Inscription.
            </p>
          )}

          {/* v2 belongs to this field, so it sits inside the group and picks up
              its 8px gap rather than the form panel's 24px. IB-only. */}
          {inlineAdvisor}
        </div>

        {/* Chain length */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="chain-length">
            Chain Length
          </label>
          <div className={styles.selectWrap}>
            <select
              id="chain-length"
              value={chainLength}
              className={styles.chainSelect}
              onChange={(e) => setChainLength(e.target.value)}
            >
              {CHAIN_LENGTHS.map((len) => (
                <option key={len} value={len}>
                  {len}
                </option>
              ))}
            </select>
            <span className={styles.selectArrow} aria-hidden="true">
              <DropdownIcon size={24} />
            </span>
          </div>
        </div>
        </>
      )}

      {/* Nested Items — companion products, directly above the Subtotal */}
      {twoStep || saveFlow ? null : nestedDisplay === 'drawer' ? (
        <NestedItemsDrawer
          brand={brand}
          items={nestedItems}
          staged={staged}
          onStage={stage}
          onUnstage={unstage}
          description={nestedDescription}
        />
      ) : (
        <NestedItems
          brand={brand}
          items={nestedItems}
          checkedKeys={checkedKeys}
          onToggle={handleToggle}
        />
      )}

      {saveFlow ? (
        <>
          {/* Save flow — Add Personalization (once saved, the saved
              personalisation, which Edit reopens) above Add to Bag, which adds
              with or without it. The sticky bar is Add to Bag, like the two-step's. */}
          <div ref={addToBagRef} className={styles.personalizeBlock}>
            {saved ? (
              <div className={styles.savedPersonalization}>
                <div className={styles.fieldLabelRow}>
                  <span className={styles.fieldLabel}>Personalization</span>
                  <button type="button" className={styles.fieldLabelLink} onClick={openSavePanel}>
                    Edit
                  </button>
                </div>
                <ul className={styles.savedList}>
                  {saved.lines.map((line) => (
                    <li key={line.label} className={styles.savedLine}>
                      {line.label}: {line.value}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Button variant="secondary" className={styles.addToBagBtn} onClick={openSavePanel}>
                Add Personalization
              </Button>
            )}
            <Button variant="add-to-cart" className={styles.addToBagBtn} onClick={handleSavedAdd}>
              Add to Bag
            </Button>
          </div>
          <StickyCustomizeBar
            watch={addToBagRef}
            showBelowFold
            label="Add to Bag"
            onClick={handleSavedAdd}
          />
        </>
      ) : twoStep ? (
        <>
          {/* Step 1 — the inline CTA under the price-setting choices, and
              (mobile) the sticky bar whenever it is off screen: up on landing,
              aside while the CTA shows, back once it's scrolled past. Both open
              step 2. */}
          <div ref={addToBagRef}>
            <Button
              variant="add-to-cart"
              className={styles.addToBagBtn}
              onClick={() => setPersonalizeOpen(true)}
            >
              {personalizeLabel}
            </Button>
          </div>
          <StickyCustomizeBar
            watch={addToBagRef}
            showBelowFold
            label={personalizeLabel}
            onClick={() => setPersonalizeOpen(true)}
          />
        </>
      ) : (
        <>
          {/* Subtotal */}
          <div className={styles.subtotalRow}>
            <span className={styles.subtotalLabel}>Subtotal</span>
            <span className={styles.subtotalValue}>{formatPrice(subtotalValue)}</span>
          </div>

          {/* CTA */}
          <div ref={addToBagRef}>
            <Button
              variant="add-to-cart"
              className={styles.addToBagBtn}
              onClick={handleMainAdd}
            >
              {ctaLabel}
            </Button>
          </div>

          {/* Every brand gets the sticky bar; the advisor above is IB-only.
              Sticky-personalize: up from landing, aside while the Add to Bag
              shows, back once it's passed — and it opens the panel. */}
          {shortcut ? (
            <StickyCustomizeBar
              watch={addToBagRef}
              watchFrom={selectionsStartRef}
              showBelowFold
              label={personalizeLabel}
              onClick={openQuickPersonalize}
            />
          ) : (
            <StickyCustomizeBar watch={addToBagRef} target={formPanelRef} />
          )}
        </>
      )}

      {/* Trust badges */}
      <TrustBadges
        ShippingIcon={ShippingIcon}
        ReturnIcon={ReturnIcon}
        WarrantyIcon={WarrantyIcon}
        GiftIcon={GiftIcon}
        onSeeGiftDetails={() => setGiftInfoOpen(true)}
      />

      {/* v1 floats over the page rather than sitting in the form flow */}
      {brand === 'ib' && advisorVariant === 'floating' && (
        <TranslationAdvisor variant="floating" onUseName={useName} />
      )}

      {/* Advisor version switcher — presentation/demo only */}
      {brand === 'ib' && (
        <PanelPortal>
        <div className={styles.advisorVersionToggle} role="group" aria-label="Translation Advisor version">
          {([['v1', 'floating'], ['v2', 'inline'], ['v3', 'link']] as const).map(([label, v]) => (
            <button
              key={v}
              type="button"
              className={`${styles.advisorVersionBtn} ${advisorVariant === v ? styles.advisorVersionBtnActive : ''}`}
              aria-pressed={advisorVariant === v}
              onClick={() => setAdvisorVariant(v)}
            >
              {label.toUpperCase()}
            </button>
          ))}
        </div>
        </PanelPortal>
      )}

      {giftInfoOpen && (
        <GiftOptionsInfoPanel
          options={getGiftOptions(brand).map(o => ({
            id:          o.id,
            name:        o.name,
            description: o.description,
            price:       o.price,
            imageUrl:    o.image,
          }))}
          onClose={() => setGiftInfoOpen(false)}
        />
      )}

      {/* Quick-add panel — reused to configure a nested item; CTA reads "Add" and
          the completed item is staged (not dropped straight into the bag). */}
      <QuickAddPanel
        isOpen={panelOpen}
        product={panelItem}
        onClose={() => setPanelOpen(false)}
        ctaLabel="Add"
        showViewDetails={false}
        formKey={nestedFormKey}
        // The two-step offer opens at silver, the PDP's default chain length, and
        // no diamond where it's optional
        initialValues={twoStep ? {
          selectedOptions: {
            [METAL_OPTION]: 'silver',
            [CHAIN_LENGTH_OPTION]: DEFAULT_CHAIN_LENGTH,
            ...(diamondSetting === 'optional' ? { [DIAMOND_OPTION]: NO_DIAMOND } : {}),
          },
          names: [''],
        } : undefined}
        onAdd={(cartItem) => {
          if (!panelItem) return
          // A discounted item carries its full price into the bag, crossed out there too
          const fullPrice = panelItem.salePrice != null
            ? Math.round(cartItem.price / (panelItem.price / panelItem.salePrice))
            : undefined
          stage(nestedItemKey(panelItem), fullPrice != null ? { ...cartItem, originalPrice: fullPrice } : cartItem)
        }}
      />

      {/* Desktop, every personalize flow: once the gallery has scrolled past, a
          bottom bar with the title and price and the flow's next step */}
      {flow && (
        <StickyProductBar
          watch={galleryRef ?? formPanelRef}
          hideOver={shortcut ? { from: selectionsStartRef, to: addToBagRef } : undefined}
          title={titleForMetal(product.name, selectedSwatchKey)}
          price={formatPrice(currentPrice)}
          label={personalizeLabel}
          onClick={
            saveFlow ? handleSavedAdd
            : twoStep ? () => setPersonalizeOpen(true)
            : openQuickPersonalize
          }
        />
      )}

      {/* Sticky-personalize flow — the inscription and chain length (no metal),
          then the page's companions; adds the page's whole configuration */}
      {shortcut && (
        <QuickAddPanel
          isOpen={quickPersonalizeOpen}
          product={quickPersonalizeProduct}
          onClose={() => setQuickPersonalizeOpen(false)}
          showViewDetails={false}
          ctaLabel={withTotal(ctaLabel)}
          onAdd={handleMainAdd}
          // The page's own companions, sharing its picks — checked here or on
          // the page, it's the same item either way
          afterOptions={
            nestedDisplay === 'drawer' ? (
              <NestedItemsDrawer
                brand={brand}
                items={nestedItems}
                staged={staged}
                onStage={stage}
                onUnstage={unstage}
                description={nestedDescription}
              />
            ) : (
              <NestedItems
                brand={brand}
                items={nestedItems}
                checkedKeys={checkedKeys}
                onToggle={handleToggle}
              />
            )
          }
          initialValues={{
            selectedOptions: { [INSCRIPTION_OPTION]: engravedText, [CHAIN_LENGTH_OPTION]: chainLength },
            names: [''],
          }}
          onChange={handleQuickPersonalizeChange}
          formKey={quickPersonalizeKey}
        />
      )}

      {/* Two-step flow, step 2 — the personalisation, then the nested offer (a
          pick opens its own panel on top, as on the page); adds it all to the
          bag and opens it */}
      {twoStep && (
        <QuickAddPanel
          isOpen={personalizeOpen}
          product={personalizeProduct}
          onClose={() => setPersonalizeOpen(false)}
          showViewDetails={false}
          ctaLabel={personalizePanelCta}
          onAdd={handlePersonalizeAdd}
          afterOptions={
            <NestedItems
              brand={brand}
              title={SECOND_NECKLACE_TITLE}
              items={offerCards}
              checkedKeys={checkedKeys}
              onToggle={handleToggle}
            />
          }
          initialValues={personalizeInitial}
          onChange={handlePersonalizeChange}
        />
      )}

      {/* Save flow — the personalisation alone; Save keeps it on the page */}
      {saveFlow && (
        <QuickAddPanel
          isOpen={saveOpen}
          product={personalizeProduct}
          onClose={() => setSaveOpen(false)}
          showViewDetails={false}
          ctaLabel="Save"
          onAdd={(item, values) => setSaved({ values, lines: item.selectedOptions ?? [] })}
          initialValues={saved?.values ?? { selectedOptions: { [CHAIN_LENGTH_OPTION]: DEFAULT_CHAIN_LENGTH }, names: [''] }}
          formKey={saveKey}
        />
      )}
    </section>
  )
}

// ─── Page inner ───────────────────────────────────────────────────────────────

interface ProductDetailPageProps {
  productId: number
  previewId?: string
  /** Skip the product's PDP template (`/product/4a`), showing its own flow instead. */
  withoutTemplate?: boolean
  /**
   * The final live preview (`/product/livepreviewfinal`): one version — the
   * gallery preview + new layout (live preview's V2) — with the mobile
   * layout (info above or below the gallery) from `?mobileLayout=`, and the
   * mobile gallery sticky on every live-preview product, Music Memories too.
   */
  finalPreview?: boolean
}

function ProductDetailPageInner({ productId, previewId, withoutTemplate = false, finalPreview = false }: ProductDetailPageProps) {
  const pathname = usePathname()
  const router = useRouter()
  const brand = getBrandFromPathname(pathname)
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  // The options showcase product comes from the shared jewelry catalog, so it
  // exists on every brand (LAL's own catalog is canvases).
  const isOptionsShowcase = productId === OPTIONS_SHOWCASE_PRODUCT_ID
  const product =
    getBrandProducts(brand).find((p) => p.id === productId) ?? (isOptionsShowcase ? optionsShowcaseProduct : undefined)
  if (!product) notFound()

  const images = [
    product.image,
    ...(product.hoverImage ? [product.hoverImage] : []),
    ...(product.galleryImages ?? []).map((g) => g.src),
    // The brand's packaging always comes last
    ...(BRAND_PACKAGING_IMAGES[brand] ? [BRAND_PACKAGING_IMAGES[brand]] : []),
  ]
  // On-model shots (the hover image, unless marked otherwise) stay untinted
  const modelImages = [
    ...(product.hoverImage && product.hasModelImage !== false ? [product.hoverImage] : []),
    ...(product.galleryImages ?? []).filter((g) => g.onModel).map((g) => g.src),
  ]
  const { items, isOpen, subtotal, closeCart, removeItem, addItem, openCart } = useCart()
  const icons = BRAND_ICONS[brand]

  const [livePreview, setLivePreview] = useState<string | null>(null)
  const [livePreviewLoading, setLivePreviewLoading] = useState(false)
  const [previewPersonalized, setPreviewPersonalized] = useState(false)
  // The desktop gallery — the desktop sticky bar comes up once it's scrolled past
  const galleryRef = useRef<HTMLDivElement>(null)
  // The Drawer demo's charm count and description come from the header's
  // demo controls (?charms=, ?desc=)
  const searchParams = useSearchParams()
  const nestedDrawerCount = readNestedDrawerCount(searchParams)
  const nestedDescription = readNestedDescriptionState(searchParams) === 'show' ? NESTED_DRAWER_DESCRIPTION : undefined
  const nestedDisplay: NestedItemsDisplay = isNestedDrawerProduct(brand, product.id) ? 'drawer' : 'inline'

  // A PDP template drives the page when this product has one (a bespoke
  // customizer opts out in the template itself). `?engine=external` swaps the
  // preview engine for the simulated external one, to review its loading state.
  const baseTemplate = isOptionsShowcase || withoutTemplate ? undefined : renderedTemplateFor(brand, product.id)
  const engineParam = searchParams.get('engine')
  const template = useMemo(() => {
    let t = baseTemplate && engineParam === 'external' ? withExternalEngine(baseTemplate) : baseTemplate
    // The final live preview draws some fields its own way (Inez: dropdowns)
    const changes = finalPreview ? t?.finalPreviewFields : undefined
    if (t && changes) t = { ...t, fields: t.fields.map((f) => (changes[f.fieldId] ? { ...f, ...changes[f.fieldId] } : f)) }
    if (t && finalPreview && t.finalPreviewSteps) t = { ...t, steps: t.finalPreviewSteps }
    if (t && finalPreview && t.finalPreviewSampleText) t = { ...t, livePreview: { ...t.livePreview, sampleText: t.finalPreviewSampleText } }
    return t
  }, [baseTemplate, engineParam, finalPreview])

  // Gallery: the template picks the desktop layout and where the preview goes;
  // without one, each brand keeps its own layout.
  // The header's gallery toggle (?gallery=) overrides the template's own choice
  // (Not on the final live preview: it has no gallery switch — each product's own gallery)
  const galleryOverride = template && !finalPreview ? readGalleryLayout(searchParams)?.display : undefined
  // TGR and OAL lead every desktop PDP with Hero + grid (photo first)
  const desktopGallery: GalleryDisplay = galleryOverride
    ?? (brand === 'tgr' || brand === 'oal' ? 'heroGridPhotoFirst' : template?.gallery.desktop)
    ?? (brand === 'lal' ? 'sideScroll' : 'grid')
  // `replaceHero`: the preview takes the first photo's place — that photo is
  // for category pages; the PDP leads with the preview itself
  // The Personalize toggle (?personalize=): "In panel" keeps the product's
  // photos in the gallery until the shopper saves a personalization; then the
  // preview is pushed in front of them
  // "In panel v3" does the same on mobile, until the shopper types their own name
  // The final live preview has one version: V2's (Gallery Preview + New Layout)
  const placement = template ? (finalPreview ? 'page' : readPersonalizePlacement(searchParams, template.flow.defaultPlacement)) : undefined
  const isMusicMemories = !template && brand === 'lal' && MUSIC_MEMORIES_PRODUCT_IDS.has(product.id)
  const mobileLayout = readMobileLayout(searchParams)
  const isMobile = useIsMobile()
  const isNarrow = useIsMobile('(max-width: 1023px)')
  // Every version leads with the product's own photo; the preview is pushed in
  // front once it's the shopper's own — typed (desktop, V2) or saved (mobile V1, V3)
  const behindRow = !!template
  // V2 (mobile): the product header moves above the gallery — the customizer
  // keeps drawing it (the price is live) into this slot
  // …and V2 (Preview in gallery) uses the same header-above layout
  // Final live preview: the info above the gallery unless the mobile layout
  // toggle puts the gallery first; Music Memories draws its header there too
  // On the final live preview "mobile" is every width the mobile gallery shows
  // at (under 1024px) — tablets included — so it always sticks there
  const headerAbove = finalPreview
    ? isNarrow && mobileLayout === 'info-above' && (!!template || isMusicMemories)
    : placement === 'page' && isMobile
  const [headerSlot, setHeaderSlot] = useState<HTMLDivElement | null>(null)
  // The mobile gallery's box (it lands just under the site header when scrolled to)
  const mobileGalleryRef = useRef<HTMLDivElement>(null)
  // V2 on mobile: the gallery sticks under the header while the shopper fills in
  // the form below it — the preview updates in view as they type — and leaves
  // with the Add to Bag button once that scrolls up to it
  // (Final live preview: in both mobile layouts, on every live-preview product)
  const stickyGallery = finalPreview ? isNarrow && (!!template || isMusicMemories) : placement === 'page' && isMobile && !!template
  useEffect(() => {
    const el = mobileGalleryRef.current
    if (!stickyGallery || !el) return
    const update = () => {
      const header = document.querySelector('header')
      const top = Math.max(0, header ? header.getBoundingClientRect().bottom : 0)
      el.style.top = `${top}px`
      // A focused field scrolls into view below the gallery, not behind it
      document.documentElement.style.scrollPaddingTop = `${top + el.offsetHeight}px`
      // The page's main button: the template customizer marks it; Music
      // Memories' is its own CTA button
      const cta = document.querySelector('#buy-box [data-main-cta]')
        ?? document.querySelector('section[aria-label="Product options"] button[class*="ctaButton"]')
      if (!cta) { el.style.transform = ''; return }
      // Once the button comes within the form's own gap of the gallery's bottom
      // edge, they scroll away together — keeping that gap between them
      const gap = parseFloat(getComputedStyle(cta.parentElement ?? cta).rowGap) || 0
      const overlap = cta.getBoundingClientRect().top - gap - (top + el.offsetHeight)
      el.style.transform = overlap < 0 ? `translateY(${overlap}px)` : ''
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      el.style.top = ''
      el.style.transform = ''
      document.documentElement.style.scrollPaddingTop = ''
    }
  }, [stickyGallery, mobileLayout])
  // Added to your bag (as Music Memories): the preview stays, its ribbon goes.
  // Personalize Another starts the customizer over — a fresh one, back at the top.
  const [addedToBag, setAddedToBag] = useState(false)
  const [customizerRun, setCustomizerRun] = useState(0)
  // The final live preview opens with the nested item on
  const nestedOn = readNestedItemOn(searchParams, finalPreview)
  // Switching versions starts the page over, at the top
  const versionKey = placement ?? ''
  const lastVersion = useRef(versionKey)
  useEffect(() => {
    if (lastVersion.current === versionKey) return
    lastVersion.current = versionKey
    setAddedToBag(false)
    window.scrollTo(0, 0)
  }, [versionKey])
  const personalizeAnother = useCallback(() => {
    setCustomizerRun((n) => n + 1)
    setAddedToBag(false)
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [])
  // The product's photos stay in place; the preview is added in front of them
  const galleryImages = images
  const slotPreview = behindRow ? (previewPersonalized ? livePreview : null) : livePreview
  // With a sample (a name, Inez's initials), the badge waits for the shopper's own
  const previewRibbon = template
    ? (addedToBag || ((template.livePreview.sampleText || template.livePreview.sampleByCount) && !previewPersonalized) ? '' : template.livePreview.ribbon ?? '')
    : undefined
  // Stacked top left: the personalization ribbon, then the product's own badges
  // The personalization badge takes the product badge's place (the sale is
  // already shown by the price); without it, the product's own badges show
  const previewRibbons = template ? (previewRibbon ? [previewRibbon] : template.gallery.badges ?? []) : undefined
  // The personalization badge carries the brand's wand
  const ribbonIcon = template
    ? {
        on: template.livePreview.ribbon ?? '',
        icon: <icons.AiMagicIcon size={20} />,
        // On sale, the product's badges ("15% off") are drawn in the sale color
        sale: template.sale ? template.gallery.badges : undefined,
      }
    : undefined

  // Hero + grid (photo first): the product's own photo leads until the
  // shopper types; then the live preview is pushed in above it as the hero.
  // The other layouts follow the template (sample name from page load).
  const photoFirst = desktopGallery === 'heroGridPhotoFirst'
  const heroPreview = photoFirst ? (previewPersonalized ? livePreview : null) : slotPreview
  const heroImages = photoFirst ? images : galleryImages
  // On the preview: its ribbon stack. On the photo: the product's badges only.
  const heroRibbons = heroPreview ? previewRibbons : template?.gallery.badges

  const previewNote = template
    ? <LivePreviewNote disclaimer={template.livePreview.disclaimer} loading={livePreviewLoading} />
    : undefined

  // Companion products for the Nested Items section, shaped for the quick-add
  // panel (reuses the category-page adapter). The inline list shows one other
  // catalog item; the drawer shows the demo count of charms, each with its
  // whole gallery. A charm carries its metal in its name, so the drawer asks
  // only for its one choice; one with no choice has no options and adds on tap.
  const nestedItems: QuickAddProduct[] = nestedDisplay === 'drawer'
    ? nestedCharms
        .slice(0, nestedDrawerCount)
        .map((charm) => ({
          ...toQuickAddProduct(charm),
          images: charm.gallery.map((src) => ({ src, alt: charm.name })),
          engraving: 'fields' as const,
          options: charm.option ? [charm.option] : [],
        }))
    : getBrandProducts(brand)
        .filter((p) => p.id !== product.id)
        .slice(0, 1)
        .map(toQuickAddProduct)

  const handleAddToBag = (
    swatchKey: MaterialSwatch['key'],
    engravedText: string,
    chainLength: string,
    nestedCartItems: CartItem[] = []
  ) => {
    const swatch = materialSwatchesFor(product).find((s) => s.key === swatchKey)!
    const price = (product.priceInCents ?? 0) + swatch.priceOffset
    const selectedOptions = [
      { label: materialLabel(brand), value: swatch.label },
      { label: 'Chain Length', value: chainLength },
      ...(engravedText.trim() ? [{ label: 'Engraving', value: engravedText.trim() }] : []),
    ]
    addItem({
      id: `${product.id}-${swatchKey}-${Date.now()}`,
      name: titleForMetal(product.name, swatchKey),
      price,
      originalPrice: undefined,
      image: product.image,
      isPersonalized: engravedText.trim().length > 0,
      rating: product.rating,
      reviewCount: product.reviewCount,
      selectedOptions,
    })
    // Add any staged nested items alongside the main product.
    nestedCartItems.forEach((item) => addItem(item))
    openCart(true)
  }

  // Config-driven options: the price already includes every option and add-on
  const handleAddConfigured = (
    price: number,
    selectedOptions: SelectedOption[],
    isPersonalized: boolean,
    nestedCartItems: CartItem[] = [],
  ) => {
    addItem({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      price,
      originalPrice: undefined,
      image: product.image,
      isPersonalized,
      rating: product.rating,
      reviewCount: product.reviewCount,
      selectedOptions,
    })
    nestedCartItems.forEach((item) => addItem(item))
    openCart(true)
  }

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content">
        <RibbonIconContext.Provider value={ribbonIcon}>
        {brand === 'lal' && !isOptionsShowcase && AI_PREVIEW_PRODUCT_IDS.has(product.id) ? (
          /* Pop Your Memories — AI-preview customizer owns its own preview + layout */
          <AIPreviewCustomizer
            brand={brand}
            product={product}
            icons={icons}
            nestedItems={nestedItems}
            addItem={addItem}
            openCart={openCart}
          />
        ) : (
        <>
        {/* V2: breadcrumbs, title, price and reviews above the gallery (mobile) */}
        {headerAbove && <div ref={setHeaderSlot} className={styles.headerAbove} />}

        {/* Mobile gallery — hidden on desktop */}
        {/* Template PDPs: the pagination bar floats over the image */}
        <div ref={mobileGalleryRef} className={`${styles.mobileGalleryAnchor} ${stickyGallery ? styles.mobileGallerySticky : ''}`}>
          <MobileGallery
            images={galleryImages}
            modelImages={modelImages}
            livePreview={slotPreview}
            // The personalization badge only on the preview — on the photo, the product's own badges
            ribbons={slotPreview ? previewRibbons : template?.gallery.badges}
            previewNote={previewNote}
            floatingProgress={!!template}
          />
        </div>

        {/* Two-column layout on desktop, single column on mobile */}
        <div className={`${styles.layout} ${!template && desktopGallery !== 'heroGridPhotoFirst' ? '' : desktopGallery === 'slider' ? styles.layoutSlider : styles.layoutLivePreview} ${(template || desktopGallery === 'heroGridPhotoFirst') && (desktopGallery === 'heroGrid' || desktopGallery === 'heroGridPhotoFirst' || desktopGallery === 'overlayThumbs') ? styles.layoutCenteredForm : ''} ${desktopGallery === 'overlayThumbs' ? styles.layoutOverlay : ''}`}>
          {/* Left: gallery — sideScroll (LAL): thumbnails left; heroGrid (template PDPs): one full-width image, then two across; stickyHero (OAL): sticky+scroll; grid/default (TGR, others): 2×2 */}
          {desktopGallery === 'sideScroll'
            ? <LALDesktopGallery images={galleryImages} modelImages={modelImages} name={product.name} livePreview={slotPreview} rootRef={galleryRef} ribbons={template ? previewRibbons : undefined} previewNote={template ? previewNote : undefined} />
            : desktopGallery === 'slider'
              ? <SliderGallery images={galleryImages} modelImages={modelImages} name={product.name} rootRef={galleryRef} livePreview={slotPreview} ribbons={previewRibbons} ribbonIcon={ribbonIcon} previewNote={previewNote} skipTo="buy-box" icons={icons} />
            : desktopGallery === 'overlayThumbs'
              ? <OverlayThumbsGallery images={galleryImages} modelImages={modelImages} name={product.name} rootRef={galleryRef} livePreview={slotPreview} ribbons={previewRibbons} previewNote={previewNote} />
            : desktopGallery === 'heroGrid' || desktopGallery === 'heroGridPhotoFirst'
              ? <HeroGridGallery images={heroImages} modelImages={modelImages} name={product.name} rootRef={galleryRef} livePreview={heroPreview} ribbons={heroRibbons} previewNote={previewNote} />
            : desktopGallery === 'stickyHero'
              ? <OALDesktopGallery images={galleryImages} modelImages={modelImages} name={product.name} rootRef={galleryRef} />
              : <DesktopGallery images={galleryImages} modelImages={modelImages} name={product.name} rootRef={galleryRef} livePreview={template ? slotPreview : undefined} ribbons={previewRibbons} previewNote={previewNote} />
          }

          {/* Right / main: product form — LAL music memories / canvas customizer, else jewelry form */}
          {isOptionsShowcase ? (
            <ProductForm
              brand={brand}
              product={product}
              icons={icons}
              nestedItems={nestedItems}
              onAddToBag={handleAddToBag}
              optionGroups={OPTION_GROUPS}
              onAddConfigured={handleAddConfigured}
            />
          ) : template ? (
            <TemplateCustomizer
              // A different engine is a different demo: start the form over
              // A different version is a fresh demo: nothing saved carries over (the
              // nested item on/off only shows or hides the offer, keeping the rest)
              key={`${template.id}-${template.livePreview.engine.kind}-${placement ?? 'default'}-${customizerRun}`}
              brand={brand}
              template={template}
              product={product}
              icons={icons}
              addItem={addItem}
              openCart={openCart}
              onLivePreviewChange={setLivePreview}
              onLivePreviewLoadingChange={setLivePreviewLoading}
              onPersonalizedChange={setPreviewPersonalized}
              placement={placement}
              headerSlot={headerAbove ? headerSlot : null}
              onAddedChange={setAddedToBag}
              nestedOffer={nestedOn}
              materialImageOnly={readMaterialDisplay(searchParams, brand) === 'image'}
              onPersonalizeAnother={personalizeAnother}
              fillEmptyFromSample={finalPreview}
              regularPrice={finalPreview}
              previewOnFirstPick={finalPreview}
              belowCta={<UspBadges brand={brand} icons={icons} />}
            />
          ) : brand === 'lal' && MUSIC_MEMORIES_PRODUCT_IDS.has(product.id) ? (
            <MusicMemoriesCustomizer
              // Final live preview, info above the gallery: its header goes in the slot
              headerSlot={finalPreview && headerAbove ? headerSlot : null}
              brand={brand}
              product={product}
              icons={icons}
              nestedItems={nestedItems}
              addItem={addItem}
              openCart={openCart}
              onLivePreviewChange={setLivePreview}
            />
          ) : brand === 'lal' ? (
            <LalCanvasCustomizer
              // A new charm count is a new demo: start the form and its picks over
              key={nestedDisplay === 'drawer' ? nestedDrawerCount : undefined}
              brand={brand}
              product={product}
              icons={icons}
              items={items}
              previewId={previewId}
              nestedItems={nestedItems}
              nestedDisplay={nestedDisplay}
              nestedDescription={nestedDescription}
              addItem={addItem}
              openCart={openCart}
              onLivePreviewChange={setLivePreview}
            />
          ) : (
            <ProductForm
              // A new charm count is a new demo: start the form and its picks over
              key={nestedDisplay === 'drawer' ? nestedDrawerCount : undefined}
              brand={brand}
              product={product}
              icons={icons}
              nestedItems={nestedItems}
              nestedDisplay={nestedDisplay}
              nestedDescription={nestedDescription}
              onAddToBag={handleAddToBag}
              flow={personalizeFlowFor(brand, product.id)}
              galleryRef={galleryRef}
            />
          )}
        </div>
        </>
        )}

        <ProductCarousel
          brand={brand}
          title="Best Sellers"
          ArrowIcon={icons.ArrowIcon}
          lead={template?.bestSellersLead}
          // The final live preview keeps its products inside it
          hrefFor={finalPreview ? (p) => `/${brand}/product/livepreviewfinal/${p.id}` : undefined}
        />
        <ReviewsSection
          ChevronIcon={icons.ChevronIcon}
          StarIcon={icons.StarIcon}
          XIcon={icons.XIcon}
          CheckmarkIcon={icons.CheckmarkIcon}
          CameraIcon={icons.CameraIcon}
          ArrowIcon={icons.ArrowIcon}
          productId={product.id}
          productRating={product.rating ?? 0}
          productReviewCount={product.reviewCount ?? 0}
        />
        </RibbonIconContext.Provider>
      </main>

      <Footer columns={footerColumns} />
      <FloatingCart
        isOpen={isOpen}
        onClose={closeCart}
        items={items}
        subtotal={subtotal}
        onRemoveItem={removeItem}
        onEditItem={() => {}}
        onContinueToCheckout={() => router.push(`/${brand}/checkout`)}
        onGenerateGiftNote={async () => 'Wishing you a wonderful day filled with joy!'}
      />
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ProductDetailPageClient(props: ProductDetailPageProps) {
  return <ProductDetailPageInner {...props} />
}
