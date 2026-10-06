'use client'

import { useState } from 'react'
import { ShowcaseCard } from '../ShowcaseCard'
import { useShowcaseView } from '../ShowcaseView'
import { VariantGroup, type VariantOption } from '../variants/VariantGroup'
import variants from '../variants/variants.module.css'

// ─── Material selector ─────────────────────────────────────────────────────

interface Material extends VariantOption {
  label: string
  price: string
  color: string
}

// Sold out is hidden for now; flip to bring the 14k tile and the state back.
const SHOW_SOLD_OUT = false

const ALL_MATERIALS: Material[] = [
  { value: 'silver', label: '925 Sterling Silver', price: '$125', color: 'var(--sterling-silver-925)', name: '925 Sterling Silver, $125' },
  { value: 'gold', label: 'Gold Plated', price: '$145', color: 'var(--gold-vermeil-18k)', name: 'Gold Plated, $145' },
  { value: 'solid', label: '14k Solid Gold', price: '$285', color: 'var(--solid-gold-14k)', name: '14k Solid Gold, $285', soldOut: true },
]

const MATERIALS = SHOW_SOLD_OUT ? ALL_MATERIALS : ALL_MATERIALS.filter((m) => !m.soldOut)

const renderMaterial = (material: Material) => (
  <>
    <span className={variants.optionSwatch} style={{ background: material.color }} aria-hidden="true" />
    <span>
      <span className={variants.optionName}>{material.label}</span>
      <span className={variants.optionPrice}>{material.soldOut ? 'Sold out' : material.price}</span>
    </span>
  </>
)

/** One Gold Plated tile, for the states row. */
function GoldTile({ selected, focused, soldOut }: { selected?: boolean; focused?: boolean; soldOut?: boolean }) {
  const gold = { ...ALL_MATERIALS[1], soldOut }
  return (
    <VariantGroup
      kind="option"
      label="Select material"
      hideLabel
      showValue={false}
      options={[gold]}
      defaultValue={selected ? gold.value : ''}
      renderOption={renderMaterial}
      demoFocusValue={focused ? gold.value : undefined}
    />
  )
}

/** Production, from the live product page: tiles with a #949494 border. */
function TodayMaterials() {
  const [selected, setSelected] = useState('gold')
  return (
    <div className={variants.group}>
      <p className={variants.groupLabel}>Select material:</p>
      <div className={variants.todayOptionRow}>
        {MATERIALS.filter((m) => !m.soldOut).map((material) => (
          <button
            key={material.value}
            type="button"
            aria-pressed={selected === material.value}
            onClick={() => setSelected(material.value)}
            className={variants.todayOption}
          >
            <span className={variants.optionSwatch} style={{ background: material.color }} aria-hidden="true" />
            <span className={variants.optionName}>{material.label}</span>
            <span className={variants.optionPrice}>{material.price}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function MaterialSelectorCard() {
  const { isAfter } = useShowcaseView()
  return (
    <ShowcaseCard
      id="material-selector"
      title="Material selector"
      criteria={['1.4.11 Non-text Contrast', '1.4.1 Use of Color', '2.1.1 Keyboard', '2.4.7 Focus Visible', '4.1.2 Name, Role, Value']}
      notes={{
        before:
          'From the live product page: a #949494 border (3.03:1 on white, 2.86:1 on the grey surface) and selected shown by a 1px darker border, a fill and bold text.',
        after:
          'A radio group: Tab reaches the selected tile, arrow keys move and select, Tab leaves. 3:1 borders on every surface; selected is a 2px edge, a light fill and bold text; focus is the 2px ring on the edge. Each tile is read as "Gold Plated, $145".',
      }}
      dos={[
        'Use the radio group pattern: one tab stop, arrow keys to choose.',
        'Read the name and price together as the tile’s name.',
        'Show selected with more than color: a 2px edge and bold text, plus the fill.',
              ]}
      donts={[
        "Don't make every tile its own tab stop.",
        "Don't use a border lighter than --border-interactive on grey surfaces.",
      ]}
      states={[
        { label: 'Unselected', content: <GoldTile /> },
        { label: 'Selected', content: <GoldTile selected /> },
        { label: 'Focus', content: <GoldTile focused /> },
        { label: 'Selected, with focus', content: <GoldTile selected focused /> },
        ...(SHOW_SOLD_OUT ? [{ label: 'Sold out', content: <GoldTile soldOut /> }] : []),
      ]}
    >
      {isAfter ? (
        <VariantGroup kind="option" label="Select material" showValue={false} options={MATERIALS} defaultValue="gold" renderOption={renderMaterial} />
      ) : (
        <TodayMaterials />
      )}
    </ShowcaseCard>
  )
}
