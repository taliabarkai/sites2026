'use client'

import { useId } from 'react'
import { usePathname } from 'next/navigation'
import { getBrandFromPathname } from '../../_config/brands'
import * as oalIcons from '@/src/components/icons/oal'
import * as mnnIcons from '@/src/components/icons/mnn'
import * as tgrIcons from '@/src/components/icons/tgr'
import * as lalIcons from '@/src/components/icons/lal'
import * as ibIcons  from '@/src/components/icons/ib'
import styles from './VariantToggle.module.css'

const BRAND_ICONS = {
  oal: oalIcons, mnn: mnnIcons, tgr: tgrIcons, lal: lalIcons, ib: ibIcons,
} as const

export interface VariantToggleOption<T extends string> {
  value: T
  label: string
}

export interface VariantToggleProps<T extends string> {
  /** Accessible name for the control, e.g. "Shop The Look banner preview". */
  label: string
  /** Short visible prefix that marks this as a design-preview control. */
  prefix?: string
  options: VariantToggleOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/**
 * Design-preview variant picker — a native select (keyboard, screen reader and
 * mobile pickers for free) styled like the Quick Add dropdown.
 */
export function VariantToggle<T extends string>({
  label,
  prefix = 'Preview',
  options,
  value,
  onChange,
  className,
}: VariantToggleProps<T>) {
  const id = useId()
  const { ChevronIcon } = BRAND_ICONS[getBrandFromPathname(usePathname())]

  return (
    <div className={`${styles.root} ${className ?? ''}`}>
      {prefix && <span className={styles.prefix} aria-hidden="true">{prefix}</span>}
      <div className={styles.selectWrap}>
        <select
          id={id}
          aria-label={label}
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className={styles.arrow} aria-hidden="true">
          <ChevronIcon size={16} />
        </span>
      </div>
    </div>
  )
}
