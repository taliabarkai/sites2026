import type { SeoCategoryVariant } from '../../../../data/seoCategories/variantConfig'
import styles from './CategoryHero.module.css'

// ─── Default category data ────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = [
  { label: 'Best Selling Bracelets',    src: 'https://cdn.oakandluna.com/digital-asset/product/engraved-dot-bracelet-silver-8.jpg' },
  { label: 'Best Selling Earrings',     src: 'https://cdn.oakandluna.com/digital-asset/product/inez-initial-necklace-gold-vermeil-with-diamond-9.jpg' },
  { label: 'Best Selling Rings',        src: 'https://cdn.oakandluna.com/digital-asset/product/willow-tag-initial-necklace-with-diamond-gold-vermeil-10.jpg' },
  { label: 'Best Selling Fine Jewelry', src: 'https://cdn.oakandluna.com/digital-asset/product/singapore-chain-name-necklace-gold-vermeil-9.jpg' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryItem {
  label: string
  src?: string
  href?: string
}

interface CategoryHeroProps {
  brand: string
  title?: string
  description?: string
  categories?: CategoryItem[]
  variant?: SeoCategoryVariant
  hideCategories?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryHero({
  brand,
  title = 'Necklaces for Women',
  description = 'Capture your unique personality effortlessly with pendants for women, as your jewelry should be just as unique as you are.',
  categories = DEFAULT_CATEGORIES,
  variant = 'with-image',
  hideCategories = false,
}: CategoryHeroProps) {
  const isOal = brand === 'oal'
  const count = categories.length
  // 2→2 cols, 4→4 cols, 6→3 cols (2 rows), etc.
  const oalCols = count <= 4 ? count : Math.ceil(count / 2)

  return (
    <section className={isOal ? styles.heroOal : styles.hero} aria-label="Category">
      <div className={isOal ? styles.heroTextOal : undefined}>
        <h1 className={styles.heroTitle}>{title}</h1>
        <p className={styles.heroDescription}>{description}</p>
      </div>

      {!hideCategories && (
        variant === 'text-only' ? (
          /* ── text-only: pill links ── */
          <div className={styles.pillContainer}>
            {categories.map((cat) => (
              <a
                key={cat.label}
                href={cat.href ?? '#'}
                className={styles.pill}
              >
                {cat.label}
              </a>
            ))}
          </div>
        ) : (
          /* ── with-image: image cards ── */
          <div
            className={isOal ? styles.categoryContainerOal : styles.categoryContainerDefault}
            style={isOal ? { maxWidth: `${oalCols * 160 + (oalCols - 1) * 16}px` } : undefined}
          >
            {categories.map((cat) => (
              <div key={cat.label} className={styles.categoryItem}>
                <div className={styles.categoryImageWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.src} alt={cat.label} className={styles.categoryImage} loading="lazy" />
                </div>
                <span className={styles.categoryLabel}>{cat.label}</span>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  )
}
