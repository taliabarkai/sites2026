'use client'

import Link from 'next/link'
import { useId, useState } from 'react'
import type { BrandKey } from '../../_config/brands'
import { getCategoryTiles } from '../../_config/categoryTiles'
import styles from './MenuCategoryCarousel.module.css'

export interface MenuCategoryCarouselProps {
  brand: BrandKey
  title?: string
  /** Called when a tile is followed — the drawer closes itself with it. */
  onNavigate?: () => void
  className?: string
}

const SALE_BANNER = {
  label: 'Shop Sale',
  image: '/images/hero-desktop.jpg',
}

/**
 * Shop-by-category tiles as a swipeable scroll-snap row, for the mobile menu
 * drawer: a heading, then images with the category name over their lower left
 * corner, about 2.25 tiles in view. The row bleeds to the drawer's edges.
 *
 * Demo: clicking the heading swaps the row for a single landscape banner with
 * a Shop Sale label over its lower left corner in place of the heading;
 * clicking that label swaps back.
 */
export function MenuCategoryCarousel({ brand, title = 'Shop by Category', onNavigate, className }: MenuCategoryCarouselProps) {
  const titleId = useId()
  const tiles = getCategoryTiles(brand)
  const [showSale, setShowSale] = useState(false)

  return (
    <section className={className} aria-labelledby={titleId}>
      {showSale ? (
        <div className={styles.saleBannerWrap}>
          <Link href={`/${brand}/category/t5`} className={styles.saleBanner} onClick={onNavigate}>
            {/* The label over the image is the swap button, not part of this
                link (a button can't sit inside a link) — the alt names it. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SALE_BANNER.image} alt={SALE_BANNER.label} className={styles.image} loading="lazy" />
          </Link>
          <p className={`${styles.title} ${styles.saleLabel}`}>
            <button
              id={titleId}
              type="button"
              className={styles.titleButton}
              onClick={() => setShowSale(false)}
            >
              {SALE_BANNER.label}
            </button>
          </p>
        </div>
      ) : (
        <>
          <h2 id={titleId} className={styles.title}>
            <button
              type="button"
              className={styles.titleButton}
              onClick={() => setShowSale(true)}
            >
              {title}
            </button>
          </h2>
          <ul className={styles.track}>
            {tiles.map(tile => (
              <li key={tile.label} className={styles.slide}>
                <Link href={tile.href} className={styles.tile} onClick={onNavigate}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tile.image} alt="" className={styles.image} loading="lazy" />
                  <span className={styles.label}>{tile.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
