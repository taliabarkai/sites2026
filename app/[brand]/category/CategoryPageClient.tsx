'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '../_context/CartContext'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { FloatingCart } from '../_components/FloatingCart'
import { ProductCard } from '../_components/ProductCard'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
} from '../_config/siteContent'
import { PRODUCTS, DEFAULT_PRODUCT_SWATCHES } from '../_config/products'
import styles from './CategoryPage.module.css'

// ─── Data ─────────────────────────────────────────────────────────────────────

const MATERIAL_FILTERS = [
  { key: 'silver',  label: 'Silver',       swatchVar: 'var(--sterling-silver-925)' },
  { key: 'vermeil', label: 'Gold Vermeil', swatchVar: 'var(--gold-vermeil-18k)' },
  { key: 'solid',   label: 'Solid Gold',   swatchVar: 'var(--solid-gold-14k)' },
  { key: 'white',   label: 'White Gold',   swatchVar: 'var(--white-gold-14k)' },
] as const

type MaterialKey = (typeof MATERIAL_FILTERS)[number]['key']

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryHero() {
  return (
    <section className={styles.hero} aria-label="Best Sellers">
      <p className={styles.heroTitle}>Best Sellers</p>
      <h1 className={styles.heroDescription}>Adored & Loved. Our most coveted pieces.</h1>
    </section>
  )
}

function FilterBar({
  activeMaterials,
  onToggle,
  itemCount,
}: {
  activeMaterials: Set<MaterialKey>
  onToggle: (key: MaterialKey) => void
  itemCount: number
}) {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterBarInner}>
        {/* <ul className={styles.materialPills} aria-label="Filter by material">
          {MATERIAL_FILTERS.map((m) => {
            const active = activeMaterials.has(m.key)
            return (
              <li key={m.key}>
                <button
                  type="button"
                  className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                  aria-pressed={active}
                  onClick={() => onToggle(m.key)}
                >
                  <span className={styles.pillSwatch} style={{ backgroundColor: m.swatchVar }} aria-hidden="true" />
                  <span className={styles.pillLabel}>{m.label}</span>
                </button>
              </li>
            )
          })}
        </ul> */}

        <div className={styles.filterRight}>
          <span className={styles.itemCount}>{itemCount} items</span>
          <button type="button" className={styles.filtersTrigger}>Filters</button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CategoryPageInner() {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)
  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
  }

  const [activeMaterials, setActiveMaterials] = useState<Set<MaterialKey>>(new Set())
  const toggleMaterial = (key: MaterialKey) => {
    setActiveMaterials((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const { items, isOpen, subtotal, closeCart, removeItem } = useCart()
  const router = useRouter()

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content">
        <CategoryHero />

        <FilterBar
          activeMaterials={activeMaterials}
          onToggle={toggleMaterial}
          itemCount={PRODUCTS.length}
        />

        <section className={styles.productsSection} aria-label="Products">
          <div className={styles.productsGrid}>
            {PRODUCTS.map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                price={p.price}
                originalPrice={p.originalPrice}
                defaultImage={p.defaultImage}
                hoverImage={p.hoverImage}
                href={`/${brand}/product/${p.id}`}
                swatches={brand !== 'lal' ? DEFAULT_PRODUCT_SWATCHES : undefined}
              />
            ))}
          </div>
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
    </div>
  )
}

export default function CategoryPageClient() {
  return <CategoryPageInner />
}
