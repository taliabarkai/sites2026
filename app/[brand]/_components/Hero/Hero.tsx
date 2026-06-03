'use client'

import { useEffect, useRef } from 'react'
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
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return

    const section = sectionRef.current
    const bg = bgRef.current
    if (!section || !bg) return

    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const scrolled = -rect.top
      if (scrolled > -window.innerHeight && scrolled < rect.height) {
        bg.style.transform = `translateY(${scrolled * 0.35}px)`
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleAddToBag = () => {
    addItem(DEMO_PRODUCT)
    openCart()
  }

  const heroClass = [styles.hero, transparentHeader ? styles.heroTransparent : ''].join(' ').trim()

  return (
    <section ref={sectionRef} className={heroClass} aria-labelledby="home-hero-title">
      {/* Parallax background layer */}
      <div
        ref={bgRef}
        className={styles.bg}
        aria-hidden="true"
        style={{
          '--bg-mobile': `url('${imageMobile}')`,
          '--bg-desktop': `url('${imageDesktop}')`,
        } as React.CSSProperties}
      />

      {/* Sticky text content — pins to viewport top while section scrolls past */}
      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 id="home-hero-title" className={styles.title}>{title}</h1>
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
