'use client'

import styles from './HotspotPin.module.css'

export interface HotspotPinProps {
  x: number              // % from left edge of the image container
  y: number              // % from top edge of the image container
  pinColor?: 'light' | 'dark'
  /** Disclosure mode (default): the pin opens a panel — `+` rotates to `×`. */
  isOpen?: boolean
  /** Open-state icon in disclosure mode: `rotate` (+ → ×, default) or `minus`
   *  (+ → −, its vertical bar animates away — V3 popover dots). */
  openIndicator?: 'rotate' | 'minus'
  /**
   * Selection mode: pass a boolean to make the pin a toggle that selects a
   * product (aria-pressed, filled active state) instead of opening a panel.
   */
  isSelected?: boolean
  onClick: () => void
  label: string
}

export function HotspotPin({
  x,
  y,
  pinColor = 'light',
  isOpen = false,
  openIndicator = 'rotate',
  isSelected,
  onClick,
  label,
}: HotspotPinProps) {
  const selectable = isSelected !== undefined
  const classes = [
    styles.pin,
    styles[pinColor],
    !selectable && isOpen && styles.open,
    openIndicator === 'minus' && styles.minusMode,
    selectable && styles.selectable,
    selectable && isSelected && styles.selected,
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      aria-label={label}
      {...(selectable ? { 'aria-pressed': isSelected } : { 'aria-expanded': isOpen })}
      onClick={onClick}
      className={classes}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {openIndicator === 'minus'
        ? <span className={styles.bars} aria-hidden="true" />
        : <span className={styles.icon} aria-hidden="true">+</span>}
    </button>
  )
}
