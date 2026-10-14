'use client'

import { useId, type ReactNode } from 'react'
import type { TextInputGroup } from './types'
import styles from './ProductOptions.module.css'

/** `text-input` — a text field with a live "4/8" counter inside it, on the right. */
export function TextInputOption({
  group,
  value,
  onChange,
  children,
}: {
  group: TextInputGroup
  value: string
  onChange: (value: string) => void
  /** Rendered under the field (e.g. a helper the page attaches to it). */
  children?: ReactNode
}) {
  const id = useId()
  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.groupLabel}>
        {group.label}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          type="text"
          value={value}
          maxLength={group.maxLength}
          placeholder={group.placeholder}
          aria-describedby={`${id}-count`}
          className={styles.input}
          onChange={(e) => onChange(e.target.value.slice(0, group.maxLength))}
        />
        <span id={`${id}-count`} className={styles.counter}>
          <span className={styles.visuallyHidden}>Characters used: </span>
          {value.length}/{group.maxLength}
        </span>
      </div>
      {children}
    </div>
  )
}
