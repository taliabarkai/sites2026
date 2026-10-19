'use client'

import { useId, useRef } from 'react'
import type { BrandKey } from '../../_config/brands'
import { DEFAULT_PRODUCT_SWATCHES } from '../../_config/products'
import { getBrandProducts } from '../../../../data/products/getBrandProducts'
import { ProductCard, toQuickAddProduct } from '../ProductCard'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './BestSellersCarousel.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

export interface BestSellersCarouselProps {
  brand: BrandKey
  title?: string
  /**
   * Secondary placement (e.g. the feedback success page): h4-size title,
   * content capped at 1440px, and from 768px four cards with the page margin
   * on both sides instead of bleeding off the right edge.
   */
  compact?: boolean
  className?: string
}

/**
 * The homepage Best Sellers row: the brand's first 8 products as cards in a
 * horizontal scroll-snap track (2.25 up on mobile, 4 up from 768px with
 * hover arrows). Full-bleed — place it outside narrow page containers.
 * `compact` gives a smaller, contained version for pages other than home.
 */
export function BestSellersCarousel({ brand, title = 'Best Sellers', compact = false, className }: BestSellersCarouselProps) {
  const titleId = useId()
  const bestSellers = getBrandProducts(brand).slice(0, 8)
  const { ArrowIcon } = BRAND_ICONS[brand]
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = (dir: 'prev' | 'next') => {
    if (!carouselRef.current) return
    const card = carouselRef.current.firstElementChild as HTMLElement
    const amount = card ? card.offsetWidth + 4 : 320
    carouselRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <section
      className={[styles.bestSellers, compact && styles.compact, className].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
    >
      <div className={styles.bestSellersHeader}>
        <h2 id={titleId} className={styles.bestSellersTitle}>{title}</h2>
      </div>
      <div className={styles.carouselWrapper}>
        <div className={styles.carouselTrack} ref={carouselRef}>
          {bestSellers.map(p => (
            <div key={p.id} className={styles.carouselCard}>
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
          className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
          onClick={() => scrollCarousel('prev')}
          aria-label="Previous products"
        >
          <ArrowIcon size={24} color="white" />
        </button>
        <button
          className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
          onClick={() => scrollCarousel('next')}
          aria-label="Next products"
        >
          <ArrowIcon size={24} color="white" />
        </button>
      </div>
    </section>
  )
}
