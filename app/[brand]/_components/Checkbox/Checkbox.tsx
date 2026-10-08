'use client'

import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'
import styles from './Checkbox.module.css'

export interface CheckboxIcons {
  CheckboxIcon:  React.ComponentType<IconProps>
  CheckmarkIcon: React.ComponentType<IconProps>
}

interface CheckboxProps {
  checked:   boolean
  onChange:  (checked: boolean) => void
  /** Resolved by the caller through BRAND_ICONS, as every shared component does. */
  icons:     CheckboxIcons
  /** The label beside the box. Omit it and pass `aria-label` instead. */
  children?: React.ReactNode
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

/**
 * The project's checkbox, drawn from the theme's own icons.
 *
 * Every brand's CheckboxIcon is a circle outline, so checked is that circle
 * filled with an inverse checkmark — the shape the floating cart and the cart
 * page have always drawn. A native input underneath keeps the semantics,
 * keyboard behaviour and form participation that a pair of icons alone would
 * throw away; it is invisible rather than absent.
 */
export function Checkbox({
  checked, onChange, icons, children, disabled = false, className, ...rest
}: CheckboxProps) {
  const { CheckboxIcon, CheckmarkIcon } = icons

  return (
    <label className={[styles.root, className].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={event => onChange(event.target.checked)}
        {...rest}
      />

      <span className={styles.box} aria-hidden="true">
        {checked ? (
          <span className={styles.checked}><CheckmarkIcon size={12} /></span>
        ) : (
          <CheckboxIcon size={24} />
        )}
      </span>

      {children && <span className={styles.label}>{children}</span>}
    </label>
  )
}
