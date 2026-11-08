'use client'

import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '../_components/Header'
import { Footer } from '../_components/Footer'
import { OptionDrawer } from '../_components/ProductOptions/OptionDrawer'
import { OptionRadioGroup } from '../_components/ProductOptions/OptionRadioGroup'
import { isChoiceGroup, type ChoiceGroup } from '../_components/ProductOptions/types'
import { getBrandFromPathname } from '../_config/brands'
import { prefixFooterColumns, prefixNavLinks, withBrandPrefix } from '../_config/brandPaths'
import { DEFAULT_FOOTER_COLUMNS, DEFAULT_NAV_LINKS, DEFAULT_TOPLINE } from '../_config/siteContent'
import { OPTION_GROUPS } from '../product/[id]/_data/optionGroups'
import styles from './option-categories.module.css'

// ─── Demo config ───────────────────────────────────────────────────────────────

/** The product showcase groups, so this page and the product page never drift. */
function showcaseGroup(id: string): ChoiceGroup {
  const group = OPTION_GROUPS.find((g) => g.id === id)
  if (!group || !isChoiceGroup(group)) throw new Error(`No choice group "${id}" in OPTION_GROUPS`)
  return group
}

const DRAWER = showcaseGroup('drawer')
const SWATCH_SM = showcaseGroup('carousel-swatch-sm')
const SWATCH_LG = showcaseGroup('carousel-swatch-lg')
const CAROUSEL_TEXT = showcaseGroup('carousel-text')
const CAROUSEL_BIG = showcaseGroup('carousel-big')
const CAROUSEL_STANDARD = showcaseGroup('carousel-standard')

/** LAL Music Memories — the record's center color. Swatch colors are product content. */
const CENTER_COLOR: ChoiceGroup = {
  id: 'center-color',
  label: 'Color of the center',
  display: 'grid',
  tile: 'image-only',
  size: 'lg',
  values: [
    { id: 'purple', label: 'Purple', swatchColor: '#A46C93' },
    { id: 'orange', label: 'Orange', swatchColor: '#DC7957' },
    { id: 'blue', label: 'Blue', swatchColor: '#57BADD' },
    { id: 'green', label: 'Green', swatchColor: '#91A36B' },
  ],
}

/** A copy of the group with some values unavailable. */
function withDisabled(group: ChoiceGroup, ids: string[]): ChoiceGroup {
  return { ...group, values: group.values.map((v) => (ids.includes(v.id) ? { ...v, disabled: true } : v)) }
}

// ─── Layout helpers ────────────────────────────────────────────────────────────

/** One option category: a title, where it lives in the product, and its states. */
function Specimen({ id, title, source, children }: { id: string; title: string; source: string; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={styles.sectionHead}>
        <h2 id={id} className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionNote}>{source}</p>
      </div>
      <div className={styles.states}>{children}</div>
    </section>
  )
}

/** One state of an option group — the live component, holding its own selection. */
function State({ label, group, initial }: { label: string; group: ChoiceGroup; initial?: string }) {
  const [value, setValue] = useState(initial ?? group.defaultValueId ?? group.values.find((v) => !v.disabled)?.id ?? '')
  return (
    <div className={styles.state}>
      <p className={styles.stateLabel}>{label}</p>
      {group.display === 'drawer'
        ? <OptionDrawer group={group} value={value} onChange={setValue} />
        : <OptionRadioGroup group={group} value={value} onChange={setValue} />}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OptionCategoriesPage() {
  const pathname = usePathname()
  const brand = getBrandFromPathname(pathname)

  const navLinks = prefixNavLinks(brand, DEFAULT_NAV_LINKS)
  const footerColumns = prefixFooterColumns(brand, DEFAULT_FOOTER_COLUMNS)
  const topline = {
    ...DEFAULT_TOPLINE,
    helpHref:  withBrandPrefix(brand, DEFAULT_TOPLINE.helpHref),
    trackHref: withBrandPrefix(brand, DEFAULT_TOPLINE.trackHref),
    contactHref: withBrandPrefix(brand, DEFAULT_TOPLINE.contactHref),
  }

  return (
    <div className={styles.page}>
      <Header variant="white" brand={brand} navLinks={navLinks} topline={topline} />

      <main className={styles.content}>
        <div>
          <h1 className={styles.pageTitle}>Option Categories</h1>
          <p className={styles.intro}>
            Every way a product option can be picked, in each of its states. Each one is the live
            ProductOptions component reading the same config as the product page, so changing a
            token or a tile here changes it everywhere. Click to select; Tab in and use the arrow
            keys to see the focus ring.
          </p>
        </div>

        {/* ── Color swatches ── */}
        <Specimen id="oc-swatch" title="Color swatches" source="Open grid · image-only tile, large · LAL Music Memories center color">
          <State label="Default" group={CENTER_COLOR} />
          <State label="Selected" group={CENTER_COLOR} initial="orange" />
          <State label="With unavailable value" group={withDisabled(CENTER_COLOR, ['green'])} initial="orange" />
        </Specimen>

        {/* ── Drawer ── */}
        <Specimen id="oc-drawer" title="Drawer" source="OptionDrawer · big square tiles in a side drawer (bottom sheet on mobile)">
          <State label="Default" group={DRAWER} />
          <State label="Selected" group={DRAWER} initial="coin" />
        </Specimen>

        {/* ── Carousel – standard image only ── */}
        <Specimen id="oc-swatch-sm" title="Carousel — Standard Image Only" source="Carousel · image-only tile, small · birthstones">
          <State label="Default" group={SWATCH_SM} />
          <State label="Selected" group={SWATCH_SM} initial="apr" />
          <State label="With unavailable value" group={withDisabled(SWATCH_SM, ['feb'])} initial="apr" />
        </Specimen>

        {/* ── Carousel – big image only ── */}
        <Specimen id="oc-swatch-lg" title="Carousel — Big Image Only" source="Carousel · image-only tile, large · birthstones">
          <State label="Default" group={SWATCH_LG} />
          <State label="Selected" group={SWATCH_LG} initial="apr" />
          <State label="With unavailable value" group={withDisabled(SWATCH_LG, ['may'])} initial="apr" />
        </Specimen>

        {/* ── Carousel – no image ── */}
        <Specimen id="oc-text" title="Carousel — No Image" source="Carousel · text tile · chain length, with price deltas">
          <State label="Default" group={CAROUSEL_TEXT} />
          <State label="Selected" group={CAROUSEL_TEXT} initial="18-20" />
          <State label="With unavailable value" group={CAROUSEL_TEXT} initial="16-18" />
        </Specimen>

        {/* ── Carousel – big image ── */}
        <Specimen id="oc-big" title="Carousel — Big Image" source="Carousel · big tile, circle image · colors">
          <State label="Default" group={CAROUSEL_BIG} />
          <State label="Selected" group={CAROUSEL_BIG} initial="white" />
          <State label="With unavailable value" group={withDisabled(CAROUSEL_BIG, ['blue'])} initial="white" />
        </Specimen>

        {/* ── Carousel – standard image ── */}
        <Specimen id="oc-standard" title="Carousel — Standard Image" source="Carousel · standard tile · birth flowers">
          <State label="Default" group={CAROUSEL_STANDARD} />
          <State label="Selected" group={CAROUSEL_STANDARD} initial="flower-4" />
          <State label="With unavailable value" group={withDisabled(CAROUSEL_STANDARD, ['flower-5'])} initial="flower-4" />
        </Specimen>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}
