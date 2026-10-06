'use client'

import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import tokens from '../proposed-tokens.module.css'
import { useBrandIcons } from '../useBrandIcons'
import styles from './forms.module.css'
import combo from './combobox.module.css'

export interface ComboboxProps {
  label: string
  hint?: string
  options: string[]
  defaultValue?: string
  required?: boolean
  /** Static review copy: draw the list open with an option active. */
  demoOpen?: boolean
}

/**
 * ARIA 1.2 combobox with a list: the input keeps focus throughout, and
 * aria-activedescendant points at the option the arrow keys have reached.
 *
 *   Down / Up    open the list, move through it (wraps)
 *   Enter        choose the active option
 *   Escape       close the list; press again to clear the text
 *   Tab          close the list and move on
 */
export function Combobox({ label, hint, options, defaultValue = '', required, demoOpen }: ComboboxProps) {
  const id = useId()
  const listId = `${id}-list`
  const inputRef = useRef<HTMLInputElement>(null)
  const { DropdownIcon } = useBrandIcons()

  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(Boolean(demoOpen))
  const [active, setActive] = useState(demoOpen ? 0 : -1)

  const matches = useMemo(() => {
    const query = value.trim().toLowerCase()
    return query ? options.filter((option) => option.toLowerCase().includes(query)) : options
  }, [options, value])

  const expanded = open && matches.length > 0
  const activeId = expanded && active >= 0 ? `${id}-option-${active}` : undefined

  const choose = (option: string) => {
    setValue(option)
    setOpen(false)
    setActive(-1)
    inputRef.current?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        setActive(event.key === 'ArrowDown' ? 0 : matches.length - 1)
        return
      }
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((current) => (current + step + matches.length) % matches.length)
    } else if (event.key === 'Enter' && expanded && active >= 0) {
      event.preventDefault()
      choose(matches[active])
    } else if (event.key === 'Escape') {
      if (expanded) {
        setOpen(false)
        setActive(-1)
      } else {
        setValue('')
      }
    }
  }

  return (
    <div className={`${styles.field} ${combo.combobox}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}> (required)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={combo.inputWrap}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-describedby={hint ? `${id}-hint` : undefined}
          autoComplete="off"
          required={required}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (!demoOpen) setOpen(false)
          }}
          className={`${styles.control} ${combo.input} ${tokens.ringField}`}
        />
        <span className={combo.icon} aria-hidden="true">
          <DropdownIcon className={combo.svg} />
        </span>
      </div>

      <ul
        id={listId}
        role="listbox"
        aria-label={label}
        className={`${combo.list} ${demoOpen ? combo.listStatic : ''}`}
        hidden={!expanded}
      >
        {matches.map((option, index) => (
          <li
            key={option}
            id={`${id}-option-${index}`}
            role="option"
            aria-selected={index === active}
            className={combo.option}
            // Keep focus in the input: choose on mousedown, before blur closes the list
            onMouseDown={(event) => {
              event.preventDefault()
              choose(option)
            }}
          >
            {option}
          </li>
        ))}
      </ul>

      {/* Announced as the list changes, so the count is known without arrowing through */}
      <p className={styles.visuallyHidden} aria-live="polite">
        {open && value ? `${matches.length} ${matches.length === 1 ? 'result' : 'results'} available` : ''}
      </p>
    </div>
  )
}
