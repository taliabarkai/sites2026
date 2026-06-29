'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { notFound, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { useCart } from '../_context/CartContext'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { FloatingCart } from '../_components/FloatingCart'
import { Button } from '../_components/Button'
import { FilterChips } from '../_components/FilterChips'
import { ProductCard, toQuickAddProduct } from '../_components/ProductCard'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import {
  DEFAULT_PRODUCT_SWATCHES,
  MATERIAL_SWATCHES,
  CHAIN_LENGTHS,
  DEFAULT_CHAIN_LENGTH,
  MAX_ENGRAVE_CHARS,
} from '../_config/products'
import type { MaterialSwatch } from '../_config/products'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import type { ProductItem } from '../../../data/products'
import { LalCanvasCustomizer } from './LalCanvasCustomizer'
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
}: {
  brand: string
  title: string
  ArrowIcon: React.ComponentType<{ size?: number; color?: string }>
}) {
  const products = getBrandProducts(brand).slice(0, 8)
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
                href={`/${brand}${p.href}`}
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

const REVIEWS_DATA = {
  rating: 4.8,
  total: 65,
  breakdown: [
    { label: '5 Stars', value: '5', count: 246, pct: 75, reviewCount: 34 },
    { label: '4 Stars', value: '4', count: 128, pct: 40, reviewCount: 17 },
    { label: '3 Stars', value: '3', count: 65,  pct: 20, reviewCount:  9 },
    { label: '2 Stars', value: '2', count: 37,  pct: 12, reviewCount:  5 },
    { label: '1 Star',  value: '1', count: 2,   pct: 1,  reviewCount:  1 },
  ],
  items: [
    { initials: 'A', name: 'Alexandra S.',  location: 'Texas, United States',      dateLabel: 'May 2025', dateMs: 1746057600000, rating: 5, body: 'Absolutely stunning — the quality exceeded my expectations. Arrived beautifully packaged and looks exactly as pictured.' },
    { initials: 'M', name: 'Maria T.',      location: 'London, United Kingdom',    dateLabel: 'Apr 2025', dateMs: 1743379200000, rating: 4, body: 'Really happy with this purchase. The craftsmanship is excellent and it feels very premium. Would definitely order again.' },
    { initials: 'J', name: 'Jessica R.',    location: 'Sydney, Australia',         dateLabel: 'Mar 2025', dateMs: 1740787200000, rating: 5, body: 'Great gift for my sister — she loved the personal touch. Delivery was fast and the packaging was lovely.' },
    { initials: 'S', name: 'Sofia K.',      location: 'Berlin, Germany',           dateLabel: 'Feb 2025', dateMs: 1738368000000, rating: 4, body: 'Beautiful piece. The engraving is crisp and the metal feels solid. Very pleased with the result.' },
    { initials: 'L', name: 'Laura B.',      location: 'Paris, France',             dateLabel: 'Jan 2025', dateMs: 1735689600000, rating: 3, body: 'Nice product overall but shipping took longer than expected. The quality is good once it arrived.' },
    { initials: 'R', name: 'Rachel M.',     location: 'New York, United States',   dateLabel: 'Dec 2024', dateMs: 1733011200000, rating: 5, body: 'Perfect in every way. The engraving looks gorgeous and the metal quality is excellent. Highly recommend.' },
    { initials: 'D', name: 'Diana P.',      location: 'Toronto, Canada',           dateLabel: 'Nov 2024', dateMs: 1730419200000, rating: 2, body: 'The item itself is fine but the clasp feels a bit flimsy. Customer service was helpful though.' },
    { initials: 'K', name: 'Karen W.',      location: 'Amsterdam, Netherlands',    dateLabel: 'Oct 2024', dateMs: 1727740800000, rating: 5, body: 'Incredibly well made. I have been wearing it every day and it still looks brand new. Amazing quality.' },
    { initials: 'N', name: 'Natalie F.',    location: 'Melbourne, Australia',      dateLabel: 'Sep 2024', dateMs: 1725148800000, rating: 1, body: 'Unfortunately the sizing was not right for me and the return process was quite difficult.' },
    { initials: 'C', name: 'Claire H.',     location: 'Dublin, Ireland',           dateLabel: 'Aug 2024', dateMs: 1722470400000, rating: 4, body: 'Really elegant design. Bought as an anniversary gift and my partner absolutely loved it.' },
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
}: {
  ChevronIcon: React.ComponentType<{ size?: number }>
  StarIcon: React.ComponentType<{ size?: number }>
  XIcon: React.ComponentType<{ size?: number }>
  CheckmarkIcon: React.ComponentType<{ size?: number }>
}) {
  const [ratingOpen, setRatingOpen] = useState(false)
  const [sortOpen, setSortOpen]     = useState(false)
  const [selectedRatings, setSelectedRatings] = useState<Set<string>>(new Set())
  const [selectedSort, setSelectedSort]       = useState('newest')

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
    ? REVIEWS_DATA.total
    : REVIEWS_DATA.breakdown
        .filter(b => selectedRatings.has(b.value))
        .reduce((sum, b) => sum + b.reviewCount, 0)

  const filteredReviews = REVIEWS_DATA.items
    .filter(r => selectedRatings.size === 0 || selectedRatings.has(String(r.rating)))
    .sort((a, b) => {
      if (selectedSort === 'oldest')  return a.dateMs - b.dateMs
      if (selectedSort === 'highest') return b.rating - a.rating
      if (selectedSort === 'lowest')  return a.rating - b.rating
      return b.dateMs - a.dateMs // newest (default)
    })

  return (
    <section id="reviews" className={styles.reviews} aria-label="Customer reviews">
      {/* Summary: score + bar breakdown */}
      <div className={styles.reviewsSummary}>
        {/* Score block */}
        <div className={styles.reviewsScoreBlock}>
          <h2 className={styles.reviewsTitle}>Reviews</h2>
          <p className={styles.reviewsScore}>{REVIEWS_DATA.rating}</p>
          <div className={styles.reviewsStars} aria-label={`${REVIEWS_DATA.rating} out of 5 stars`}>
            {[1,2,3,4,5].map(i => (
              <span
                key={i}
                className={i <= Math.round(REVIEWS_DATA.rating) ? styles.starFilled : styles.starEmpty}
              >
                <StarIcon size={32} />
              </span>
            ))}
          </div>
          <p className={styles.reviewsBasedOn}>Based on {REVIEWS_DATA.total} global reviews</p>
        </div>

        {/* Bar breakdown — clicking a row applies that rating filter */}
        <div className={styles.reviewsBars} aria-label="Rating breakdown">
          {REVIEWS_DATA.breakdown.map(row => (
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

      {/* Review cards */}
      <div className={styles.reviewsGrid}>
        {filteredReviews.map((review, i) => (
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

            <p className={styles.reviewCardBody}>{review.body}</p>
          </article>
        ))}
      </div>

      {/* Load more — hidden when filtered results fit on one page */}
      {filteredReviews.length >= 10 && (
        <div className={styles.reviewsLoadMore}>
          <Button variant="secondary">Load More Reviews</Button>
        </div>
      )}
    </section>
  )
}

// ─── Mobile swipeable gallery ─────────────────────────────────────────────────

function MobileGallery({ images, livePreview }: { images: string[]; livePreview?: string | null }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const allImages = livePreview ? [livePreview, ...images] : images

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIdx(idx)
  }, [])

  return (
    <div className={styles.mobileGallery}>
      <div ref={trackRef} className={styles.galleryTrack} onScroll={onScroll}>
        {allImages.map((src, i) => (
          <div key={i} className={styles.gallerySlide}>
            {livePreview && i === 0 && <span className={styles.livePreviewRibbon}>Live Preview</span>}
            <img
              src={src}
              alt=""
              className={styles.galleryImage}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
      {allImages.length > 1 && (
        <div className={styles.progressTrack} aria-hidden="true">
          <div
            className={styles.progressBar}
            style={{
              width: `${100 / allImages.length}%`,
              transform: `translateX(${activeIdx * 100}%)`,
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Desktop 2×2 static grid (non-OAL) ───────────────────────────────────────

function DesktopGallery({ images, name }: { images: string[]; name: string }) {
  const gridImages = [...images, ...images].slice(0, 4)
  return (
    <div className={styles.desktopGallery}>
      {gridImages.map((src, i) => (
        <div key={i} className={styles.desktopGridCell}>
          <img
            src={src}
            alt={i === 0 ? name : ''}
            className={styles.desktopGridImage}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}
    </div>
  )
}

// ─── OAL: sticky-left hero + vertical scroll right ────────────────────────────

function LALDesktopGallery({ images, name, livePreview }: { images: string[]; name: string; livePreview?: string | null }) {
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
    <div className={styles.lalGallery}>
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
            <img src={src} alt="" aria-hidden="true" className={styles.oalGalleryImage} loading="lazy" />
          </button>
        ))}
      </div>
      {/* Main image — right */}
      <div className={styles.lalMainCell}>
        {showRibbon && <span className={styles.livePreviewRibbon}>Live Preview</span>}
        <img src={allImages[activeIdx]} alt={name} className={styles.oalGalleryImage} loading="eager" />
      </div>
    </div>
  )
}

function OALDesktopGallery({ images, name }: { images: string[]; name: string }) {
  const scrollImages = [images[1], images[0], images[1]]
  return (
    <div className={styles.oalGallery}>
      <div className={styles.oalMainCell}>
        <img src={images[0]} alt={name} className={styles.oalGalleryImage} loading="eager" />
      </div>
      <div className={styles.oalScrollCol}>
        {scrollImages.map((src, i) => (
          <div key={i} className={styles.oalScrollCell}>
            <img
              src={src}
              alt=""
              className={styles.oalGalleryImage}
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
}: {
  ShippingIcon: React.ComponentType<{ size?: number }>
  ReturnIcon: React.ComponentType<{ size?: number }>
  WarrantyIcon: React.ComponentType<{ size?: number }>
  GiftIcon: React.ComponentType<{ size?: number }>
}) {
  const badges = [
    { Icon: GiftIcon,      text: 'Gift packaging available in bag' },
    { Icon: ShippingIcon,  text: 'Free shipping on all orders' },
    { Icon: ReturnIcon,    text: '60-day extended returns' },
    { Icon: WarrantyIcon,  text: '5 year warranty' },
  ]

  return (
    <ul className={styles.trustBadges} aria-label="Trust badges">
      {badges.map(({ Icon, text }) => (
        <li key={text} className={styles.trustItem}>
          <span className={styles.trustIcon} aria-hidden="true">
            <Icon size={24} />
          </span>
          <span className={styles.trustText}>{text}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── Product form panel ───────────────────────────────────────────────────────

interface ProductFormProps {
  brand: string
  product: ProductItem
  icons: (typeof BRAND_ICONS)[keyof typeof BRAND_ICONS]
  onAddToBag: (selectedSwatchKey: MaterialSwatch['key'], engravedText: string, chainLength: string) => void
}

function ProductForm({ brand, product, icons, onAddToBag }: ProductFormProps) {
  const [selectedSwatchKey, setSelectedSwatchKey] = useState<MaterialSwatch['key']>(
    product.defaultSwatchKey ?? 'vermeil'
  )
  const [engravedText, setEngravedText] = useState('')
  const [chainLength, setChainLength] = useState(DEFAULT_CHAIN_LENGTH)
  const { DropdownIcon, StarIcon, ShippingIcon, ReturnIcon, WarrantyIcon, GiftIcon, ChevronIcon } = icons

  const selectedSwatch = MATERIAL_SWATCHES.find((s) => s.key === selectedSwatchKey)!
  const currentPrice = (product.priceInCents ?? 0) + selectedSwatch.priceOffset
  return (
    <section className={styles.formPanel} aria-label="Product options">
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
          <h1 className={styles.productTitle}>{product.name}</h1>
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

      {/* Swatch selector */}
      <SwatchSelector
        swatches={MATERIAL_SWATCHES}
        basePrice={product.priceInCents ?? 0}
        selectedKey={selectedSwatchKey}
        onSelect={setSelectedSwatchKey}
      />

      {/* Engrave input */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="engrave-input">
          Engrave a name or message
        </label>
        <div className={styles.inputWrap}>
          <input
            id="engrave-input"
            type="text"
            value={engravedText}
            maxLength={MAX_ENGRAVE_CHARS}
            placeholder="e.g. Sofia"
            className={styles.textInput}
            onChange={(e) => setEngravedText(e.target.value)}
          />
        </div>
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

      {/* Subtotal */}
      <div className={styles.subtotalRow}>
        <span className={styles.subtotalLabel}>Subtotal</span>
        <span className={styles.subtotalValue}>{formatPrice(currentPrice)}</span>
      </div>

      {/* CTA */}
      <Button
        variant="add-to-cart"
        className={styles.addToBagBtn}
        onClick={() => onAddToBag(selectedSwatchKey, engravedText, chainLength)}
      >
        Add to Bag
      </Button>

      {/* Trust badges */}
      <TrustBadges
        ShippingIcon={ShippingIcon}
        ReturnIcon={ReturnIcon}
        WarrantyIcon={WarrantyIcon}
        GiftIcon={GiftIcon}
      />
    </section>
  )
}

// ─── Page inner ───────────────────────────────────────────────────────────────

function ProductDetailPageInner({ productId, previewId }: { productId: number; previewId?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const brand = getBrandFromPathname(pathname)
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
  }

  const product = getBrandProducts(brand).find((p) => p.id === productId)
  if (!product) notFound()

  const images = product.hoverImage
    ? [product.image, product.hoverImage]
    : [product.image]
  const { items, isOpen, subtotal, closeCart, removeItem, addItem, openCart } = useCart()
  const icons = BRAND_ICONS[brand]
  const [livePreview, setLivePreview] = useState<string | null>(null)

  const handleAddToBag = (
    swatchKey: MaterialSwatch['key'],
    engravedText: string,
    chainLength: string
  ) => {
    const swatch = MATERIAL_SWATCHES.find((s) => s.key === swatchKey)!
    const price = (product.priceInCents ?? 0) + swatch.priceOffset
    const selectedOptions = [
      { label: 'Material', value: swatch.label },
      { label: 'Chain Length', value: chainLength },
      ...(engravedText.trim() ? [{ label: 'Engraving', value: engravedText.trim() }] : []),
    ]
    addItem({
      id: `${product.id}-${swatchKey}-${Date.now()}`,
      name: product.name,
      price,
      originalPrice: undefined,
      image: product.image,
      isPersonalized: engravedText.trim().length > 0,
      selectedOptions,
    })
    openCart()
  }

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content">
        {/* Mobile gallery — hidden on desktop */}
        <MobileGallery images={images} livePreview={livePreview} />

        {/* Two-column layout on desktop, single column on mobile */}
        <div className={styles.layout}>
          {/* Left: gallery — LAL: thumbnails left; OAL/TGR: sticky+scroll; others: 2×2 grid */}
          {brand === 'lal'
            ? <LALDesktopGallery images={images} name={product.name} livePreview={livePreview} />
            : (brand === 'oal' || brand === 'tgr')
              ? <OALDesktopGallery images={images} name={product.name} />
              : <DesktopGallery images={images} name={product.name} />
          }

          {/* Right / main: product form — LAL canvas customizer, else jewelry form */}
          {brand === 'lal' ? (
            <LalCanvasCustomizer
              brand={brand}
              product={product}
              icons={icons}
              items={items}
              previewId={previewId}
              addItem={addItem}
              openCart={openCart}
              onLivePreviewChange={setLivePreview}
            />
          ) : (
            <ProductForm
              brand={brand}
              product={product}
              icons={icons}
              onAddToBag={handleAddToBag}
            />
          )}
        </div>

        <ProductCarousel brand={brand} title="Best Sellers" ArrowIcon={icons.ArrowIcon} />
        <ReviewsSection ChevronIcon={icons.ChevronIcon} StarIcon={icons.StarIcon} XIcon={icons.XIcon} CheckmarkIcon={icons.CheckmarkIcon} />
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

export default function ProductDetailPageClient({ productId, previewId }: { productId: number; previewId?: string }) {
  return <ProductDetailPageInner productId={productId} previewId={previewId} />
}
