'use client'

/* eslint-disable @next/next/no-img-element */

import { useLayoutEffect, useRef, useState } from 'react'
import { getBrandGiftAssets } from '../../../_config/brands'
import { PRODUCTS } from '../../../_config/products'
import { ShowcaseCard } from '../ShowcaseCard'
import { useShowcaseView } from '../ShowcaseView'
import { contrastRatio, resolveColor } from '../contrast'
import { VariantGroup, type VariantOption } from './VariantGroup'
import styles from './variants.module.css'

// ─── Data ──────────────────────────────────────────────────────────────────

interface Metal extends VariantOption {
  color: string
  price: string
}

const METALS: Metal[] = [
  { value: 'silver', name: 'Sterling silver', color: 'var(--sterling-silver-925)', price: '$120' },
  { value: 'vermeil', name: '18k gold vermeil', color: 'var(--gold-vermeil-18k)', price: '$130' },
  { value: 'solid', name: '14k solid gold', color: 'var(--solid-gold-14k)', price: '$170', soldOut: true },
  { value: 'rose', name: '18k rose gold plating', color: 'var(--rose-gold-plating-18k)', price: '$135' },
]

interface Charm extends VariantOption {
  image: string
}

const productImage = (id: number) => PRODUCTS.find((p) => p.id === id)?.defaultImage ?? ''

const CHARMS: Charm[] = [
  { value: 'compass', name: 'Compass charm', image: productImage(2) },
  { value: 'tag', name: 'Willow tag charm', image: productImage(3) },
  { value: 'heart', name: 'Heart charm', image: productImage(6), soldOut: true },
  { value: 'lock', name: 'Lock charm', image: productImage(7) },
]

const LENGTHS: VariantOption[] = [
  { value: '14', name: '14"' },
  { value: '16', name: '16"' },
  { value: '18', name: '18"' },
  { value: '20', name: '20"' },
  { value: '24', name: '24"', soldOut: true },
]

interface Box extends VariantOption {
  image: string
  meta: string
}

// The gift box designs live in the TGR/MNN gifting config; borrowed for every brand here.
const giftAssets = getBrandGiftAssets('tgr')
const BOXES: Box[] = [
  { value: 'classic', name: 'Classic box', meta: 'Included', image: giftAssets?.classicGiftImage ?? '' },
  ...(giftAssets?.designOptions ?? [])
    .filter((option) => option.image)
    .map((option) => ({ value: option.key, name: option.label, meta: '+$5', image: option.image as string })),
]

// ─── Shared bits ───────────────────────────────────────────────────────────

const renderSwatch = (metal: Metal) => <span className={styles.swatchFill} style={{ background: metal.color }} />

// The name is already the button's accessible name, so the image is decoration.
const renderImage = (charm: Charm) => <img src={charm.image} alt="" className={styles.image} loading="lazy" />

const renderChip = (length: VariantOption) => length.name

const renderTile = (box: Box) => (
  <>
    <img src={box.image} alt="" className={styles.tileImage} loading="lazy" />
    <span className={styles.tileName}>{box.name}</span>
    <span className={styles.tileMeta}>{box.meta}</span>
  </>
)

const NOTES_AFTER =
  'A radio group: Tab reaches the selected option, arrow keys move and select, Tab leaves. Selected shows a thicker edge and a checkmark; sold out is crossed through and says so.'

const DOS = [
  'Use the radio group pattern: one tab stop, arrow keys to choose.',
  'Give unselected options a border of at least 3:1.',
  'Show selected with a thicker edge and a checkmark, and name it next to the label.',
]

const DONTS = [
  "Don't make every option its own tab stop.",
  "Don't show selected with a fill or border color alone.",
  "Don't hide sold-out options; cross them out and say \"Sold out\".",
]

/** Production: buttons with aria-pressed, each its own tab stop, no focus style. */
function useToday(defaultValue: string) {
  const [selected, setSelected] = useState(defaultValue)
  return {
    pressed: (value: string) => ({
      'aria-pressed': selected === value,
      onClick: () => setSelected(value),
    }),
    selected,
  }
}

// ─── Color swatches ────────────────────────────────────────────────────────

function TodaySwatches() {
  const { pressed, selected } = useToday('vermeil')
  return (
    <div className={styles.group}>
      <p className={styles.groupLabel}>
        Metal Type: <span className={styles.groupValue}>{METALS.find((m) => m.value === selected)?.name}</span>
      </p>
      <div className={styles.todayRow}>
        {METALS.map((metal) => (
          <button
            key={metal.value}
            type="button"
            aria-label={`${metal.name}, ${metal.price}`}
            className={styles.todaySwatchBtn}
            {...pressed(metal.value)}
          >
            <span className={styles.todaySwatchCircle} style={{ background: metal.color }} aria-hidden="true" />
            <span className={styles.todayPrice}>{metal.price}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function ColorSwatchCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="color-swatches"
      title="Color swatches"
      criteria={['1.4.11 Non-text Contrast', '1.4.1 Use of Color', '2.1.1 Keyboard', '4.1.2 Name, Role, Value']}
      notes={{
        before:
          'Product page metal: aria-pressed buttons, each its own tab stop, a #ebebeb border (1.19:1), no focus style, and no sold-out state.',
        after: NOTES_AFTER,
      }}
      dos={DOS}
      donts={DONTS}
      states={[
        { label: 'Selected', content: <VariantGroup kind="swatch" label="Metal" options={METALS} defaultValue="vermeil" renderOption={renderSwatch} /> },
        {
          label: 'Focus on an unselected swatch',
          content: <VariantGroup kind="swatch" label="Metal" options={METALS} defaultValue="vermeil" renderOption={renderSwatch} demoFocusValue="silver" />,
        },
        {
          label: 'Focus on the selected swatch',
          content: <VariantGroup kind="swatch" label="Metal" options={METALS} defaultValue="vermeil" renderOption={renderSwatch} demoFocusValue="vermeil" />,
        },
      ]}
    >
      {isAfter ? (
        <VariantGroup kind="swatch" label="Metal" options={METALS} defaultValue="vermeil" renderOption={renderSwatch} />
      ) : (
        <TodaySwatches />
      )}
    </ShowcaseCard>
  )
}

// ─── Image swatches ────────────────────────────────────────────────────────

export function ImageSwatchCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="image-swatches"
      title="Image swatches"
      criteria={['1.1.1 Non-text Content', '1.4.11 Non-text Contrast', '2.1.1 Keyboard']}
      notes={{
        before: 'Not on the site today: no picker uses product images as swatches.',
        after:
          'The same radio group with thumbnails. Each is named by its button ("Compass charm"); the image itself has empty alt so the name isn’t read twice.',
      }}
      dos={[...DOS.slice(0, 1), 'Name the option on the button and give the thumbnail empty alt.']}
      donts={["Don't repeat the name in the image alt and a visible label.", DONTS[2]]}
      states={[
        {
          label: 'Focus',
          content: <VariantGroup kind="image" label="Charm" options={CHARMS} defaultValue="compass" renderOption={renderImage} demoFocusValue="tag" />,
        },
      ]}
    >
      {isAfter ? (
        <VariantGroup kind="image" label="Charm" options={CHARMS} defaultValue="compass" renderOption={renderImage} />
      ) : (
        <p className={styles.groupLabel}>There&rsquo;s no image swatch picker on the site today.</p>
      )}
    </ShowcaseCard>
  )
}

// ─── Text chips ────────────────────────────────────────────────────────────

function TodayChips() {
  const { pressed } = useToday('18')
  return (
    <div className={styles.group}>
      <p className={styles.groupLabel}>Choose size</p>
      <div className={styles.todayRow}>
        {LENGTHS.map((length) => (
          <button key={length.value} type="button" className={styles.todayPill} {...pressed(length.value)}>
            {length.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TextChipCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="text-chips"
      title="Text chips"
      criteria={['1.4.11 Non-text Contrast', '1.4.1 Use of Color', '2.1.1 Keyboard']}
      notes={{
        before:
          'Canvas size pills: aria-pressed buttons, a #ebebeb border, selected shown by a light fill and a darker border only, and no focus style.',
        after: `${NOTES_AFTER} Selected chips are bold too.`,
      }}
      dos={DOS}
      donts={DONTS}
      states={[
        { label: 'Selected and sold out', content: <VariantGroup kind="chip" label="Length" options={LENGTHS} defaultValue="18" renderOption={renderChip} /> },
        {
          label: 'Focus',
          content: <VariantGroup kind="chip" label="Length" options={LENGTHS} defaultValue="18" renderOption={renderChip} demoFocusValue="20" />,
        },
      ]}
    >
      {isAfter ? (
        <VariantGroup kind="chip" label="Length" options={LENGTHS} defaultValue="18" renderOption={renderChip} />
      ) : (
        <TodayChips />
      )}
    </ShowcaseCard>
  )
}

// ─── Image and text tiles ──────────────────────────────────────────────────

function TodayTiles() {
  const { pressed } = useToday('classic')
  return (
    <div className={styles.group}>
      <p className={styles.groupLabel}>Choose a design</p>
      <div role="group" aria-label="Choose a design" className={styles.todayTiles}>
        {BOXES.map((box) => (
          <button key={box.value} type="button" className={styles.todayTile} {...pressed(box.value)}>
            {/* Production gives the image alt text and a visible label: the name is read twice */}
            <img src={box.image} alt={box.name} className={styles.tileImage} loading="lazy" />
            <span>{box.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function TileCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="variant-tiles"
      title="Image and text tiles"
      criteria={['1.1.1 Non-text Content', '1.4.11 Non-text Contrast', '1.4.1 Use of Color', '2.1.1 Keyboard']}
      notes={{
        before:
          'Gift packaging designs: aria-pressed buttons, the name read twice (image alt and label), and selected shown only by a darker 1px border.',
        after: NOTES_AFTER,
      }}
      dos={DOS}
      donts={DONTS}
      states={[
        {
          label: 'Focus',
          content: <VariantGroup kind="tile" label="Gift box" options={BOXES.slice(0, 2)} defaultValue="classic" renderOption={renderTile} demoFocusValue={BOXES[1]?.value} />,
        },
      ]}
    >
      {isAfter ? (
        <VariantGroup kind="tile" label="Gift box" options={BOXES} defaultValue="classic" renderOption={renderTile} />
      ) : (
        <TodayTiles />
      )}
    </ShowcaseCard>
  )
}

// ─── Border comparison ─────────────────────────────────────────────────────

/** Measures one border color against the page background, live. */
function useRatio(variable: string) {
  const probeRef = useRef<HTMLSpanElement>(null)
  const [ratio, setRatio] = useState<number | null>(null)

  useLayoutEffect(() => {
    const probe = probeRef.current
    if (!probe) return
    const fg = resolveColor(probe, variable)
    const bg = resolveColor(probe, '--colors-background')
    setRatio(fg && bg ? contrastRatio(fg, bg) : null)
  }, [variable])

  return { probeRef, ratio }
}

function BorderColumn({ title, variable }: { title: string; variable: string }) {
  const { probeRef, ratio } = useRatio(variable)
  const passes = ratio !== null && ratio >= 3

  return (
    <div className={styles.compareColumn}>
      <span ref={probeRef} hidden />
      <p className={styles.compareTitle}>{title}</p>
      <div className={styles.compareRow} aria-hidden="true">
        {METALS.slice(0, 3).map((metal) => (
          <span key={metal.value} className={styles.compareSwatch} style={{ borderColor: `var(${variable})`, background: metal.color }} />
        ))}
      </div>
      <div className={styles.compareRow} aria-hidden="true">
        {LENGTHS.slice(0, 3).map((length) => (
          <span key={length.value} className={styles.compareChip} style={{ borderColor: `var(${variable})` }}>
            {length.name}
          </span>
        ))}
      </div>
      <p className={styles.compareRatio}>
        {ratio === null ? '—' : `${ratio.toFixed(2)}:1 against the page.`} {ratio !== null && (passes ? 'Passes 3:1.' : 'Fails 3:1.')}
      </p>
    </div>
  )
}

export function BorderComparisonCard() {
  return (
    <ShowcaseCard
      id="border-comparison"
      title="Unselected border: today and proposed"
      criteria={['1.4.11 Non-text Contrast']}
      notes={{
        before: 'This card shows both borders side by side in either view, measured live in the current brand.',
        after: 'This card shows both borders side by side in either view, measured live in the current brand.',
      }}
      dos={['Use --border-interactive for anything a customer has to find and press.']}
      donts={["Don't use --border-color (#ebebeb) for the edge of a control; keep it for dividers."]}
    >
      <div className={styles.compare}>
        <BorderColumn title="Today: --border-color" variable="--border-color" />
        <BorderColumn title="Proposed: --border-interactive" variable="--border-interactive-proposed" />
      </div>
    </ShowcaseCard>
  )
}
