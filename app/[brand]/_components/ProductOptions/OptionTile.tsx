'use client'

import type { KeyboardEvent, Ref } from 'react'
import type { OptionTileStyle, OptionValue } from './types'
import { formatPrice } from './format'
import styles from './OptionTile.module.css'

export interface OptionTileProps {
  value: OptionValue
  tile: OptionTileStyle
  selected: boolean
  /** `radio` in radio groups, `option` inside a listbox panel. */
  role: 'radio' | 'option'
  tabIndex: number
  onSelect: () => void
  onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void
  ref?: Ref<HTMLButtonElement>
  id?: string
  /** Image-only swatch size. */
  size?: 'sm' | 'lg'
  imageShape?: 'circle' | 'square'
  /** Text tiles: a pill (carousels, grids) or a small square (the letters panel). */
  textShape?: 'pill' | 'square'
  /** Drawer tiles: a radio circle in the top-right corner. */
  radioIndicator?: boolean
  CheckmarkIcon?: React.ComponentType<{ size?: number }>
}

/**
 * One option value, in any tile style, with every state: default, hover,
 * selected, focus-visible and disabled. Containers handle layout and
 * open/close; this handles the look.
 */
export function OptionTile({
  value,
  tile,
  selected,
  role,
  tabIndex,
  onSelect,
  onKeyDown,
  ref,
  id,
  size = 'sm',
  imageShape = 'circle',
  textShape = 'pill',
  radioIndicator = false,
  CheckmarkIcon,
}: OptionTileProps) {
  const stateProps = role === 'radio' ? { 'aria-checked': selected } : { 'aria-selected': selected }
  const delta = value.priceDelta ? `+${formatPrice(value.priceDelta)}` : null

  const className = [
    styles.tile,
    styles[tile],
    tile === 'text' && (textShape === 'square' ? styles.letter : styles.pill),
    tile === 'image-only' && styles[size],
    tile === 'big' && (imageShape === 'square' ? styles.squareImage : styles.circle),
    selected && styles.selected,
    value.disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      id={id}
      type="button"
      role={role}
      {...stateProps}
      aria-disabled={value.disabled || undefined}
      // Image-only swatches have no visible text, so the name is the label
      aria-label={tile === 'image-only' ? value.label : undefined}
      tabIndex={tabIndex}
      className={className}
      onClick={() => {
        if (!value.disabled) onSelect()
      }}
      onKeyDown={onKeyDown}
    >
      {tile !== 'text' && (
        <span className={styles.media} aria-hidden="true">
          {value.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.image} alt="" className={styles.image} loading="lazy" />
          ) : (
            <span className={styles.image} style={{ background: value.swatchColor }} />
          )}
        </span>
      )}

      {tile !== 'image-only' && (
        <span className={styles.copy}>
          <span className={styles.label}>{value.label}</span>
          {delta && <span className={styles.delta}>{delta}</span>}
        </span>
      )}

      {radioIndicator && (
        <span className={styles.radio} aria-hidden="true">
          {selected && CheckmarkIcon && <CheckmarkIcon size={12} />}
        </span>
      )}
    </button>
  )
}
