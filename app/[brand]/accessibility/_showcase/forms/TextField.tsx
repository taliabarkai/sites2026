'use client'

import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from 'react'
import tokens from '../proposed-tokens.module.css'
import { FieldMessage } from './FieldMessage'
import styles from './forms.module.css'

type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className' | 'size'>

export interface TextFieldProps extends NativeProps {
  label: string
  hint?: string
  error?: string
  success?: string
  /** A textarea instead of a single-line input. */
  multiline?: boolean
  /** Show "x of max characters" and announce what's left (needs maxLength). */
  counter?: boolean
  /** Static review copies: draw a state without real interaction. */
  demoState?: 'hover' | 'focus'
  /** A fixed id, for when something else links to the field (an error summary). */
  inputId?: string
}

/**
 * The proposed text field. Label always visible above; "(required)" in words;
 * hint and message wired with aria-describedby; error and success each shown
 * by an icon and words, not color alone; focus is the field ring.
 */
export function TextField({
  label,
  hint,
  error,
  success,
  multiline,
  counter,
  demoState,
  inputId,
  required,
  maxLength,
  defaultValue,
  ...native
}: TextFieldProps) {
  const generatedId = useId()
  const id = inputId ?? generatedId
  const hintId = `${id}-hint`
  const messageId = `${id}-message`
  const countId = `${id}-count`

  const [length, setLength] = useState(String(defaultValue ?? '').length)
  const remaining = maxLength ? maxLength - length : 0

  const describedBy = [hint && hintId, (error || success) && messageId, counter && countId]
    .filter(Boolean)
    .join(' ')

  const controlClass = [styles.control, tokens.ringField, demoState === 'hover' && styles.isHover]
    .filter(Boolean)
    .join(' ')

  const shared = {
    id,
    required,
    maxLength,
    defaultValue,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
    className: controlClass,
  } as const

  return (
    <div className={`${styles.field} ${demoState === 'focus' ? tokens.forceFocus : ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}> (required)</span>}
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea
          {...(native as InputHTMLAttributes<HTMLTextAreaElement>)}
          {...shared}
          onChange={(event) => setLength(event.target.value.length)}
        />
      ) : (
        <input {...native} {...shared} onChange={(event) => setLength(event.target.value.length)} />
      )}
      {error && (
        <FieldMessage id={messageId} tone="error">
          {error}
        </FieldMessage>
      )}
      {success && !error && (
        <FieldMessage id={messageId} tone="success">
          {success}
        </FieldMessage>
      )}
      {counter && maxLength && <CharacterCount id={countId} length={length} max={maxLength} remaining={remaining} />}
    </div>
  )
}

/**
 * The visible count updates as you type but isn't announced on every key —
 * that would talk over the typing. A polite live region says what's left once
 * typing pauses, and always at the limit.
 */
function CharacterCount({ id, length, max, remaining }: { id: string; length: number; max: number; remaining: number }) {
  const [announcement, setAnnouncement] = useState('')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const message =
      remaining === 0 ? `No characters left. The limit is ${max}.` : `${remaining} ${remaining === 1 ? 'character' : 'characters'} left`
    const timer = setTimeout(() => setAnnouncement(message), remaining === 0 ? 0 : 750)
    return () => clearTimeout(timer)
  }, [remaining, max])

  return (
    <>
      <p id={id} className={styles.hint}>
        {length} of {max} characters used
      </p>
      <p className={styles.visuallyHidden} aria-live="polite">
        {announcement}
      </p>
    </>
  )
}
