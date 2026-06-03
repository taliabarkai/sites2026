'use client'

import { useEffect, useRef } from 'react'
import { Button } from '../Button'
import styles from './ParallaxBanners.module.css'

interface BannerPanel {
  image: string
  eyebrow: string
  title: string
  cta: { label: string; href: string }
}

interface ParallaxBannersProps {
  left?: BannerPanel
  right?: BannerPanel
}

const DEFAULT_LEFT: BannerPanel = {
  image: 'https://cdn.oakandluna.com/digital-asset/banners/oal-Bridal-box2.jpg',
  eyebrow: 'New Season',
  title: 'Name Necklaces',
  cta: { label: 'Shop Now', href: '/category' },
}

const DEFAULT_RIGHT: BannerPanel = {
  image: 'https://cdn.oakandluna.com/digital-asset/banners/oal-box1-Hexagon-F_Day.jpg',
  eyebrow: 'Best Sellers',
  title: 'Initial Jewelry',
  cta: { label: 'Explore', href: '/category' },
}

export function ParallaxBanners({
  left = DEFAULT_LEFT,
  right = DEFAULT_RIGHT,
}: ParallaxBannersProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const bg1Ref = useRef<HTMLDivElement>(null)
  const bg2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return

    const section = sectionRef.current
    const bg1 = bg1Ref.current
    const bg2 = bg2Ref.current
    if (!section || !bg1 || !bg2) return

    const onScroll = () => {
      const rect = section.getBoundingClientRect()
      const scrolled = -rect.top
      if (scrolled > -window.innerHeight && scrolled < rect.height) {
        const offset = `translateY(${scrolled * 0.35}px)`
        bg1.style.transform = offset
        bg2.style.transform = offset
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
      {[{ panel: left, bgRef: bg1Ref }, { panel: right, bgRef: bg2Ref }].map(({ panel, bgRef }, i) => (
        <div key={i} className={styles.panel}>
          {/* bgClip isolates the overflow clip to just the background layer */}
          <div className={styles.bgClip} aria-hidden="true">
            <div
              ref={bgRef}
              className={styles.bg}
              style={{ backgroundImage: `url('${panel.image}')` }}
            />
          </div>
          {/* Sticky content */}
          <div className={styles.content}>
            <p className={styles.eyebrow}>{panel.eyebrow}</p>
            <p className={styles.title}>{panel.title}</p>
            <Button href={panel.cta.href} variant="primary">
              {panel.cta.label}
            </Button>
          </div>
        </div>
      ))}
    </section>
  )
}
