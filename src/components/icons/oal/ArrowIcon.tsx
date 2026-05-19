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
      <path d="M9.70001 15.5L14.37 12L9.70001 8.5V15.5Z" fill="currentColor"/>
    </svg>
  )
}
