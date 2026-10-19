import React from 'react'
import type { IconProps } from '../Icon'

export function FilterIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
        <path d="M4.05 7.84H7.47M12.07 7.84H19.95M4.05 16.17H11.93M16.53 16.17H19.95" />
        <circle cx="9.77" cy="7.84" r="2.3" />
        <circle cx="14.23" cy="16.17" r="2.3" />
      </g>
    </svg>
  )
}
