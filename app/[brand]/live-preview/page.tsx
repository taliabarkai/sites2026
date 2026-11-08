import type { Metadata } from 'next'
import Link from 'next/link'
import { getBrandMeta, resolveBrand } from '../_config/brands'
import { getBrandProducts } from '../../../data/products/getBrandProducts'
import { ALL_TEMPLATES, type PdpTemplate } from '../product/_templates'
import styles from './LivePreviewIndex.module.css'

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params
  return { title: `PDP templates — ${getBrandMeta(resolveBrand(brand)).label}` }
}

const BRAND_LABEL: Record<PdpTemplate['brand'], string> = { oal: 'OAL', tgr: 'TGR', lal: 'LAL', ib: 'IB', mnn: 'MNN' }

/** "tgr-heritage-multi-name" → "Heritage Multi Name" (the schema has no display name). */
function displayName(t: PdpTemplate): string {
  return t.id
    .replace(new RegExp(`^${t.brand}-`), '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function containerLabel(t: PdpTemplate): string {
  const { desktop, mobile } = t.flow.container
  return desktop === mobile ? desktop : `${desktop} / ${mobile}`
}

export default async function LivePreviewIndexPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const current = resolveBrand(brand)
  // Current brand's templates first, then the rest
  const templates = [...ALL_TEMPLATES].sort((a, b) => Number(b.brand === current) - Number(a.brand === current))

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>PDP templates</h1>
        <p className={styles.intro}>
          Each product page below renders from its template: steps, fields, price and live preview all come from config.
          Tap through on a phone to see the mobile panel.
        </p>
      </header>

      <ul className={styles.list}>
        {templates.map((t) => {
          const product = getBrandProducts(t.brand).find((p) => p.id === t.productId)
          const href = `/${t.brand}/product/${t.productId}`
          const fromTemplate = t.renderer !== 'bespoke'
          return (
            <li key={t.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.brand}>{BRAND_LABEL[t.brand]}</span>
                <span className={styles.steps}>
                  {t.steps.length} {t.steps.length === 1 ? 'step' : 'steps'} · {containerLabel(t)}
                </span>
              </div>

              <h2 className={styles.name}>{displayName(t)}</h2>
              <p className={styles.summary}>{t.summary}</p>

              <dl className={styles.meta}>
                <div className={styles.metaRow}>
                  <dt className={styles.metaTerm}>SKU</dt>
                  <dd className={styles.metaValue}>{t.sku}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaTerm}>Steps</dt>
                  <dd className={styles.metaValue}>{t.steps.map((s) => s.label).join(' → ')}</dd>
                </div>
                <div className={styles.metaRow}>
                  <dt className={styles.metaTerm}>Preview</dt>
                  <dd className={styles.metaValue}>{t.livePreview.enabled ? t.livePreview.engine.kind : 'off'}</dd>
                </div>
                {product && (
                  <div className={styles.metaRow}>
                    <dt className={styles.metaTerm}>Page</dt>
                    <dd className={styles.metaValue}>{product.name}</dd>
                  </div>
                )}
              </dl>

              {!fromTemplate && <p className={styles.note}>Still drawn by its own customizer; the template documents it.</p>}

              <div className={styles.links}>
                <Link href={href} className={styles.primaryLink}>Open product page</Link>
                {fromTemplate && t.livePreview.enabled && t.livePreview.engine.kind === 'placeholder' && (
                  <Link href={`${href}?engine=external`} className={styles.secondaryLink}>With external engine (simulated latency)</Link>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
