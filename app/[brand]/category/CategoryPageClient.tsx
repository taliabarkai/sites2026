'use client'

import { usePathname } from 'next/navigation'
import { Footer } from '../_components/Footer'
import { Header } from '../_components/Header'
import { FloatingCart } from '../_components/FloatingCart'
import { CartProvider, useCart } from '../_context/CartContext'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_NAV_LINKS,
  DEFAULT_TOPLINE,
} from '../_config/siteContent'
import styles from './CategoryPage.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeoCategoryItem {
  label: string
  imageUrl?: string
}

interface ProductItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  imageUrl?: string
  swatches: string[]
  ribbonText?: string
}

interface FaqItem {
  question: string
  answer: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SEO_CATEGORIES: SeoCategoryItem[] = [
  { label: 'Pendants' },
  { label: 'Chains' },
  { label: 'Chokers' },
  { label: 'Layering' },
  { label: 'Initial' },
  { label: 'Birthstone' },
]

const PRODUCTS: ProductItem[] = [
  {
    id: '1',
    name: 'Belle Custom Name Necklace - Gold Vermeil',
    price: 125,
    originalPrice: 135,
    swatches: ['#cbcbcb', '#f2e6a1', '#e7e7e7', '#f5ccb9'],
    ribbonText: '20% off',
    imageUrl: 'https://www.figma.com/api/mcp/asset/7feaa718-befe-4b5c-9ccf-4a61bb92a9ad',
  },
  {
    id: '2',
    name: 'Constellation Circle Pendant - Silver',
    price: 89,
    swatches: ['#cbcbcb', '#f2e6a1'],
  },
  {
    id: '3',
    name: 'Luna Arc Choker - Gold Vermeil',
    price: 145,
    originalPrice: 165,
    swatches: ['#f2e6a1', '#e7e7e7', '#cbcbcb'],
    ribbonText: '12% off',
  },
  {
    id: '4',
    name: 'Iris Layering Chain Set - Rose Gold',
    price: 210,
    swatches: ['#f5ccb9', '#f2e6a1', '#cbcbcb'],
  },
  {
    id: '5',
    name: 'Celestial Initial Pendant Necklace',
    price: 175,
    originalPrice: 195,
    swatches: ['#f2e6a1', '#cbcbcb', '#e7e7e7', '#f5ccb9'],
    ribbonText: '10% off',
    imageUrl: 'https://www.figma.com/api/mcp/asset/7feaa718-befe-4b5c-9ccf-4a61bb92a9ad',
  },
  {
    id: '6',
    name: 'Soleil Birthstone Drop Necklace',
    price: 165,
    swatches: ['#cbcbcb', '#f2e6a1'],
  },
  {
    id: '7',
    name: 'Arc Minimalist Bar Necklace - Gold',
    price: 95,
    swatches: ['#f2e6a1', '#cbcbcb'],
  },
  {
    id: '8',
    name: 'Nova Pavé Heart Pendant',
    price: 120,
    originalPrice: 140,
    swatches: ['#f2e6a1', '#e7e7e7', '#f5ccb9'],
    ribbonText: '15% off',
  },
  {
    id: '9',
    name: 'Zodiac Circle Chain Necklace',
    price: 110,
    swatches: ['#cbcbcb', '#f2e6a1', '#e7e7e7'],
  },
  {
    id: '10',
    name: 'Name Script Layered Necklace Set',
    price: 245,
    originalPrice: 275,
    swatches: ['#f2e6a1', '#cbcbcb', '#f5ccb9'],
    ribbonText: '11% off',
  },
]

const FAQS: FaqItem[] = [
  {
    question: 'WHY IS A CHARM BRACELET IMPORTANT?',
    answer:
      "Charm bracelet is important because it's special and meaningful. At Oak and Luna, the charms that adorn our charm bracelet or charm bangle aren't just placed randomly. There's always a heartwarming context behind each of them. The customized charms make an ordinary bracelet extraordinarily unique. It's this personalized approach that makes a charm bracelet an important piece in any accessory collection. It's designed to be cherished for years.",
  },
  {
    question: 'CAN YOU CUSTOMIZE CHARMS?',
    answer:
      "Yes! In fact, that's the unique charm of charms. There are different ways to customize them, depending on what the charms are and how much space they offer for personalization. They may feature initials, monograms, names, special dates, zodiac signs, and even inspirational words.",
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SeoCategoryBubble({ item }: { item: SeoCategoryItem }) {
  return (
    <div className={styles.seoBubbleItem}>
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.label} className={styles.seoBubbleImage} />
      ) : (
        <div className={styles.seoBubbleImage} role="img" aria-label={item.label} />
      )}
      <span className={styles.seoBubbleLabel}>{item.label}</span>
    </div>
  )
}

function CategoryBanner() {
  return (
    <section className={styles.categoryBanner} aria-label="Category hero">
      <div className={styles.bannerContent}>
        <h1 className={styles.categoryTitle}>
          Necklaces
          <br />
          For Women
        </h1>
        <p className={styles.categoryDescription}>
          Capture your unique personality effortlessly with pendants for women, as your
          jewelry should be just as unique as you are.
        </p>
      </div>

      <div className={styles.seoBubbles} aria-label="Browse by style">
        {SEO_CATEGORIES.map((item) => (
          <SeoCategoryBubble key={item.label} item={item} />
        ))}
      </div>
    </section>
  )
}

function FilterBar({ itemCount = 100 }: { itemCount?: number }) {
  return (
    <div className={styles.filterBar}>
      <button className={styles.filterButton} aria-label="Filter and sort products">
        <svg
          className={styles.filterIcon}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <line x1="2" y1="5" x2="18" y2="5" />
          <line x1="2" y1="10" x2="18" y2="10" />
          <line x1="2" y1="15" x2="18" y2="15" />
          <circle cx="6" cy="5" r="2" fill="currentColor" stroke="none" />
          <circle cx="13" cy="10" r="2" fill="currentColor" stroke="none" />
          <circle cx="7" cy="15" r="2" fill="currentColor" stroke="none" />
        </svg>
        Filter / Sort
      </button>
      <span className={styles.itemCount}>{itemCount} items</span>
    </div>
  )
}

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <article className={styles.productCard}>
      <div className={styles.productCardImageWrap}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className={styles.productCardImageInner} />
        ) : (
          <div className={styles.productCardImageInner} role="img" aria-label={product.name} />
        )}
      </div>

      {product.ribbonText && (
        <div className={styles.ribbon} aria-label={product.ribbonText}>
          <svg className={styles.ribbonIcon} viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
            <path d="M5 0L6.12 3.45H9.76L6.82 5.59L7.94 9.04L5 6.9L2.06 9.04L3.18 5.59L0.24 3.45H3.88L5 0Z" />
          </svg>
          {product.ribbonText}
        </div>
      )}

      <div className={styles.productCardInfo}>
        <div className={styles.productCardSwatches} aria-label="Available colours">
          {product.swatches.slice(0, 5).map((color, i) => (
            <span
              key={i}
              className={styles.swatch}
              style={{ backgroundColor: color }}
              aria-label={`Colour option ${i + 1}`}
            />
          ))}
          {product.swatches.length > 5 && <span className={styles.swatchMore}>+</span>}
        </div>

        <p className={styles.productCardName}>{product.name}</p>

        <div className={styles.productCardPrices}>
          {product.originalPrice && (
            <span className={styles.productCardPriceOriginal}>${product.originalPrice}</span>
          )}
          <span className={styles.productCardPrice}>${product.price}</span>
        </div>
      </div>
    </article>
  )
}

function ProductsGrid({ products }: { products: ProductItem[] }) {
  return (
    <div className={styles.productsSection}>
      <div className={styles.productsGrid}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}

function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section className={styles.faqSection} aria-label="Frequently asked questions">
      <div className={styles.faqInner}>
        {faqs.map((faq) => (
          <div key={faq.question} className={styles.faqItem}>
            <h2 className={styles.faqQuestion}>{faq.question}</h2>
            <p className={styles.faqAnswer}>{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
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
    helpHref: withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
  }

  const { items, isOpen, subtotal, closeCart, removeItem } = useCart()

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />
      <main id="main-content">
        <CategoryBanner />
        <FilterBar itemCount={100} />
        <ProductsGrid products={PRODUCTS} />
        <FaqSection faqs={FAQS} />
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

export default function CategoryPage() {
  return (
    <CartProvider>
      <CategoryPageInner />
    </CartProvider>
  )
}
