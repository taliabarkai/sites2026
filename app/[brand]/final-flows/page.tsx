import type { Metadata } from 'next'
import Link from 'next/link'
import { BRANDS, getBrandMeta, resolveBrand, type BrandKey } from '../_config/brands'
import { FINAL_FLOWS, PERSONALIZATION_FLOWS, flowPath, type FinalFlow } from '../_config/personalizationFlows'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import { FINAL_FLOW_COMPLEX_TEMPLATES, flowProductFor, templateProductId } from '../product/_templates'
import styles from '../flows/Flows.module.css'
import { HideDevTools } from '../flows/HideDevTools'
import { PhoneFrame } from '../flows/PhoneFrame'

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params
  return { title: `Final flows — ${getBrandMeta(resolveBrand(brand)).label}` }
}

const productName = (brand: BrandKey, id: number | undefined) =>
  id === undefined ? undefined : getBrandProducts(brand).find((p) => p.id === id)?.name

const FLOW_COPY: Record<FinalFlow, { name: string; intro: string }> = {
  v1: {
    name: 'Sticky gallery',
    intro:
      'Simple Personalization’s layout. The gallery comes first on mobile, with the product name and details under it, ' +
      'and it sticks under the header while the shopper fills in the form, so the preview updates in view.',
  },
  v2: {
    name: 'Product info above the gallery',
    intro:
      'V1 with the breadcrumbs, product name, price and reviews above the gallery on mobile (the live preview’s V2). ' +
      'The gallery still sticks while the shopper fills in the form.',
  },
  v3: {
    name: 'Preview dock',
    intro:
      'Custom Personalization’s Option 1, as OAL had it. Every option is on the page and the gallery scrolls away ' +
      'with it. Once the shopper’s own design comes in, the preview docks at the top, behind a Your Personalization toggle.',
  },
}

// The complex products: the same flows, with several options driving the preview
const COMPLEX = (Object.entries(FINAL_FLOW_COMPLEX_TEMPLATES) as [BrandKey, string][])
  .map(([brand, templateId]) => ({ brand, id: templateProductId(templateId) }))
  .filter((x): x is { brand: BrandKey; id: number } => x.id !== undefined)

export default async function FinalFlowsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const current = resolveBrand(brand)
  const label = (b: BrandKey) => BRANDS.find((x) => x.key === b)?.shortLabel ?? b.toUpperCase()

  return (
    <main className={styles.page}>
      <HideDevTools />
      <header className={styles.header}>
        <h1 className={styles.title}>Final flows</h1>
        <p className={styles.intro}>
          The three final personalization flows, on every theme. Each one takes simple and complex products alike: however
          many options a product has, the flow stays the same. Every frame is live at phone size, so you can scroll and tap
          inside it, or open the full page.
        </p>
        <nav aria-label="Sections" className={styles.jump}>
          {FINAL_FLOWS.map((f) => (
            <a key={f} href={`#${f}`}>{PERSONALIZATION_FLOWS[f].label} · {FLOW_COPY[f].name}</a>
          ))}
          <Link href={`/${current}/flows`}>All flows and prototypes →</Link>
        </nav>
      </header>

      {FINAL_FLOWS.map((f) => (
        <section key={f} id={f} className={styles.section} aria-labelledby={`${f}-title`}>
          <div className={styles.sectionHead}>
            <h2 id={`${f}-title`} className={styles.sectionTitle}>{PERSONALIZATION_FLOWS[f].label} · {FLOW_COPY[f].name}</h2>
            <p className={styles.sectionIntro}>{FLOW_COPY[f].intro}</p>
            <p className={styles.path}>/[brand]/product/{PERSONALIZATION_FLOWS[f].segment}</p>
          </div>
          <ul className={styles.row}>
            {PERSONALIZATION_FLOWS[f].brands.map((b) => (
              <PhoneFrame key={b} href={flowPath(b, f)} label={label(b)} title={productName(b, flowProductFor(f, b)) ?? getBrandMeta(b).label} />
            ))}
          </ul>

          <h3 className={styles.subTitle}>Complex products, same flow</h3>
          <ul className={styles.row}>
            {COMPLEX.map(({ brand: b, id }) => (
              <PhoneFrame key={b} href={flowPath(b, f, id)} label={label(b)} title={productName(b, id) ?? getBrandMeta(b).label} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
