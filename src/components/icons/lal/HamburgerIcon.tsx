import React from 'react'
import type { IconProps } from '../Icon'

export function HamburgerIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
    >
      <path d="M0.5 2.5H23.5" stroke="currentColor"/>
<path d="M0.5 11.5H23.5" stroke="currentColor"/>
<path d="M0.5 20.5H23.5" stroke="currentColor"/>
    </svg>
  )
}
