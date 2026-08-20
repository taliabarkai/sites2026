'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import { BRAND_HIGHLIGHTS } from '../_config/highlights'
import styles from './highlights-examples.module.css'

export default function HighlightsExamplesPage() {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)

  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:    withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref:   withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  // One sample circle, shared by all three cards, so the treatment below the
  // image is the only thing that differs. Taken from the brand's own highlights.
  const sample = BRAND_HIGHLIGHTS[brand][0]
  const categoryHref = `/${brand}/category`

  const circle = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={sample.image} alt="" className={styles.circle} loading="lazy" />
  )

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main id="main-content" className={styles.main}>
        <div className={styles.container}>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Highlights Bar</h1>
            <p className={styles.intro}>
              Layout variations for the circular category shortcuts that sit below the main
              nav on the homepage. Each card below is a single static example rather than the
              scrolling row, so the treatments can be compared side by side. The image and
              label are the same in all three — only what sits under the circle changes.
            </p>
          </header>

          <section className={styles.variants} aria-label="Highlights bar variations">
            {/* Variant 1 — the live homepage treatment */}
            <article className={styles.card}>
              <div className={styles.example}>
                <div className={styles.item}>
                  {circle}
                  <span className={styles.labelText3}>{sample.label}</span>
                </div>
              </div>
              <p className={styles.caption}>Variant 1: Image + Text-3</p>
              <p className={styles.note}>Live on the homepage today.</p>
            </article>

            {/* Variant 2 — same layout, larger label scale */}
            <article className={styles.card}>
              <div className={styles.example}>
                <div className={styles.item}>
                  {circle}
                  <span className={styles.labelText4}>{sample.label}</span>
                </div>
              </div>
              <p className={styles.caption}>Variant 2: Image + Text-4</p>
              <p className={styles.note}>Bolder label, same circle.</p>
            </article>

            {/* Variant 3 — the button label as an underlined link, no box */}
            <article className={styles.card}>
              <div className={styles.example}>
                <div className={styles.item}>
                  {circle}
                  <Link href={categoryHref} className={styles.buttonLink}>
                    Shop Now
                  </Link>
                </div>
              </div>
              <p className={styles.caption}>Variant 3: Image + Button/Link</p>
              <p className={styles.note}>Links-1 typography, underlined, no box.</p>
            </article>
          </section>
        </div>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}
