'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { CartProvider, useCart } from '../_context/CartContext'
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
import styles from './CategoryPage.module.css'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Product {
  id: number
  name: string
  price: string
  originalPrice?: string
  defaultImage: string
  hoverImage: string
}

const products: Product[] = [
  { id: 1,  name: 'Lock & Luna Charm with Round Cut Moissanite — Gold', price: '$105', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-6.jpg',  hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-round-cut-moissanite-gold-vermeil-4.jpg' },
  { id: 2,  name: 'Engraved Compass Necklace with Diamond — Gold Vermeil', price: '$150', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/engraved-comprass-necklace-gold-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/engraved-comprass-necklace-gold-vermeil-3.jpg' },
  { id: 3,  name: 'Willow Tag Initial Necklace with Diamond — Gold Vermeil', price: '$120', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-10.jpg' },
  { id: 4,  name: 'Herringbone Engraved Slim Chain Necklace — Gold Vermeil', price: '$95',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/herringbone-thin-chain-necklace-gold-vermeil-4.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/herringbone-thin-chain-necklace-gold-vermeil-2.jpg' },
  { id: 5,  name: 'Singapore Chain Name Necklace — Gold Vermeil', price: '$110', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-9.jpg' },
  { id: 6,  name: 'Inez Initial Heart Necklace with Diamond — Gold Vermeil', price: '$130', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/red-heart-inez-initial-necklace-with-diamond-gold-vermeil-2.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/red-heart-inez-initial-necklace-with-diamond-gold-vermeil-5.jpg' },
  { id: 7,  name: 'Initial Lock Necklace — Gold Plated', price: '$85',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/initial-lock-necklace-in-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/initial-lock-necklace-in-vermeil-3.jpg' },
  { id: 8,  name: 'Heart Charm Lock Necklace — Gold Plated', price: '$90',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/heart-charm-padlock-necklace-gold-vermeil-16.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/heart-charm-padlock-necklace-gold-vermeil-10.jpg' },
  { id: 9,  name: 'Inez Initial Necklace with Diamonds — Gold Vermeil', price: '$145', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-12.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-9.jpg' },
  { id: 10, name: 'Pillar Bar Necklace — Gold Plated', price: '$80',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/pillar-bar-necklace-18k-gold-vermeil-16.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/pillar-bar-necklace-18k-gold-vermeil-24.jpg' },
  { id: 11, name: 'Engraved Dot Bracelet — Silver', price: '$75',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/engraved-dot-bracelet-silver-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/engraved-dot-bracelet-silver-6.jpg' },
  { id: 12, name: 'Lock & Luna Charm with Emerald Cut Moissanite — Silver', price: '$115', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-emerald-cut-moissanite-silver-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/lock-luna-charm-with-emerald-cut-moissanite-silver-4.jpg' },
  { id: 13, name: 'Belle Custom Name Necklace — Gold Plated', price: '$100', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/belle-custom-name-necklace-gold-vermeil-33.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/belle-custom-name-necklace-gold-vermeil-35.jpg' },
  { id: 14, name: 'Singapore Chain Name Necklace with Heart Shaped Gemstone — Gold Vermeil', price: '$135', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-with-pink-heart-mosinight-gold-vermeil-13.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-with-pink-heart-mosinight-gold-vermeil-15.jpg' },
  { id: 15, name: 'Ivy Name Paperclip Chain Bracelet — Gold Plated', price: '$88',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/ivy-name-link-chain-bracelet-gold-plating-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/ivy-name-link-chain-bracelet-gold-plating-11.jpg' },
  { id: 16, name: 'Multiple Name Necklace — Gold Vermeil', price: '$125', defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/multiple-name-necklace-vermeil-gold-plated-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/products/multiple-name-necklace-vermeil-gold-plated-3.jpg' },
  { id: 17, name: 'Mon Petit Name Necklace — Gold Plated', price: '$92',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/mon-petit-name-necklace-vermeil-gold-plated-14.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/mon-petit-name-necklace-gold-plated-1.jpg' },
  { id: 18, name: 'Bubble Up Initial Necklace — Gold Plated', price: '$78',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/bubble-up-initial-necklace-gold-vermeil-6.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/bubble-up-initial-necklace-gold-vermeil-4.jpg' },
  { id: 19, name: 'Petite Paperclip Necklace with Moissanite — Gold Plated', price: '$98',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/petite-paperclip-necklace-with-diamond-gold-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/petite-paperclip-necklace-with-diamond-gold-vermeil-5.jpg' },
  { id: 20, name: 'Puffy Heart Pendant — Gold Plated', price: '$72',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/puffy-heart-pendant-gold-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/puffy-heart-pendant-gold-2.jpg' },
  { id: 21, name: 'Willow Disc Initial Necklace — Gold Vermeil', price: '$108', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-disc-initial-necklace-gold-vermeil-9.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/willow-disc-initial-necklace-gold-vermeil-13.jpg' },
  { id: 22, name: 'Ivy Name Paperclip Chain Necklace with Sparkling Stones — Gold Plated', price: '$118', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/ivy-name-link-chain-necklace-gold-plated-with-birthstones-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/ivy-name-link-chain-necklace-gold-plated-with-birthstones-3.jpg' },
  { id: 23, name: 'The Charmer Coins & Initials Necklace — Gold Plated', price: '$140', defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/the-charmer-coins-initials-necklace-gold-vermeil-1.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/the-charmer-coins-initials-necklace-gold-vermeil-3.jpg' },
  { id: 24, name: 'My Signature Initial — Gold', price: '$95',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/my-signature-initial-gold-vermeil-10.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/my-signature-initial-gold-vermeil-4.jpg' },
  { id: 25, name: 'Initial Necklace — Gold Plated', price: '$82',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/product/initial-necklace-gold-vermeil-8.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/initial-necklace-gold-vermeil-14.jpg' },
  { id: 26, name: 'Inez Initial Necklace — Gold Plated', price: '$79',  defaultImage: 'https://cdn.oakandluna.com/digital-asset/products/inez-initial-necklace-gold-plated-2.jpg', hoverImage: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-plated-1.jpg' },
]

const MATERIAL_FILTERS = [
  { key: 'silver',  label: 'Silver',       swatchVar: 'var(--sterling-silver-925)' },
  { key: 'vermeil', label: 'Gold Vermeil', swatchVar: 'var(--gold-vermeil-18k)' },
  { key: 'solid',   label: 'Solid Gold',   swatchVar: 'var(--solid-gold-14k)' },
  { key: 'white',   label: 'White Gold',   swatchVar: 'var(--white-gold-14k)' },
] as const

type MaterialKey = (typeof MATERIAL_FILTERS)[number]['key']

// Default material swatch set rendered under each product card image.
// Order matches the design reference: silver, vermeil, solid gold, rose gold.
const DEFAULT_PRODUCT_SWATCHES = [
  'var(--sterling-silver-925)',
  'var(--gold-vermeil-18k)',
  'var(--solid-gold-14k)',
  'var(--rose-gold-plating-18k)',
]

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

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content">
        <CategoryHero />

        <FilterBar
          activeMaterials={activeMaterials}
          onToggle={toggleMaterial}
          itemCount={products.length}
        />

        <section className={styles.productsSection} aria-label="Products">
          <div className={styles.productsGrid}>
            {products.map((p) => (
              <ProductCard
                key={p.id}
                name={p.name}
                price={p.price}
                originalPrice={p.originalPrice}
                defaultImage={p.defaultImage}
                hoverImage={p.hoverImage}
                // swatches={DEFAULT_PRODUCT_SWATCHES}
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
        onContinueToCheckout={() => {}}
        onGenerateGiftNote={async () => 'Wishing you a wonderful day filled with joy!'}
      />
    </div>
  )
}

export default function CategoryPageClient() {
  return (
    <CartProvider>
      <CategoryPageInner />
    </CartProvider>
  )
}
