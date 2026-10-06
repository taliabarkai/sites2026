'use client'

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import tokens from '../proposed-tokens.module.css'
import { useBrandIcons } from '../useBrandIcons'
import styles from './variants.module.css'

export interface VariantOption {
  value: string
  /** The accessible name, and the visible value beside the group label. */
  name: string
  soldOut?: boolean
}

export interface VariantGroupProps<T extends VariantOption> {
  label: string
  options: T[]
  defaultValue: string
  /** The option's visuals; the button, check badge and states are handled here. */
  renderOption: (option: T, state: { selected: boolean }) => ReactNode
  /** The option's shape: sets size, radius and how "selected" is drawn. */
  kind: 'swatch' | 'image' | 'chip' | 'tile' | 'option'
  /** Repeat the selected name after the label ("Metal: Gold vermeil"). Off when the tile itself carries it. */
  showValue?: boolean
  /** Keep the group label for screen readers but don't show it (single-tile state examples). */
  hideLabel?: boolean
  /** Static review copy: draw this option as focused. */
  demoFocusValue?: string
}

/**
 * The ARIA radio group pattern, shared by every product variant picker.
 *
 *   Tab            enters at the selected option, and leaves the group
 *   Arrow keys     move and select (wrapping); sold-out options are reached
 *                  and announced, but not selected
 *   Home / End     first / last option
 *
 * Unselected options have a 3:1 border. Selected adds a thicker edge and a
 * checkmark, so it never rests on color. Sold out is crossed through, says
 * "Sold out" in words, and uses aria-disabled so it stays discoverable.
 */
export function VariantGroup<T extends VariantOption>({
  label,
  options,
  defaultValue,
  renderOption,
  kind,
  demoFocusValue,
  showValue = true,
  hideLabel = false,
}: VariantGroupProps<T>) {
  const id = useId()
  const { CheckmarkIcon } = useBrandIcons()
  const [selected, setSelected] = useState(defaultValue)
  const [focusIndex, setFocusIndex] = useState(() => Math.max(0, options.findIndex((o) => o.value === defaultValue)))
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const current = options.find((o) => o.value === selected)

  const moveTo = (index: number) => {
    const next = (index + options.length) % options.length
    setFocusIndex(next)
    refs.current[next]?.focus()
    if (!options[next].soldOut) setSelected(options[next].value)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: options.length - 1,
    }
    if (event.key in keys) {
      event.preventDefault()
      moveTo(keys[event.key])
    }
  }

  return (
    <div className={styles.group}>
      <p id={`${id}-label`} className={hideLabel ? styles.visuallyHidden : styles.groupLabel}>
        {label}
        {showValue ? (
          <>
            : <span className={styles.groupValue}>{current?.name}</span>
          </>
        ) : (
          ':'
        )}
      </p>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className={`${styles.options} ${styles[`options_${kind}`]}`}>
        {options.map((option, index) => {
          const isSelected = option.value === selected
          return (
            <div
              key={option.value}
              className={`${styles.optionWrap} ${demoFocusValue === option.value ? tokens.forceFocus : ''}`}
            >
              <button
                ref={(el) => {
                  refs.current[index] = el
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-disabled={option.soldOut || undefined}
                aria-label={option.soldOut ? `${option.name}, sold out` : option.name}
                // Roving tabindex: one tab stop for the whole group
                tabIndex={index === focusIndex ? 0 : -1}
                onClick={() => {
                  setFocusIndex(index)
                  if (!option.soldOut) setSelected(option.value)
                }}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={[
                  styles.option,
                  styles[`option_${kind}`],
                  isSelected && styles.selected,
                  option.soldOut && styles.soldOut,
                  kind === 'swatch' ? tokens.ringSwatch : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {renderOption(option, { selected: isSelected })}
                {/* Option tiles show selected with the 2px edge, fill and bold text alone */}
                {isSelected && kind !== 'option' && (
                  <span className={styles.check} aria-hidden="true">
                    <CheckmarkIcon className={styles.checkIcon} />
                  </span>
                )}
              </button>
              {option.soldOut && kind !== 'chip' && kind !== 'option' && (
                <span className={styles.soldOutText} aria-hidden="true">
                  Sold out
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
