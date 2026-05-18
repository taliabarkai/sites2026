'use client'

/**
 * OAL — Oak and Luna
 * Category Page — Necklaces for Women
 *
 * Brand: Oak and Luna (oal)
 * Fonts: Bebas Neue (heading), Akatab / Helvetica Neue (body)
 * Primary: #393781 (deep blue)  |  Accent: #cd644c (terracotta)
 * Radius: 0 (sharp edges, OAL style)
 */

import { ThemeSwitcher } from '../_components/ThemeSwitcher'
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
  size: 'small' | 'large'
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
    size: 'small',
    imageUrl: 'https://www.figma.com/api/mcp/asset/7feaa718-befe-4b5c-9ccf-4a61bb92a9ad',
  },
  {
    id: '2',
    name: 'Constellation Circle Pendant - Silver',
    price: 89,
    swatches: ['#cbcbcb', '#f2e6a1'],
    size: 'small',
  },
  {
    id: '3',
    name: 'Luna Arc Choker - Gold Vermeil',
    price: 145,
    originalPrice: 165,
    swatches: ['#f2e6a1', '#e7e7e7', '#cbcbcb'],
    ribbonText: '12% off',
    size: 'small',
  },
  {
    id: '4',
    name: 'Iris Layering Chain Set - Rose Gold',
    price: 210,
    swatches: ['#f5ccb9', '#f2e6a1', '#cbcbcb'],
    size: 'small',
  },
  {
    id: '5',
    name: 'Celestial Initial Pendant Necklace',
    price: 175,
    originalPrice: 195,
    swatches: ['#f2e6a1', '#cbcbcb', '#e7e7e7', '#f5ccb9'],
    ribbonText: '10% off',
    size: 'large',
    imageUrl: 'https://www.figma.com/api/mcp/asset/7feaa718-befe-4b5c-9ccf-4a61bb92a9ad',
  },
  {
    id: '6',
    name: 'Soleil Birthstone Drop Necklace',
    price: 165,
    swatches: ['#cbcbcb', '#f2e6a1'],
    size: 'large',
  },
  {
    id: '7',
    name: 'Arc Minimalist Bar Necklace - Gold',
    price: 95,
    swatches: ['#f2e6a1', '#cbcbcb'],
    size: 'small',
  },
  {
    id: '8',
    name: 'Nova Pavé Heart Pendant',
    price: 120,
    originalPrice: 140,
    swatches: ['#f2e6a1', '#e7e7e7', '#f5ccb9'],
    ribbonText: '15% off',
    size: 'small',
  },
  {
    id: '9',
    name: 'Zodiac Circle Chain Necklace',
    price: 110,
    swatches: ['#cbcbcb', '#f2e6a1', '#e7e7e7'],
    size: 'small',
  },
  {
    id: '10',
    name: 'Name Script Layered Necklace Set',
    price: 245,
    originalPrice: 275,
    swatches: ['#f2e6a1', '#cbcbcb', '#f5ccb9'],
    ribbonText: '11% off',
    size: 'small',
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

function AnnouncementBar() {
  return (
    <div className={styles.announcementBar} role="banner">
      Free shipping on orders over $75 &nbsp;·&nbsp; Use code <strong>OAL20</strong> for 20% off
    </div>
  )
}

function Header() {
  return (
    <header className={styles.header}>
      {/* Mobile: hamburger */}
      <button className={styles.headerMenuBtn} aria-label="Open menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Logo */}
      <div className={styles.headerLogo}>
        <a href="/" className={styles.logoText}>OAK &amp; LUNA</a>
      </div>

      {/* Desktop nav */}
      <nav aria-label="Main navigation">
        <ul className={styles.headerNav}>
          <li><a href="#" className={styles.headerNavLink}>Necklaces</a></li>
          <li><a href="#" className={styles.headerNavLink}>Bracelets</a></li>
          <li><a href="#" className={styles.headerNavLink}>Rings</a></li>
          <li><a href="#" className={styles.headerNavLink}>Earrings</a></li>
          <li><a href="#" className={styles.headerNavLink}>Sets</a></li>
          <li><a href="#" className={styles.headerNavLink}>Gifts</a></li>
          <li><a href="#" className={styles.headerNavHighlight}>Sale</a></li>
        </ul>
      </nav>

      {/* Icons */}
      <div className={styles.headerIcons}>
        <ThemeSwitcher />
        {/* Search */}
        <button className={styles.headerIcon} aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        {/* Account */}
        <button className={styles.headerIcon} aria-label="Account">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        {/* Cart */}
        <button className={styles.headerIcon} aria-label="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </button>
      </div>
    </header>
  )
}

function SeoCategoryBubble({ item }: { item: SeoCategoryItem }) {
  return (
    <div className={styles.seoBubbleItem}>
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.label}
          className={styles.seoBubbleImage}
        />
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
        {/* Filter icon */}
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
  const isLarge = product.size === 'large'
  return (
    <article className={styles.productCard}>
      {/* Product image */}
      <div
        className={[
          styles.productCardImageWrap,
          isLarge ? styles.productCardImageLarge : '',
        ].join(' ')}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className={styles.productCardImageInner}
          />
        ) : (
          <div className={styles.productCardImageInner} role="img" aria-label={product.name} />
        )}
      </div>

      {/* Ribbon badge */}
      {product.ribbonText && (
        <div className={styles.ribbon} aria-label={product.ribbonText}>
          {/* Small star icon */}
          <svg className={styles.ribbonIcon} viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
            <path d="M5 0L6.12 3.45H9.76L6.82 5.59L7.94 9.04L5 6.9L2.06 9.04L3.18 5.59L0.24 3.45H3.88L5 0Z" />
          </svg>
          {product.ribbonText}
        </div>
      )}

      {/* Product info */}
      <div className={styles.productCardInfo}>
        {/* Swatches */}
        <div className={styles.productCardSwatches} aria-label="Available colours">
          {product.swatches.slice(0, 5).map((color, i) => (
            <span
              key={i}
              className={styles.swatch}
              style={{ backgroundColor: color }}
              aria-label={`Colour option ${i + 1}`}
            />
          ))}
          {product.swatches.length > 5 && (
            <span className={styles.swatchMore}>+</span>
          )}
        </div>

        {/* Name */}
        <p className={styles.productCardName}>{product.name}</p>

        {/* Price */}
        <div className={styles.productCardPrices}>
          {product.originalPrice && (
            <span className={styles.productCardPriceOriginal}>
              ${product.originalPrice}
            </span>
          )}
          <span className={styles.productCardPrice}>${product.price}</span>
        </div>
      </div>
    </article>
  )
}

/**
 * Desktop editorial grid pattern:
 *   Row A: [small] [small] | [LARGE]
 *          [small] [small] |
 *
 *   Row B: [LARGE]         | [small] [small]
 *                          | [small] [small]
 *
 * Mobile: flat 2-col grid, large cards go full-width.
 */
function ProductsGrid({ products }: { products: ProductItem[] }) {
  // Split products for the two row types
  // Row A: products[0..3] small, products[4] large
  // Row B: products[5] large, products[6..9] small
  const rowASmall = products.slice(0, 4)
  const rowALarge = products[4]
  const rowBLarge = products[5]
  const rowBSmall = products.slice(6, 10)

  return (
    <div className={styles.productsSection}>
      {/* ── Row A: [2×2 small] | [large] ── */}
      <div className={`${styles.productRow} ${styles.productRowA}`}>
        {/* Left: 2×2 */}
        <div className={styles.productPair}>
          <ProductCard product={rowASmall[0]} />
          <ProductCard product={rowASmall[1]} />
          <ProductCard product={rowASmall[2]} />
          <ProductCard product={rowASmall[3]} />
        </div>
        {/* Right: large — spans both rows via CSS class */}
        {rowALarge && (
          <div className={styles.productLargeA}>
            <ProductCard product={{ ...rowALarge, size: 'large' }} />
          </div>
        )}
      </div>

      {/* ── Row B: [large] | [2×2 small] ── */}
      <div className={`${styles.productRow} ${styles.productRowB}`}>
        {/* Left: large */}
        {rowBLarge && (
          <div className={styles.productLargeB}>
            <ProductCard product={{ ...rowBLarge, size: 'large' }} />
          </div>
        )}
        {/* Right: 2×2 */}
        <div className={`${styles.productPair} ${styles.productPairRight}`}>
          {rowBSmall.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
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

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerNewsletter}>
        <p className={styles.footerSubtitle}>Stay in touch</p>
        <p className={styles.footerHeading}>SIGN UP AND ENJOY</p>
        <p className={styles.footerDescription}>Get the latest news and exclusive offers.</p>

        <form className={styles.footerEmailForm} onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your email address"
            className={styles.footerEmailInput}
            aria-label="Email address"
          />
          <button type="submit" className={styles.footerEmailSubmit} aria-label="Subscribe">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        {/* Social icons */}
        <div className={styles.footerSocialIcons} aria-label="Social media">
          {/* Facebook */}
          <a href="#" className={styles.socialIcon} aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          {/* TikTok */}
          <a href="#" className={styles.socialIcon} aria-label="TikTok">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.55V6.8a4.84 4.84 0 01-1.07-.11z" />
            </svg>
          </a>
          {/* Instagram */}
          <a href="#" className={styles.socialIcon} aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
          </a>
          {/* Twitter / X */}
          <a href="#" className={styles.socialIcon} aria-label="X (Twitter)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          {/* Pinterest */}
          <a href="#" className={styles.socialIcon} aria-label="Pinterest">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
          </a>
          {/* YouTube */}
          <a href="#" className={styles.socialIcon} aria-label="YouTube">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Copyright + payment icons */}
      <div className={styles.footerCopyright}>
        <p className={styles.footerCopyrightText}>
          &copy; 2008 – 2024 Oak &amp; Luna. All rights reserved.
        </p>
        <div className={styles.footerPayments} aria-label="Accepted payment methods">
          {['Amex', 'Visa', 'Mastercard', 'Discover', 'Klarna', 'PayPal', 'Apple Pay'].map((method) => (
            <span
              key={method}
              className={styles.footerCopyrightText}
              title={method}
              style={{ fontSize: 10, border: '1px solid var(--border-default)', padding: '2px 4px' }}
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  return (
    <div className={styles.page}>
      <AnnouncementBar />
      <Header />
      <main>
        <CategoryBanner />
        <FilterBar itemCount={100} />
        <ProductsGrid products={PRODUCTS} />
        <FaqSection faqs={FAQS} />
      </main>
      <Footer />
    </div>
  )
}
