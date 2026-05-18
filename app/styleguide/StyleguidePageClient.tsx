'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Footer } from '../[brand]/_components/Footer'
import { Header } from '../[brand]/_components/Header'
import { resolveBrand, type BrandKey } from '../[brand]/_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../[brand]/_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../[brand]/_config/siteContent'
import StyleguideClient from './StyleguideClient'
import styles from './StyleguidePage.module.css'

function StyleguidePageContent() {
  const searchParams = useSearchParams()
  const brand = resolveBrand(searchParams.get('brand') ?? undefined)

  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref: withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
  }

  return (
    <div data-theme={brand} className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />
      <main className={styles.main}>
        <StyleguideClient brand={brand} />
      </main>
      <Footer columns={footerColumns} />
    </div>
  )
}

export default function StyleguidePageClient() {
  return (
    <Suspense fallback={null}>
      <StyleguidePageContent />
    </Suspense>
  )
}
