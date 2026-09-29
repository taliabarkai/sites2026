'use client'

import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './Field.module.css'

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /**
   * Always supplied, always programmatic.
   *
   * In the `placeholder` variant the design puts the name inside the field as
   * placeholder text, which leaves a screen reader nothing to read once typing
   * starts — so the label is rendered and visually hidden rather than replaced
   * by the placeholder. In the `floating` variant it is visible throughout.
   */
  label: string
  /**
   * `placeholder` — hidden label, name shown as the input's placeholder.
   * `floating`    — the label sits in the field, centred while it is empty and
   *                 rising to the top once there is a value to show beneath it.
   */
  variant?: 'placeholder' | 'floating'
  /** Shown under the field and wired to it through aria-describedby. */
  error?: string
  /**
   * Marks the field invalid without a message of its own — for when the reason
   * is stated once above the form rather than per field.
   */
  invalid?: boolean
  /** Shown under the field when there is no error to show instead. */
  hint?: string
  /** Sits at the right-hand end of a floating field, e.g. a show/hide toggle. */
  trailing?: ReactNode
}

/**
 * A labelled text input, styled from the form-field tokens.
 *
 * Two shapes, one control: the lookup form wants the name as placeholder text,
 * the auth modal wants it visible in the field. Both keep a real <label>.
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({
  label, variant = 'placeholder', error, invalid, hint, trailing, className, ...input
}, ref) {
  const id        = useId()
  const errorId   = `${id}-error`
  const hintId    = `${id}-hint`
  const described = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')
  const isInvalid = Boolean(error) || Boolean(invalid)
  const floating  = variant === 'floating'

  const field = (
    <input
      {...input}
      ref={ref}
      id={id}
      /* A space, not empty: :placeholder-shown is what tells the label whether
         to sit centred or rise, and it only matches when a placeholder exists. */
      placeholder={floating ? ' ' : input.placeholder}
      className={`${floating ? styles.floatInput : styles.input} ${isInvalid ? styles.inputInvalid : ''}`}
      aria-invalid={isInvalid ? true : undefined}
      aria-describedby={described || undefined}
    />
  )

  return (
    <div className={className ? `${styles.field} ${className}` : styles.field}>
      {floating ? (
        <div className={`${styles.control} ${isInvalid ? styles.controlInvalid : ''}`}>
          {field}
          <label htmlFor={id} className={styles.floatLabel}>{label}</label>
          {trailing && <span className={styles.trailing}>{trailing}</span>}
        </div>
      ) : (
        <>
          <label htmlFor={id} className={styles.label}>{label}</label>
          {field}
        </>
      )}

      {error && <p id={errorId} className={styles.error}>{error}</p>}
      {hint && !error && <p id={hintId} className={styles.hint}>{hint}</p>}
    </div>
  )
})
