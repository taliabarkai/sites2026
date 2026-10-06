'use client'

import { useId, useState, type FormEvent } from 'react'
import { useShowcaseView } from '../ShowcaseView'
import { FieldMessage } from '../forms/FieldMessage'
import { useBrandIcons } from '../useBrandIcons'
import styles from './FieldWithButton.module.css'

export interface FieldWithButtonProps {
  label: string
  /** The button's accessible name: "Apply promo code", "Subscribe". */
  buttonLabel: string
  type?: 'text' | 'email'
  autoComplete?: string
  defaultValue?: string
  /** "footer" sits on the newsletter background, with the ring in its text color. */
  surface?: 'page' | 'footer'
  /** Returns an error message, or null when the value is fine. */
  validate: (value: string) => string | null
  success: (value: string) => string
  /** Static review copies: draw a state without real focus. */
  demoState?: 'focus' | 'buttonFocus'
  demoError?: string
}

/**
 * A text field and its button as one control: the promo code, and the
 * newsletter signup in the footer.
 *
 * Before (live site): the ring wraps only the text field, so the button cuts
 * it off at one end.
 * After: while the text field has focus, the ring wraps the whole row —
 * field and button — and follows the row's shape. The button has its own
 * ring, a light line inside it, and the row doesn't light up for it, so it's
 * always clear which part has focus.
 */
export function FieldWithButton({
  label,
  buttonLabel,
  type = 'text',
  autoComplete,
  defaultValue = '',
  surface = 'page',
  validate,
  success,
  demoState,
  demoError,
}: FieldWithButtonProps) {
  const id = useId()
  const messageId = `${id}-message`
  const { isAfter } = useShowcaseView()
  const { ArrowIcon } = useBrandIcons()
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState(demoError ?? '')
  const [done, setDone] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const problem = validate(value.trim())
    setError(problem ?? '')
    setDone(problem ? '' : success(value.trim()))
  }

  const rowClass = [
    styles.row,
    isAfter ? styles.proposed : styles.today,
    demoState === 'focus' && styles.isFocused,
    demoState === 'buttonFocus' && styles.isButtonFocused,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={surface === 'footer' ? styles.footer : undefined}>
      <form noValidate onSubmit={onSubmit} className={styles.form}>
        <div className={rowClass}>
          <div className={styles.field}>
            <label htmlFor={id} className={styles.label}>
              {label}
            </label>
            <input
              id={id}
              type={type}
              autoComplete={autoComplete}
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                setError('')
                setDone('')
              }}
              aria-invalid={isAfter && error ? true : undefined}
              aria-describedby={isAfter && (error || done) ? messageId : undefined}
              className={styles.input}
            />
          </div>
          <button type="submit" aria-label={buttonLabel} className={styles.button}>
            <ArrowIcon className={styles.icon} />
          </button>
        </div>
        {isAfter && error && (
          <div className={styles.message} role="alert">
            <FieldMessage id={messageId} tone="error">
              {error}
            </FieldMessage>
          </div>
        )}
        {isAfter && done && !error && (
          <div className={styles.message} role="status">
            <FieldMessage id={messageId} tone="success">
              {done}
            </FieldMessage>
          </div>
        )}
        {!isAfter && (error || done) && (
          <p role="alert" className={styles.todayMessage}>
            {error || done}
          </p>
        )}
      </form>
    </div>
  )
}
