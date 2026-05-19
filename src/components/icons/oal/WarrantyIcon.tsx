import React from 'react'
import type { IconProps } from '../Icon'

export function WarrantyIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M3.5 12C8.19 12 12 15.81 12 20.5" stroke="currentColor" strokeWidth="1.59"/>
<path d="M20.5 12C15.81 12 12 8.19 12 3.5" stroke="currentColor" strokeWidth="1.59"/>
<path d="M12 3.5C12 8.19 8.19 12 3.5 12" stroke="currentColor" strokeWidth="1.59"/>
<path d="M12 20.5C12 15.81 15.81 12 20.5 12" stroke="currentColor" strokeWidth="1.59"/>
    </svg>
  )
}
