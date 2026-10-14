'use client'

import { useId } from 'react'
import type { ChoiceGroup } from './types'
import { GroupLabel } from './GroupLabel'
import { OptionTile } from './OptionTile'
import { ScrollRow } from './ScrollRow'
import { useRovingFocus } from './useRovingFocus'
import styles from './ProductOptions.module.css'

/**
 * `carousel` and `grid` — every value visible, as a radio group: one tab
 * stop, arrow keys move and select (skipping disabled values).
 */
export function OptionRadioGroup({ group, value, onChange }: { group: ChoiceGroup; value: string; onChange: (id: string) => void }) {
  const id = useId()
  const labelId = `${id}-label`
  const tile = group.tile ?? 'text'
  const isCarousel = group.display === 'carousel'
  const selectedIndex = Math.max(0, group.values.findIndex((v) => v.id === value))

  const roving = useRovingFocus({
    count: group.values.length,
    initialIndex: selectedIndex,
    orientation: isCarousel ? 'horizontal' : 'grid',
    isDisabled: (i) => Boolean(group.values[i]?.disabled),
    onMove: (i) => onChange(group.values[i].id),
  })

  const tiles = group.values.map((v, i) => (
    <div key={v.id} className={styles.slot}>
      <OptionTile
        ref={roving.register(i)}
        value={v}
        tile={tile}
        role="radio"
        selected={v.id === value}
        tabIndex={i === roving.focusIndex ? 0 : -1}
        size={group.size}
        imageShape={group.imageShape}
        onSelect={() => {
          roving.setFocusIndex(i)
          onChange(v.id)
        }}
        onKeyDown={(e) => roving.onKeyDown(e, i)}
      />
    </div>
  ))

  const label = <GroupLabel id={labelId} group={group} valueLabel={group.values[selectedIndex]?.label} />
  const rowProps = { role: 'radiogroup', 'aria-labelledby': labelId }
  const sizeClass = tile === 'image-only' ? styles[`tiles_image-only_${group.size ?? 'sm'}`] : styles[`tiles_${tile}`]

  if (isCarousel) {
    return (
      <ScrollRow label={label} rowProps={rowProps} rowClassName={`${styles.carousel} ${sizeClass}`}>
        {tiles}
      </ScrollRow>
    )
  }

  return (
    <div className={styles.group}>
      {label}
      <div {...rowProps} className={`${styles.grid} ${styles[`grid_${tile}`]} ${sizeClass}`}>
        {tiles}
      </div>
    </div>
  )
}
