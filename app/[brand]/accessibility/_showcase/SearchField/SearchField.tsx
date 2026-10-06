'use client'

import { useId, useRef, useState } from 'react'
import { useShowcaseView } from '../ShowcaseView'
import { useBrandIcons } from '../useBrandIcons'
import styles from './SearchField.module.css'

export interface SearchFieldProps {
  defaultValue?: string
  /** Static review copies: draw a state without real focus. */
  demoState?: 'focus' | 'clearFocus'
}

/**
 * Header search: icon, text box, clear button.
 *
 * Before (production): the focus ring wraps only the text box between the two
 * icons, and the field's own edge cuts it off at the top and bottom.
 * After: the whole field — icons included — takes the ring while the text box
 * has focus. The clear button gets its own ring, so it's always clear which
 * of the two has focus.
 */
export function SearchField({ defaultValue = '', demoState }: SearchFieldProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const { isAfter } = useShowcaseView()
  const [value, setValue] = useState(defaultValue)
  const { MagnifyingGlassIcon, XIcon } = useBrandIcons()

  // Production always shows the clear button; the fix shows it only when
  // there's something to clear.
  const showClear = isAfter ? value.length > 0 : true

  const fieldClass = [
    styles.field,
    isAfter ? styles.proposed : styles.today,
    demoState === 'focus' && styles.isFocused,
    demoState === 'clearFocus' && styles.isClearFocused,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <form role="search" className={styles.form} onSubmit={(event) => event.preventDefault()}>
      <label htmlFor={id} className={styles.visuallyHidden}>
        Search
      </label>
      <div className={fieldClass}>
        <span className={styles.icon} aria-hidden="true">
          <MagnifyingGlassIcon className={styles.svg} />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="E.g. Gift for her, men's bracelet"
          autoComplete="off"
          className={styles.input}
        />
        {showClear && (
          <button
            type="button"
            aria-label="Clear search"
            className={styles.clear}
            onClick={() => {
              setValue('')
              inputRef.current?.focus()
            }}
          >
            <XIcon className={styles.svg} />
          </button>
        )}
      </div>
    </form>
  )
}
