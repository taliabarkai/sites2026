'use client'

import { useId } from 'react'
import type { ChoiceGroup } from './types'
import { formatPrice } from './format'
import { useOptionIcons } from './useOptionIcons'
import styles from './ProductOptions.module.css'

/** `select` — a native dropdown, text only. */
export function OptionSelect({ group, value, onChange }: { group: ChoiceGroup; value: string; onChange: (id: string) => void }) {
  const id = useId()
  const { DropdownIcon } = useOptionIcons()

  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.groupLabel}>
        {group.label}
      </label>
      <div className={styles.selectWrap}>
        <select id={id} value={value} className={styles.select} onChange={(e) => onChange(e.target.value)}>
          {group.values.map((v) => (
            <option key={v.id} value={v.id} disabled={v.disabled}>
              {v.label}
              {v.priceDelta ? ` (+${formatPrice(v.priceDelta)})` : ''}
            </option>
          ))}
        </select>
        <span className={styles.selectArrow} aria-hidden="true">
          <DropdownIcon size={24} />
        </span>
      </div>
    </div>
  )
}
