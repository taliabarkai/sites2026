import type { Metadata } from 'next'
import Link from 'next/link'
import { BRANDS, getBrandMeta, resolveBrand, type BrandKey } from '../_config/brands'
import { PERSONALIZATION_FLOWS, flowPath, type PersonalizationFlow } from '../_config/personalizationFlows'
import { PERSONALIZE_PARAM, PERSONALIZE_PLACEMENTS } from '../_config/demoParams'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import { flowProductFor, livePreviewProductFor, renderedTemplateFor } from '../product/_templates'
import styles from './Flows.module.css'
import { HideDevTools } from './HideDevTools'
import { PhoneFrame } from './PhoneFrame'

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params
  return { title: `Flows — ${getBrandMeta(resolveBrand(brand)).label}` }
}

const productName = (brand: BrandKey, id: number | undefined) =>
  id === undefined ? undefined : getBrandProducts(brand).find((p) => p.id === id)?.name

/** V4 (Personalize Now) is the second top Custom flow; the other versions are further prototypes. */
const TOP_VERSION = PERSONALIZE_PLACEMENTS.find((v) => v.value === 'panel-c')!
const OTHER_VERSIONS = PERSONALIZE_PLACEMENTS.filter((v) => v !== TOP_VERSION)

const FLOW_INTRO: Record<'simple' | 'custom', string> = {
  simple:
    'The single-name necklace: pick a metal, type a name, and the gallery image becomes the live preview. ' +
    'The live preview’s V2 — gallery first on mobile, the product name and details under it.',
  custom:
    'Several options shape the preview — initials and stones, names and diamonds between them, a song on a canvas. ' +
    'The two top flows for them, in order.',
}

/**
 * The theme toggle: one link per theme, to this page on that theme — the page
 * takes the theme's look, and Other prototypes its live-preview product.
 * `hash` lands back on a section.
 */
function ThemeToggle({ current, label, hash = '' }: { current: BrandKey; label: string; hash?: string }) {
  return (
    <nav aria-label={label} className={styles.themes}>
      {BRANDS.map((b) => (
        <Link
          key={b.key}
          href={`/${b.key}/flows${hash}`}
          aria-current={b.key === current ? 'page' : undefined}
          className={`${styles.theme} ${b.key === current ? styles.themeOn : ''}`}
          title={b.label}
        >
          {b.shortLabel}
        </Link>
      ))}
    </nav>
  )
}

export default async function FlowsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const current = resolveBrand(brand)
  const label = (b: BrandKey) => BRANDS.find((x) => x.key === b)?.shortLabel ?? b.toUpperCase()

  // The live preview prototype's versions, on this theme's live-preview product
  const lpId = livePreviewProductFor(current)
  const lpName = productName(current, lpId)
  // V4 on Custom's products — those its template renders (not Music Memories' bespoke customizer)
  const topVersionBrands = PERSONALIZATION_FLOWS.custom.brands
    .map((b) => ({ brand: b, id: flowProductFor('custom', b) }))
    .filter((x): x is { brand: BrandKey; id: number } => x.id !== undefined && !!renderedTemplateFor(x.brand, x.id))

  return (
    <main className={styles.page}>
      <HideDevTools />
      <header className={styles.header}>
        <h1 className={styles.title}>Flows</h1>
        <p className={styles.intro}>
          Every personalization flow in one place, each shown live at phone size — scroll and tap inside a frame to try
          it, or open the full page.
        </p>
        <ThemeToggle current={current} label="Theme" />
        <nav aria-label="Sections" className={styles.jump}>
          <a href="#simple">{PERSONALIZATION_FLOWS.simple.label}</a>
          <a href="#custom">{PERSONALIZATION_FLOWS.custom.label}</a>
          <a href="#other">Other prototypes</a>
          <Link href={`/${current}/final-flows`}>Final flows →</Link>
        </nav>
      </header>

      <section id="simple" className={styles.section} aria-labelledby="simple-title">
        <div className={styles.sectionHead}>
          <h2 id="simple-title" className={styles.sectionTitle}>{PERSONALIZATION_FLOWS.simple.label}</h2>
          <p className={styles.sectionIntro}>{FLOW_INTRO.simple}</p>
          <p className={styles.path}>/[brand]/product/{PERSONALIZATION_FLOWS.simple.segment}</p>
        </div>
        <ul className={styles.row}>
          {PERSONALIZATION_FLOWS.simple.brands.map((b) => (
            <PhoneFrame key={b} href={flowPath(b, 'simple')} label={label(b)} title={productName(b, flowProductFor('simple', b)) ?? getBrandMeta(b).label} />
          ))}
        </ul>
      </section>

      {/* Custom: the two top flows, side by side in order — everything on the
          page, then V4 (Personalize Now) on the same products */}
      <section id="custom" className={styles.section} aria-labelledby="custom-title">
        <div className={styles.sectionHead}>
          <h2 id="custom-title" className={styles.sectionTitle}>{PERSONALIZATION_FLOWS.custom.label}</h2>
          <p className={styles.sectionIntro}>{FLOW_INTRO.custom}</p>
        </div>

        <div className={styles.option}>
          <div className={styles.sectionHead}>
            <h3 className={styles.optionTitle}>Option 1 · Everything on the page</h3>
            <p className={styles.sectionIntro}>
              Every option right on the page; the preview comes in with the shopper’s own personalization.
            </p>
            <p className={styles.path}>/[brand]/product/{PERSONALIZATION_FLOWS.custom.segment}</p>
          </div>
          <ul className={styles.row}>
            {PERSONALIZATION_FLOWS.custom.brands.map((b) => (
              <PhoneFrame key={b} href={flowPath(b, 'custom')} label={label(b)} title={productName(b, flowProductFor('custom', b)) ?? getBrandMeta(b).label} />
            ))}
          </ul>
        </div>

        <div className={styles.option}>
          <div className={styles.sectionHead}>
            <h3 className={styles.optionTitle}>Option 2 · {TOP_VERSION.label} – {TOP_VERSION.description}</h3>
            <p className={styles.sectionIntro}>
              One Personalize Now button opens the steps; the gallery takes the preview. The same products — Music
              Memories keeps its own customizer, so it’s in Option 1 only.
            </p>
            <p className={styles.path}>/[brand]/product/[id]?{PERSONALIZE_PARAM}={TOP_VERSION.value}</p>
          </div>
          <ul className={styles.row}>
            {topVersionBrands.map(({ brand: b, id }) => (
              <PhoneFrame key={b} href={`/${b}/product/${id}?${PERSONALIZE_PARAM}=${TOP_VERSION.value}`} label={label(b)} title={productName(b, id) ?? getBrandMeta(b).label} />
            ))}
          </ul>
        </div>
      </section>

      <section id="other" className={styles.section} aria-labelledby="other-title">
        <div className={styles.sectionHead}>
          <h2 id="other-title" className={styles.sectionTitle}>Other prototypes</h2>
          <p className={styles.sectionIntro}>
            More of the live preview’s versions ({OTHER_VERSIONS.map((v) => v.label).join(', ')}), on {lpName ?? 'this theme’s live-preview product'} — the header’s
            switches (version, gallery, nested item, material) stay on these pages. Switch theme to see another
            brand’s.
          </p>
          <ThemeToggle current={current} label="Theme for other prototypes" hash="#other" />
          <p className={styles.path}>/{current}/product/livepreview?{PERSONALIZE_PARAM}=…</p>
        </div>
        <ul className={styles.row}>
          {OTHER_VERSIONS.map((v) => (
            <PhoneFrame
              key={v.value}
              href={`/${current}/product/livepreview?${PERSONALIZE_PARAM}=${v.value}`}
              label={v.label}
              title={v.description}
              caption={v.desktopNote}
            />
          ))}
        </ul>

        <h3 className={styles.subTitle}>More examples</h3>
        <ul className={styles.links}>
          <li><Link href="/oal/product/27">OAL Inez Initial Heart with Premium Diamond</Link> — initial, enamel heart, premium diamond and zodiac coin on one chain</li>
          <li><Link href={`/${current}/live-preview`}>PDP templates</Link> — every config-driven product page</li>
          <li><Link href={`/${current}/panel-examples`}>Panel examples</Link></li>
          <li><Link href={`/${current}/option-categories`}>Option categories</Link></li>
          <li><Link href={`/${current}/highlights-examples`}>Highlights bar</Link></li>
        </ul>
      </section>
    </main>
  )
}
