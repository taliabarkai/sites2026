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
 * a Shop Sale label below it in place of the heading; clicking that label
 * swaps back.
 */
export function MenuCategoryCarousel({ brand, title = 'Shop by Category', onNavigate, className }: MenuCategoryCarouselProps) {
  const titleId = useId()
  const tiles = getCategoryTiles(brand)
  const [showSale, setShowSale] = useState(false)

  return (
    <section className={className} aria-labelledby={titleId}>
      {showSale ? (
        <>
          <Link href={`/${brand}/category/t5`} className={styles.saleBanner} onClick={onNavigate}>
            {/* No label over the image — the one below names it. The alt
                still gives the link its accessible name. */}
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
        </>
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
