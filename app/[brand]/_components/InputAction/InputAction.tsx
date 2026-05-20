'use client'

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Button } from '../Button'
import styles from './InputAction.module.css'

export interface InputActionProps {
  inputType?:      'email' | 'text'
  placeholder?:    string
  buttonLabel?:    string
  buttonIcon?:     ReactNode
  onSubmit:        (value: string) => void
  disabled?:       boolean
  errorMessage?:   string
  successMessage?: string
  className?:      string
  groupLabel?:     string
  inputLabel?:     string
}

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function InputAction({
  inputType = 'text',
  placeholder,
  buttonLabel,
  buttonIcon,
  onSubmit,
  disabled,
  errorMessage,
  successMessage,
  className,
  groupLabel = 'Input with action',
  inputLabel,
}: InputActionProps) {
  const inputId = useId()
  const [value, setValue] = useState('')

  const submit = () => {
    if (disabled) return
    onSubmit(value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      submit()
    }
  }

  const iconOnly = !buttonLabel
  const actionAriaLabel = buttonLabel ? undefined : groupLabel

  return (
    <div className={joinClasses(styles.root, className)}>
      <div
        role="group"
        aria-label={groupLabel}
        className={styles.wrapper}
        data-disabled={disabled || undefined}
      >
        <label className={styles.srOnly} htmlFor={inputId}>
          {inputLabel ?? placeholder ?? groupLabel}
        </label>
        <input
          id={inputId}
          type={inputType}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          className={styles.input}
        />
        <Button
          type="button"
          variant="primary"
          size={iconOnly ? 'iconOnly' : 'compact'}
          disabled={disabled}
          onClick={submit}
          aria-label={actionAriaLabel}
          className={joinClasses(styles.action, iconOnly && styles.actionIconOnly)}
        >
          {buttonLabel ?? buttonIcon}
        </Button>
      </div>

      {errorMessage && (
        <p role="alert" className={joinClasses(styles.message, styles.error)}>
          {errorMessage}
        </p>
      )}
      {successMessage && !errorMessage && (
        <p role="status" className={joinClasses(styles.message, styles.success)}>
          {successMessage}
        </p>
      )}
    </div>
  )
}
