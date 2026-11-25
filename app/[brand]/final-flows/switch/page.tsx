import type { Metadata } from 'next'
import { getBrandMeta, resolveBrand, type BrandKey } from '../../_config/brands'
import { GALLERY_SWITCHES, type GallerySwitch } from '../../_config/demoParams'
import { flowPath } from '../../_config/personalizationFlows'
import styles from '../../flows/Flows.module.css'
import { HideDevTools } from '../../flows/HideDevTools'
import { PhoneFrame } from '../../flows/PhoneFrame'

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }): Promise<Metadata> {
  const { brand } = await params
  return { title: `V2 switch designs — ${getBrandMeta(resolveBrand(brand)).label}` }
}

/**
 * The final flow V2's preview / photos switch, its designs side by side on
 * this page's theme (/tgr/final-flows/switch: TGR) at phone size — each with "Jessica" typed and the page scrolled a
 * little, so the sticky gallery and its switch are in view — the
 * personalization in view. Each frame is a real 375px phone, unscaled; the
 * row scrolls sideways when the window is narrower than the four.
 */
const NAME = 'Jessica'
const SCROLL = 300

const href = (brand: BrandKey, s: GallerySwitch) =>
  `${flowPath(brand, 'v2')}?switch=${s}&name=${NAME}&scroll=${SCROLL}`

export default async function SwitchDesignsPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand } = await params
  const current = resolveBrand(brand)
  return (
    <main className={`${styles.page} ${styles.pageFullSize}`}>
      <HideDevTools />
      <header className={styles.headerSplit}>
        <div className={styles.headerMain}>
          <h1 className={styles.title}>V2 switch designs</h1>
        </div>
      </header>

      <ul className={`${styles.row} ${styles.rowScroll}`}>
        {GALLERY_SWITCHES.map((s) => (
          <PhoneFrame
            key={s.value}
            href={href(current, s.value)}
            label={`Option ${s.label.split(' – ')[0]}`}
            title={s.label.split(' – ')[1] ?? s.label}
            metaFirst
            labelOnly
          />
        ))}
      </ul>
    </main>
  )
}
