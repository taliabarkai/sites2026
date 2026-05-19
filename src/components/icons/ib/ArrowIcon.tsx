import React from 'react'
import type { IconProps } from '../Icon'

export function ArrowIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M6.71997 12H16.72" stroke="currentColor"/>
<path d="M12.28 7L17.15 11.88C17.22 11.94 17.22 12.06 17.15 12.12L12.28 17" stroke="currentColor"/>
    </svg>
  )
}
