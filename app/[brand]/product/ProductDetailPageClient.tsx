'use client'

import { useState, useRef, useCallback } from 'react'
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
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import {
  MATERIAL_SWATCHES,
  CHAIN_LENGTHS,
  DEFAULT_CHAIN_LENGTH,
  MAX_ENGRAVE_CHARS,
} from '../_config/products'
import type { MaterialSwatch } from '../_config/products'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import type { ProductItem } from '../../../data/products'
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

// ─── Mobile swipeable gallery ─────────────────────────────────────────────────

function MobileGallery({ images }: { images: string[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIdx(idx)
  }, [])

  return (
    <div className={styles.mobileGallery}>
      <div ref={trackRef} className={styles.galleryTrack} onScroll={onScroll}>
        {images.map((src, i) => (
          <div key={i} className={styles.gallerySlide}>
            <img
              src={src}
              alt=""
              className={styles.galleryImage}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className={styles.progressTrack} aria-hidden="true">
          <div
            className={styles.progressBar}
            style={{
              width: `${100 / images.length}%`,
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

function LALDesktopGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIdx, setActiveIdx] = useState(0)
  return (
    <div className={styles.lalGallery}>
      {/* Thumbnails — left column */}
      <div className={styles.lalThumbCol}>
        {images.map((src, i) => (
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
        <img src={images[activeIdx]} alt={name} className={styles.oalGalleryImage} loading="eager" />
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
      <span className={styles.ratingCount}>({reviewCount.toLocaleString()} reviews)</span>
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

function ProductDetailPageInner({ productId }: { productId: number }) {
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
        <MobileGallery images={images} />

        {/* Two-column layout on desktop, single column on mobile */}
        <div className={styles.layout}>
          {/* Left: gallery — LAL: thumbnails left; OAL/TGR: sticky+scroll; others: 2×2 grid */}
          {brand === 'lal'
            ? <LALDesktopGallery images={images} name={product.name} />
            : (brand === 'oal' || brand === 'tgr')
              ? <OALDesktopGallery images={images} name={product.name} />
              : <DesktopGallery images={images} name={product.name} />
          }

          {/* Right / main: product form */}
          <ProductForm
            brand={brand}
            product={product}
            icons={icons}
            onAddToBag={handleAddToBag}
          />
        </div>
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

export default function ProductDetailPageClient({ productId }: { productId: number }) {
  return <ProductDetailPageInner productId={productId} />
}
