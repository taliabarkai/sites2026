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
      <path d="M6 12H17.37" stroke="currentColor"/>
<path d="M12.32 6.32001L18 12L12.32 17.68" stroke="currentColor"/>
    </svg>
  )
}
