'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DEFAULT_NAV_LINKS, DEFAULT_TOPLINE, type NavLink } from '../../_config/siteContent'
import { Button } from '../Button'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { SiteLogo } from '../SiteLogo'
import { ThemeSwitcher } from '../ThemeSwitcher'
import { Topline, type ToplineProps } from '../Topline'
import { getBrandFromPathname, getBrandHomePath, resolveBrand, type BrandKey } from '../../_config/brands'
import { useCart } from '../../_context/CartContext'
import styles from './Header.module.css'
import { useHeaderScroll } from './useHeaderScroll'

const BRAND_ICONS = {
  oal: oalIcons,
  mnn: mnnIcons,
  tgr: tgrIcons,
  lal: lalIcons,
  ib: ibIcons,
} as const

export type HeaderVariant = 'white' | 'transparent'

export interface HeaderProps {
  variant?: HeaderVariant
  brand?: BrandKey
  navLinks?: NavLink[]
  topline?: ToplineProps
}

export function Header({
  variant = 'white',
  brand,
  navLinks = DEFAULT_NAV_LINKS,
  topline = DEFAULT_TOPLINE,
}: HeaderProps) {
  const pathname = usePathname()
  const brandSegment = resolveBrand(brand ?? getBrandFromPathname(pathname))
  const logoHref = getBrandHomePath(brandSegment)

  const { items, openCart } = useCart()
  const isScrolled = useHeaderScroll()
  const isCheckout = pathname.includes('/checkout')
  const [menuOpen, setMenuOpen] = useState(false)
  const isSolid = variant === 'white' || isScrolled

  const icons = BRAND_ICONS[brandSegment]
  const { HamburgerIcon, XIcon, MagnifyingGlassIcon, PersonIcon, ShoppingBagIcon } = icons

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  /* ── Checkout mode: logo only, horizontally centered ── */
  if (isCheckout) {
    return (
      <header className={styles.wrapper}>
        <div className={`${styles.shell} ${styles.solid}`}>
          <div className={styles.checkoutBarInner}>
            <Link href={logoHref} className={styles.checkoutLogo} aria-label="Home">
              <SiteLogo brand={brandSegment} priority />
            </Link>
          </div>
        </div>
      </header>
    )
  }

  /* ── Default & transparent modes ── */
  const shellClass = [
    styles.shell,
    isSolid ? styles.solid : styles.transparent,
  ].join(' ')

  return (
    <header className={styles.wrapper}>
      <div className={shellClass}>
        <Topline {...topline} />
        <div className={styles.bar}>
          <div className={styles.barInner}>
            <div className={styles.mobileLeft}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <XIcon /> : <HamburgerIcon />}
              </button>
              <button type="button" className={styles.iconButton} aria-label="Search">
                <MagnifyingGlassIcon />
              </button>
            </div>

            <Link href={logoHref} className={styles.logo} aria-label="Home">
              <SiteLogo brand={brandSegment} priority />
            </Link>

            <nav className={styles.desktopNav} aria-label="Primary">
              <ul className={styles.navList}>
                {navLinks.map((link) => (
                  <li key={link.href}>
                    {link.highlight ? (
                      <Button
                        href={link.href}
                        variant="primary"
                        size="compact"
                      >
                        {link.label}
                      </Button>
                    ) : (
                      <Link href={link.href} className={styles.navLink}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.actions}>
              <ThemeSwitcher brand={brandSegment} />
              <button type="button" className={`${styles.iconButton} ${styles.desktopOnly}`} aria-label="Search">
                <MagnifyingGlassIcon />
              </button>
              <button type="button" className={styles.iconButton} aria-label="Account">
                <PersonIcon />
              </button>
              <button
                type="button"
                className={styles.cartButton}
                aria-label={`Cart${items.length > 0 ? ` (${items.length})` : ''}`}
                onClick={openCart}
              >
                <ShoppingBagIcon />
                {items.length > 0 && (
                  <span className={styles.cartCount}>{items.length}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className={styles.overlay}
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav className={styles.drawer} aria-label="Mobile">
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitle}>Menu</span>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <XIcon />
              </button>
            </div>
            <ul className={styles.drawerList}>
              {navLinks.map((link) => (
                <li key={link.href}>
                  {link.highlight ? (
                    <Button
                      href={link.href}
                      variant="primary"
                      className={styles.drawerCta}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Button>
                  ) : (
                    <Link
                      href={link.href}
                      className={styles.drawerLink}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </header>
  )
}
