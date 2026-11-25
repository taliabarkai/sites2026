import type { Metadata } from 'next'
import { GALLERY_SWITCHES, type GallerySwitch } from '../../_config/demoParams'
import { flowPath } from '../../_config/personalizationFlows'
import styles from '../../flows/Flows.module.css'
import { HideDevTools } from '../../flows/HideDevTools'
import { PhoneFrame } from '../../flows/PhoneFrame'

export const metadata: Metadata = { title: 'V2 switch designs — Oak and Luna' }

/**
 * The final flow V2's preview / photos switch, its four designs side by side
 * on OAL at phone size — each with "Jessica" typed and the page scrolled a
 * little, so the sticky gallery and its switch are in view — the
 * personalization in view. Each frame is a real 375px phone, unscaled; the
 * row scrolls sideways when the window is narrower than the four.
 */
const NAME = 'Jessica'
const SCROLL = 300

const NOTES: Record<GallerySwitch, string> = {
  pill: 'Your Personalization / Product Photos, full width under the image.',
  text: 'The pagination row is the switch; its frame shrinks to a button on the photos.',
  stack: 'The switch always holds both; the dots appear above it on the photos.',
  chip: 'One chip top right that swaps between the two.',
}

const href = (s: GallerySwitch) =>
  `${flowPath('oal', 'v2')}?switch=${s}&name=${NAME}&scroll=${SCROLL}`

export default function SwitchDesignsPage() {
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
            href={href(s.value)}
            label={s.label.split(' – ')[0]}
            title={s.label.split(' – ')[1] ?? s.label}
            caption={NOTES[s.value]}
            metaFirst
          />
        ))}
      </ul>
    </main>
  )
}
