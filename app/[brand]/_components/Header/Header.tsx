'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DEFAULT_NAV_LINKS, DEFAULT_TOPLINE, type NavLink } from '../../_config/siteContent'
import { Button } from '../Button'
import { IconAccount, IconCart, IconClose, IconMenu, IconSearch } from '../icons/Icons'
import { SiteLogo } from '../SiteLogo'
import { ThemeSwitcher } from '../ThemeSwitcher'
import { Topline, type ToplineProps } from '../Topline'
import { getBrandFromPathname, getBrandHomePath, resolveBrand, type BrandKey } from '../../_config/brands'
import styles from './Header.module.css'
import { useHeaderScroll } from './useHeaderScroll'

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

  const isScrolled = useHeaderScroll()
  const [menuOpen, setMenuOpen] = useState(false)
  const isSolid = variant === 'white' || isScrolled

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

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
                {menuOpen ? <IconClose /> : <IconMenu />}
              </button>
              <button type="button" className={styles.iconButton} aria-label="Search">
                <IconSearch />
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
              <button type="button" className={styles.iconButton} aria-label="Search">
                <IconSearch />
              </button>
              <button type="button" className={styles.iconButton} aria-label="Account">
                <IconAccount />
              </button>
              <button type="button" className={styles.iconButton} aria-label="Cart">
                <IconCart />
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
                <IconClose />
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
