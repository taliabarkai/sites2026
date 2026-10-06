'use client'

import { useId, type InputHTMLAttributes } from 'react'
import tokens from '../proposed-tokens.module.css'
import { useBrandIcons } from '../useBrandIcons'
import { FieldMessage } from './FieldMessage'
import styles from './forms.module.css'
import choice from './choices.module.css'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id' | 'className'>

// ─── Checkbox ──────────────────────────────────────────────────────────────

export interface CheckboxProps extends InputProps {
  label: string
  hint?: string
  error?: string
  demoState?: 'focus'
}

/** Native checkbox, drawn: a 3:1 border, and a checkmark — not just a fill — when checked. */
export function Checkbox({ label, hint, error, demoState, ...native }: CheckboxProps) {
  const id = useId()
  const { CheckmarkIcon } = useBrandIcons()
  const describedBy = [hint && `${id}-hint`, error && `${id}-message`].filter(Boolean).join(' ')

  return (
    <div className={`${choice.choiceField} ${demoState === 'focus' ? tokens.forceFocus : ''}`}>
      <div className={choice.choiceRow}>
        <span className={choice.boxWrap}>
          <input
            {...native}
            id={id}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            className={`${choice.checkbox} ${tokens.ringField}`}
          />
          <CheckmarkIcon className={choice.check} />
        </span>
        <label htmlFor={id} className={choice.choiceLabel}>
          {label}
        </label>
      </div>
      {hint && (
        <p id={`${id}-hint`} className={`${styles.hint} ${choice.choiceHint}`}>
          {hint}
        </p>
      )}
      {error && (
        <div className={choice.choiceHint}>
          <FieldMessage id={`${id}-message`} tone="error">
            {error}
          </FieldMessage>
        </div>
      )}
    </div>
  )
}

// ─── Radio group ───────────────────────────────────────────────────────────

export interface RadioGroupProps {
  legend: string
  name: string
  options: { value: string; label: string; hint?: string }[]
  defaultValue?: string
  disabledValues?: string[]
  demoFocusValue?: string
}

/**
 * fieldset + legend, so each option is read with the question it answers.
 * Native radios: arrow keys move and select, Tab enters and leaves the group.
 */
export function RadioGroup({ legend, name, options, defaultValue, disabledValues = [], demoFocusValue }: RadioGroupProps) {
  const id = useId()

  return (
    <fieldset className={choice.fieldset}>
      <legend className={`${styles.label} ${choice.legend}`}>{legend}</legend>
      <div className={choice.options}>
        {options.map((option) => {
          const optionId = `${id}-${option.value}`
          return (
            <div
              key={option.value}
              className={`${choice.choiceField} ${demoFocusValue === option.value ? tokens.forceFocus : ''}`}
            >
              <div className={choice.choiceRow}>
                <input
                  id={optionId}
                  type="radio"
                  name={`${name}-${id}`}
                  value={option.value}
                  defaultChecked={defaultValue === option.value}
                  disabled={disabledValues.includes(option.value)}
                  aria-describedby={option.hint ? `${optionId}-hint` : undefined}
                  className={`${choice.radio} ${tokens.ringField}`}
                />
                <label htmlFor={optionId} className={choice.choiceLabel}>
                  {option.label}
                </label>
              </div>
              {option.hint && (
                <p id={`${optionId}-hint`} className={`${styles.hint} ${choice.choiceHint}`}>
                  {option.hint}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

// ─── Switch ────────────────────────────────────────────────────────────────

export interface SwitchProps extends InputProps {
  label: string
  hint?: string
  demoState?: 'focus'
}

/**
 * A checkbox with role="switch": it's announced as on/off and acts at once,
 * with no Save step. On/off shows as the knob's side and the word beside it.
 */
export function Switch({ label, hint, demoState, checked, defaultChecked, onChange, ...native }: SwitchProps) {
  const id = useId()

  return (
    <div className={`${choice.choiceField} ${demoState === 'focus' ? tokens.forceFocus : ''}`}>
      <div className={choice.switchRow}>
        <label htmlFor={id} className={choice.choiceLabel}>
          {label}
        </label>
        <span className={choice.switchControl}>
          <input
            {...native}
            id={id}
            type="checkbox"
            role="switch"
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            aria-describedby={hint ? `${id}-hint` : undefined}
            className={`${choice.switch} ${tokens.ringSwatch}`}
          />
          <span className={choice.switchState} aria-hidden="true" />
        </span>
      </div>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  )
}
