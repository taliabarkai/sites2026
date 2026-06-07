'use client'

import styles from './HotspotPin.module.css'

export interface HotspotPinProps {
  x: number              // % from left edge of the image container
  y: number              // % from top edge of the image container
  pinColor?: 'light' | 'dark'
  isOpen: boolean
  onClick: () => void
  label: string
}

export function HotspotPin({
  x,
  y,
  pinColor = 'light',
  isOpen,
  onClick,
  label,
}: HotspotPinProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={isOpen}
      onClick={onClick}
      className={`${styles.pin} ${styles[pinColor]} ${isOpen ? styles.open : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className={styles.icon} aria-hidden="true">+</span>
    </button>
  )
}
