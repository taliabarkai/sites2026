'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { DEFAULT_NAV_LINKS, DEFAULT_TOPLINE, type NavLink } from '../../_config/siteContent'
import { Button } from '../Button'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons from '@/src/components/icons/ib'
import { SiteLogo } from '../SiteLogo'
import { ThemeSwitcher } from '../ThemeSwitcher'
import { MenuCategoryCarousel } from '../MenuCategoryCarousel'
import { CartSizeToggle } from './CartSizeToggle'
import { TrackOrderStateToggle } from './TrackOrderStateToggle'
import { NestedDrawerCountToggle } from './NestedDrawerCountToggle'
import { NestedDescriptionToggle } from './NestedDescriptionToggle'
import { GalleryLayoutToggle } from './GalleryLayoutToggle'
import { PersonalizeToggle } from './PersonalizeToggle'
import { MobileLayoutToggle } from './MobileLayoutToggle'
import { NestedItemToggle } from './NestedItemToggle'
import { MaterialDisplayToggle } from './MaterialDisplayToggle'
import { finalPreviewProductFor, livePreviewProductFor, renderedTemplateFor } from '../../product/_templates'
import { isNestedDrawerProduct, isFreePreviewProduct } from '../../_config/demoParams'
import { CartNoteToggle } from './CartNoteToggle'
import { UspStripToggle } from './UspStripToggle'
import { FlowControls } from '../FloatingCart/FlowControls'
import { Topline, type ToplineProps } from '../Topline'
import { getBrandFromPathname, getBrandHomePath, resolveBrand, type BrandKey } from '../../_config/brands'
import { useCart } from '../../_context/CartContext'
import styles from './Header.module.css'
import { useHeaderScroll } from './useHeaderScroll'
import { useRevealOnScrollUp } from './useRevealOnScrollUp'

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
  /**
   * Category pages: the header scrolls away with the page, then slides back in
   * from the top whenever the user scrolls up. Overrides `sticky`.
   */
  revealOnScrollUp?: boolean
  /**
   * Track My Order only: whether the default/error demo toggle belongs on
   * screen. The error it previews is a failed lookup, so it has nothing to
   * say once an order is found — the page passes false there.
   */
  showStateToggle?: boolean
}

export function Header({
  variant = 'white',
  brand,
  navLinks = DEFAULT_NAV_LINKS,
  topline = DEFAULT_TOPLINE,
  sticky = true,
  revealOnScrollUp = false,
  showStateToggle = true,
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
  const isTrackOrder = pathname.endsWith('/track-order')
  const showNavImages = !NAV_IMAGE_EXCLUDED.includes(brandSegment)
  const [menuOpen, setMenuOpen] = useState(false)
  // Which dropdown is expanded in the mobile drawer (by label).
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const isSolid = variant === 'white' || isScrolled

  const icons = BRAND_ICONS[brandSegment]
  const { HamburgerIcon, XIcon, MagnifyingGlassIcon, PersonIcon, ShoppingBagIcon, PlusMinusIcon } = icons

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Esc closes the menu drawer.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const headerRef = useRef<HTMLElement>(null)
  const toplineRef = useRef<HTMLDivElement>(null)

  // Only the bar sticks — the topline scrolls away. The header sticks
  // at `top: -<topline height>` (Header.module.css), so publish that height;
  // it varies with the topline's content, hence measured rather than a token.
  useEffect(() => {
    const header = headerRef.current
    const topline = toplineRef.current
    if (!header || !topline) return
    const sync = () => header.style.setProperty('--header-topline-height', `${topline.offsetHeight}px`)
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(topline)
    return () => observer.disconnect()
  }, [])
  // Keep the header in view while its menu or drawer is open.
  const headerHidden = useRevealOnScrollUp(revealOnScrollUp, headerRef, menuOpen)

  /* ── Checkout mode: logo only, horizontally centered ── */
  // The final live preview (mobile): the header scrolls away with the page —
  // the product's gallery is what sticks there, right at the top
  const scrollsAwayOnMobile = /\/product\/livepreviewfinal(\/|$)/.test(pathname)
  const wrapperClass = `${revealOnScrollUp
    ? `${styles.wrapperReveal} ${headerHidden ? styles.wrapperHidden : ''}`
    : sticky ? styles.wrapper : styles.wrapperStatic} ${scrollsAwayOnMobile ? styles.wrapperScrollsOnMobile : ''}`

  /* Demo-only controls, on the two pages a phase actually changes. Rendered in
     both slots and switched by media query: the bar has room for them on
     desktop, and on mobile it does not — there they get a strip of their own
     directly under the bar, still at the top of the page. Only one slot is ever
     displayed, so the duplicate never reaches the accessibility tree. */
  const showTrackOrderToggle = isTrackOrder && showStateToggle
  const productIdMatch = pathname.match(/\/product\/(\d+)$/)
  const isNestedDrawerDemo = !!productIdMatch && isNestedDrawerProduct(brandSegment, Number(productIdMatch[1]))
  // Template PDPs (live preview) get a desktop gallery layout switch — on a
  // product's own URL and on the one-URL demo, /[brand]/product/livepreview
  // The final live preview (/[brand]/product/livepreviewfinal[/id]): one
  // version, so a mobile layout switch takes the version switch's place
  const finalMatch = pathname.match(/\/product\/livepreviewfinal(?:\/(\d+))?\/?$/)
  const isFinalPreview = !!finalMatch
  const pdpProductId = productIdMatch
    ? Number(productIdMatch[1])
    : finalMatch
      ? (finalMatch[1] ? Number(finalMatch[1]) : finalPreviewProductFor(brandSegment))
      : pathname.endsWith('/product/livepreview') ? livePreviewProductFor(brandSegment) : undefined
  const pdpTemplate = pdpProductId !== undefined ? renderedTemplateFor(brandSegment, pdpProductId) : undefined
  // The free-preview bag note's V1/V2 — on its product's page, and on the bag
  // page while a line in the bag carries a note
  const isFreePreviewPdp = !!productIdMatch && isFreePreviewProduct(brandSegment, Number(productIdMatch[1]))
  const showCartNoteToggle = isFreePreviewPdp || (isCartPage && items.some(it => it.cartNote))
  const demoControls = isCheckout || isCartPage || showTrackOrderToggle || isNestedDrawerDemo || pdpTemplate || showCartNoteToggle || isFinalPreview ? (
    <>
      {/* The phases only reach the cart and checkout. Track My Order and the
          nested items Drawer product each get only their own controls. */}
      {(isCheckout || isCartPage) && <FlowControls brand={brandSegment} />}
      {isCheckout && <CartSizeToggle className={styles.cartSizeToggle} />}
      {showTrackOrderToggle && <TrackOrderStateToggle className={styles.cartSizeToggle} />}
      {isNestedDrawerDemo && <NestedDescriptionToggle className={styles.cartSizeToggle} />}
      {isNestedDrawerDemo && <NestedDrawerCountToggle className={styles.cartSizeToggle} />}
      {pdpTemplate && <GalleryLayoutToggle templateDefault={pdpTemplate.gallery.desktop} className={`${styles.cartSizeToggle} ${styles.desktopOnlyControl}`} />}
      {pdpTemplate && !isFinalPreview && <PersonalizeToggle templateDefault={pdpTemplate.flow.defaultPlacement} className={styles.cartSizeToggle} />}
      {isFinalPreview && <MobileLayoutToggle className={styles.cartSizeToggle} />}
      {pdpTemplate && <NestedItemToggle className={styles.cartSizeToggle} />}
      {pdpTemplate && <MaterialDisplayToggle className={styles.cartSizeToggle} />}
      {isFreePreviewPdp && <UspStripToggle className={styles.cartSizeToggle} />}
      {showCartNoteToggle && <CartNoteToggle className={styles.cartSizeToggle} />}
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
    <header ref={headerRef} className={wrapperClass}>
      <div className={shellClass}>
        <div ref={toplineRef} className={styles.toplineWrap}>
          <Topline {...topline} />
          {/* Mobile: the demo chips ride on the announcement bar and scroll away with it */}
          {demoControls && <div className={styles.demoOverTopline}>{demoControls}</div>}
        </div>
        <div className={styles.bar}>
          <div className={styles.barInner}>
            {/* Menu + Search: icon-only on mobile, labelled on desktop. The
                menu opens the same drawer at every width; the inline desktop
                nav moved into it so the bar stays logo-centred. */}
            <div className={styles.barLeft}>
              <button
                type="button"
                className={styles.labeledButton}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls="site-menu-drawer"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span className={styles.buttonIcon} aria-hidden="true">
                  {menuOpen ? <XIcon /> : <HamburgerIcon />}
                </span>
                <span className={styles.buttonLabel}>Menu</span>
              </button>
              <button type="button" className={styles.labeledButton} aria-label="Search">
                <span className={styles.buttonIcon} aria-hidden="true">
                  <MagnifyingGlassIcon />
                </span>
                <span className={styles.buttonLabel}>Search</span>
              </button>
            </div>

            <Link href={logoHref} className={styles.logo} aria-label="Home">
              <SiteLogo brand={brandSegment} priority />
            </Link>

            <div className={styles.actions}>
              <div className={styles.demoInline}>{demoControls}</div>
              <ThemeSwitcher brand={brandSegment} />
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
      </div>

      {/* Always in the DOM: the CSS transform drives show/hide so the panel
          animates both ways (CLAUDE.md, Panel / Drawer Animation). `inert`
          keeps the closed drawer out of the tab order and accessibility tree. */}
      <button
        type="button"
        className={`${styles.overlay} ${menuOpen ? styles.overlayVisible : ''}`}
        aria-label="Close menu"
        tabIndex={menuOpen ? 0 : -1}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />
      <nav
        id="site-menu-drawer"
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-label="Menu"
        inert={!menuOpen}
      >
        <div className={styles.drawerHeader}>
          <Link href={logoHref} className={styles.drawerLogo} aria-label="Home" onClick={() => setMenuOpen(false)}>
            <SiteLogo brand={brandSegment} />
          </Link>
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
              {link.groups ? (
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
                      className={`${styles.drawerToggleIcon} ${openDropdown === link.label ? styles.drawerToggleIconOpen : ''}`}
                      aria-hidden="true"
                    >
                      <PlusMinusIcon size={24} />
                    </span>
                  </button>
                  {openDropdown === link.label && (
                    <div className={styles.drawerGroups}>
                      {link.groups.map((group) => (
                        <div key={group.title}>
                          <p className={styles.drawerGroupTitle}>{group.title}</p>
                          <ul className={styles.drawerSubList}>
                            {group.links.map((child) => (
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
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : link.children ? (
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
                      className={`${styles.drawerToggleIcon} ${openDropdown === link.label ? styles.drawerToggleIconOpen : ''}`}
                      aria-hidden="true"
                    >
                      <PlusMinusIcon size={24} />
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
        <MenuCategoryCarousel
          brand={brandSegment}
          className={styles.drawerCarousel}
          onNavigate={() => setMenuOpen(false)}
        />
      </nav>
    </header>
  )
}
