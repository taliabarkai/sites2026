import React from 'react'
import type { IconProps } from '../Icon'

export function DropdownIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M15.25 12L8.75 7V17L15.25 12Z" fill="currentColor"/>
    </svg>
  )
}
