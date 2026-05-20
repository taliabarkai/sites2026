'use client'

import { DEFAULT_HERO, HERO_IMAGES } from '../../_config/siteContent'
import { useCart } from '../../_context/CartContext'
import { Button } from '../Button'
import styles from './Hero.module.css'

export interface HeroProps {
  eyebrow?: string
  title?: string
  description?: string
  ctaPrimary?: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
  imageAlt?: string
  imageDesktop?: string
  imageMobile?: string
  transparentHeader?: boolean
}

const DEMO_PRODUCT = {
  id: 'statement-one-carat-diamond-necklace-gold',
  name: 'The Statement One Carat Diamond Necklace - Gold Vermeil',
  price: 55000,
  image: 'https://cdn.oakandluna.com/digital-asset/product/the-statement-one-carat-diamond-necklace-gold-1.jpg',
  isPersonalized: false,
}

export function Hero({
  eyebrow = DEFAULT_HERO.eyebrow,
  title = DEFAULT_HERO.title,
  description = DEFAULT_HERO.description,
  ctaPrimary = DEFAULT_HERO.ctaPrimary,
  ctaSecondary = DEFAULT_HERO.ctaSecondary,
  imageAlt = DEFAULT_HERO.imageAlt,
  imageDesktop = HERO_IMAGES.desktop,
  imageMobile = HERO_IMAGES.mobile,
  transparentHeader = false,
}: HeroProps) {
  const { addItem, openCart } = useCart()

  const handleAddToBag = () => {
    addItem(DEMO_PRODUCT)
    openCart()
  }

  const heroClass = [styles.hero, transparentHeader ? styles.heroTransparent : ''].join(' ').trim()
  return (
    <section className={heroClass} aria-labelledby="home-hero-title">
      <picture className={styles.media}>
        <source media="(min-width: 768px)" srcSet={imageDesktop} />
        <img
          src={imageMobile}
          alt={imageAlt}
          className={styles.mediaImage}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 id="home-hero-title" className={styles.title}>
          {title}
        </h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          <Button href={ctaPrimary.href} variant="primary">
            {ctaPrimary.label}
          </Button>
          <Button variant="secondary" onClick={handleAddToBag}>
            Add To Bag
          </Button>
        </div>
      </div>
    </section>
  )
}
