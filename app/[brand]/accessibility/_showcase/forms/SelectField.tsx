'use client'

import { useId, type SelectHTMLAttributes } from 'react'
import tokens from '../proposed-tokens.module.css'
import { useBrandIcons } from '../useBrandIcons'
import { FieldMessage } from './FieldMessage'
import styles from './forms.module.css'
import choice from './choices.module.css'

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className'> {
  label: string
  options: { value: string; label: string }[]
  hint?: string
  error?: string
  demoState?: 'hover' | 'focus'
}

/** A native <select> — keyboard, screen reader and mobile pickers for free — styled to match. */
export function SelectField({ label, options, hint, error, demoState, required, ...native }: SelectFieldProps) {
  const id = useId()
  const { DropdownIcon } = useBrandIcons()
  const describedBy = [hint && `${id}-hint`, error && `${id}-message`].filter(Boolean).join(' ')

  return (
    <div className={`${styles.field} ${demoState === 'focus' ? tokens.forceFocus : ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}> (required)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={choice.selectWrap}>
        <select
          {...native}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`${styles.control} ${choice.select} ${tokens.ringField} ${demoState === 'hover' ? styles.isHover : ''}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={choice.selectIcon} aria-hidden="true">
          <DropdownIcon className={choice.icon} />
        </span>
      </div>
      {error && (
        <FieldMessage id={`${id}-message`} tone="error">
          {error}
        </FieldMessage>
      )}
    </div>
  )
}
