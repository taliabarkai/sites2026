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
import { CartSizeToggle } from './CartSizeToggle'
import { FlowControls } from '../FloatingCart/FlowControls'
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

/**
 * A nav link rendered as artwork. Both states sit in the DOM stacked on top of
 * each other and crossfade, rather than swapping `src` on hover — that would
 * flash the first time, while the browser fetched the second image. Neither is
 * lazy-loaded; the nav is above the fold on every page.
 */
function NavLinkImage({ image, label }: { image: NonNullable<NavLink['image']>; label: string }) {
  return (
    <span className={styles.navImage}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.default} alt={label} className={styles.navImageDefault} />
      {/* Decorative: same link, same words — the alt above already names it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.hover} alt="" aria-hidden="true" className={styles.navImageHover} />
    </span>
  )
}

/**
 * Brands that fall back to the plain text label instead of a nav link's
 * artwork. OAL is out for now, pending its own version of the artwork.
 */
const NAV_IMAGE_EXCLUDED: readonly string[] = ['oal']

export interface HeaderProps {
  variant?: HeaderVariant
  brand?: BrandKey
  navLinks?: NavLink[]
  topline?: ToplineProps
  sticky?: boolean
}

export function Header({
  variant = 'white',
  brand,
  navLinks = DEFAULT_NAV_LINKS,
  topline = DEFAULT_TOPLINE,
  sticky = true,
}: HeaderProps) {
  const pathname = usePathname()
  const brandSegment = resolveBrand(brand ?? getBrandFromPathname(pathname))
  const logoHref = getBrandHomePath(brandSegment)

  const { items, openCart, closeCart } = useCart()
  const isScrolled = useHeaderScroll()
  const isCheckout = pathname.includes('/checkout')
  // The two pages the phases actually change. The presenter needs to see which
  // phase is running from the page itself, not only from inside the floating
  // cart they may have closed several steps ago.
  const isCartPage = pathname.endsWith('/cart')
  const showNavImages = !NAV_IMAGE_EXCLUDED.includes(brandSegment)
  const [menuOpen, setMenuOpen] = useState(false)
  // Which dropdown is expanded in the mobile drawer (by label).
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const isSolid = variant === 'white' || isScrolled

  const icons = BRAND_ICONS[brandSegment]
  const { HamburgerIcon, XIcon, MagnifyingGlassIcon, PersonIcon, ShoppingBagIcon, ChevronIcon } = icons

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  /* ── Checkout mode: logo only, horizontally centered ── */
  const wrapperClass = sticky ? styles.wrapper : styles.wrapperStatic

  /* Demo-only controls, on the two pages a phase actually changes. Rendered in
     both slots and switched by media query: the bar has room for them on
     desktop, and on mobile it does not — there they get a strip of their own
     directly under the bar, still at the top of the page. Only one slot is ever
     displayed, so the duplicate never reaches the accessibility tree. */
  const demoControls = isCheckout || isCartPage ? (
    <>
      <FlowControls brand={brandSegment} />
      {isCheckout && <CartSizeToggle className={styles.cartSizeToggle} />}
    </>
  ) : null
  const demoBar = demoControls && <div className={styles.demoBar}>{demoControls}</div>

  if (isCheckout) {
    return (
      <header className={wrapperClass}>
        <div className={`${styles.shell} ${styles.solid}`}>
          <div className={styles.checkoutBarInner}>
            <Link href={logoHref} className={styles.checkoutLogo} aria-label="Home" onClick={() => closeCart()}>
              <SiteLogo brand={brandSegment} priority />
            </Link>
            {/* Brand switcher — checkout keeps the logo-only bar, this sits to its right.
                The cart-size control is demo-only and lives on checkout alone. */}
            <div className={styles.checkoutSwitcher}>
              <div className={styles.demoInline}>{demoControls}</div>
              <ThemeSwitcher brand={brandSegment} />
            </div>
          </div>
        </div>
        {demoBar}
      </header>
    )
  }

  /* ── Default & transparent modes ── */
  const shellClass = [
    styles.shell,
    isSolid ? styles.solid : styles.transparent,
  ].join(' ')

  return (
    <header className={wrapperClass}>
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
                {navLinks.filter(link => !link.desktopHidden).map((link) => (
                  <li key={link.href} className={link.children ? styles.navItemHasSub : undefined}>
                    {link.children ? (
                      <>
                        <button type="button" className={`${styles.navLink} ${styles.navTrigger}`} aria-haspopup="true">
                          {link.label}
                          <span className={styles.navCaret} aria-hidden="true"><ChevronIcon size={16} /></span>
                        </button>
                        <ul className={styles.subMenu}>
                          {link.children.map((child) => (
                            <li key={child.href}>
                              <Link href={child.href} className={styles.subMenuLink}>
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : link.highlight ? (
                      <Button
                        href={link.href}
                        variant="primary"
                        size="compact"
                      >
                        {link.label}
                      </Button>
                    ) : (
                      <Link
                        href={link.href}
                        className={`${styles.navLink} ${link.image && showNavImages ? styles.navLinkImage : ''}`}
                      >
                        {link.image && showNavImages
                          ? <NavLinkImage image={link.image} label={link.label} />
                          : link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.actions}>
              <div className={styles.demoInline}>{demoControls}</div>
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
                onClick={() => openCart()}
              >
                <ShoppingBagIcon />
                {items.length > 0 && (
                  <span className={styles.cartCount}>{items.length}</span>
                )}
              </button>
            </div>
          </div>
        </div>
        {demoBar}
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
                  {link.children ? (
                    <>
                      <button
                        type="button"
                        className={`${styles.drawerLink} ${styles.drawerTrigger}`}
                        aria-expanded={openDropdown === link.label}
                        onClick={() =>
                          setOpenDropdown((cur) => (cur === link.label ? null : link.label))
                        }
                      >
                        {link.label}
                        <span
                          className={`${styles.drawerCaret} ${openDropdown === link.label ? styles.drawerCaretOpen : ''}`}
                          aria-hidden="true"
                        >
                          <ChevronIcon size={18} />
                        </span>
                      </button>
                      {openDropdown === link.label && (
                        <ul className={styles.drawerSubList}>
                          {link.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className={styles.drawerSubLink}
                                onClick={() => setMenuOpen(false)}
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : link.highlight ? (
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
                      className={`${styles.drawerLink} ${link.image && showNavImages ? styles.navLinkImage : ''}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.image && showNavImages
                        ? <NavLinkImage image={link.image} label={link.label} />
                        : link.label}
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
