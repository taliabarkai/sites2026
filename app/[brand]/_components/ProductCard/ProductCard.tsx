import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './ProductCard.module.css'

export interface ProductCardProps {
  name: string
  price: string
  originalPrice?: string
  defaultImage: string
  hoverImage?: string
  /** Material swatches shown above the product name. Each entry is a CSS
   *  color value (e.g. 'var(--sterling-silver-925)' or '#E2C385'). */
  swatches?: string[]
  href?: string
  className?: string
  /** Slot for badges/ribbons rendered on top of the image (positioned by the consumer). */
  children?: ReactNode
}

export function ProductCard({
  name,
  price,
  originalPrice,
  defaultImage,
  hoverImage,
  swatches,
  href,
  className,
  children,
}: ProductCardProps) {
  const content = (
    <>
      <div className={styles.imageWrap}>
        <img
          src={defaultImage}
          alt={name}
          className={`${styles.image} ${styles.imageDefault}`}
          loading="lazy"
        />
        {hoverImage && (
          <img
            src={hoverImage}
            alt=""
            aria-hidden="true"
            className={`${styles.image} ${styles.imageHover}`}
            loading="lazy"
          />
        )}
        {children}
      </div>

      <div className={styles.info}>
        {swatches && swatches.length > 0 && (
          <ul className={styles.swatches} aria-label="Available materials">
            {swatches.map((color, i) => (
              <li
                key={i}
                className={styles.swatch}
                style={{ backgroundColor: color }}
                aria-label={`Material option ${i + 1}`}
              />
            ))}
          </ul>
        )}
        <p className={styles.name}>{name}</p>
        <div className={styles.prices}>
          {originalPrice && (
            <span className={styles.priceOriginal}>{originalPrice}</span>
          )}
          <span className={styles.price}>{price}</span>
        </div>
      </div>
    </>
  )

  const classes = [styles.card, className].filter(Boolean).join(' ')

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return <article className={classes}>{content}</article>
}
