'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { ChoiceGroup } from './types'
import { formatPrice } from './format'
import { OptionThumb } from './OptionThumb'
import { OptionTile } from './OptionTile'
import { useOptionIcons } from './useOptionIcons'
import { useRovingFocus } from './useRovingFocus'
import styles from './ProductOptions.module.css'

export interface OptionDropdownProps {
  group: ChoiceGroup
  value: string
  onChange: (id: string) => void
  /** Item base price — the material picker shows each value's full price. */
  basePrice: number
}

/**
 * `list-dropdown` and `panel-dropdown` — a trigger that opens a listbox
 * attached under it: a vertical list of rows, or a scrollable grid of tiles.
 *
 *   Trigger    Enter / Space / ↓ / ↑ open it, on the selected value
 *   Listbox    arrows move, Enter / Space / click select and close,
 *              Escape closes, Tab or a click outside closes
 */
export function OptionDropdown({ group, value, onChange, basePrice }: OptionDropdownProps) {
  const id = useId()
  const labelId = `${id}-label`
  const listId = `${id}-list`
  const { DropdownIcon } = useOptionIcons()
  const isPanel = group.display === 'panel-dropdown'
  const tile = group.tile ?? 'text'

  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selectedIndex = Math.max(0, group.values.findIndex((v) => v.id === value))
  const selected = group.values[selectedIndex]

  const roving = useRovingFocus({
    count: group.values.length,
    initialIndex: selectedIndex,
    orientation: isPanel ? 'grid' : 'vertical',
    isDisabled: (i) => Boolean(group.values[i]?.disabled),
    wrap: false,
  })

  // Opening lands on the selected value
  const { setFocusIndex, refs } = roving
  useEffect(() => {
    if (!open) return
    setFocusIndex(selectedIndex)
    const el = refs.current[selectedIndex]
    el?.focus({ preventScroll: true })
    el?.scrollIntoView({ block: 'nearest' })
  }, [open, selectedIndex, setFocusIndex, refs])

  // A click anywhere outside closes it
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const select = (index: number) => {
    const v = group.values[index]
    if (!v || v.disabled) return
    onChange(v.id)
    close(true)
  }

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
    }
  }

  const onOptionKeyDown = (e: KeyboardEvent<HTMLElement>, index: number) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close(true)
      return
    }
    if (e.key === 'Tab') {
      close(false)
      return
    }
    roving.onKeyDown(e, index)
  }

  const priceOf = (delta = 0) => formatPrice(basePrice + delta)
  const showThumb = tile !== 'text'
  const thumbShape = tile === 'big' || tile === 'image-only' ? 'circle' : 'rounded'

  return (
    <div className={styles.group}>
      <p id={labelId} className={styles.groupLabel}>
        {group.label}
      </p>

      <div ref={rootRef} className={styles.dropdown}>
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-labelledby={`${labelId} ${id}-value`}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onTriggerKeyDown}
        >
          {showThumb && selected && <OptionThumb value={selected} shape={thumbShape} size="md" />}
          <span id={`${id}-value`} className={styles.triggerValue}>
            {selected?.label}
          </span>
          {group.showPrice && selected && <span className={styles.triggerPrice}>{priceOf(selected.priceDelta)}</span>}
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">
            <DropdownIcon size={24} />
          </span>
        </button>

        {open && (
          <div
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            className={isPanel ? `${styles.panel} ${styles[`panel_${tile}`]}` : styles.list}
          >
            {group.values.map((v, i) =>
              isPanel ? (
                <OptionTile
                  key={v.id}
                  ref={roving.register(i)}
                  value={v}
                  tile={tile}
                  role="option"
                  selected={v.id === value}
                  tabIndex={i === roving.focusIndex ? 0 : -1}
                  textShape="square"
                  imageShape={group.imageShape}
                  size={group.size}
                  onSelect={() => select(i)}
                  onKeyDown={(e) => onOptionKeyDown(e, i)}
                />
              ) : (
                <button
                  key={v.id}
                  ref={roving.register(i)}
                  type="button"
                  role="option"
                  aria-selected={v.id === value}
                  aria-disabled={v.disabled || undefined}
                  tabIndex={i === roving.focusIndex ? 0 : -1}
                  className={[styles.row, v.id === value && styles.rowSelected, v.disabled && styles.rowDisabled]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => select(i)}
                  onKeyDown={(e) => onOptionKeyDown(e, i)}
                >
                  {showThumb && <OptionThumb value={v} shape={thumbShape} size="md" />}
                  <span className={styles.rowLabel}>{v.label}</span>
                  {group.showPrice ? (
                    <span className={styles.rowPrice}>{priceOf(v.priceDelta)}</span>
                  ) : (
                    v.priceDelta ? <span className={styles.rowPrice}>+{formatPrice(v.priceDelta)}</span> : null
                  )}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}
