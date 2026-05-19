import React from 'react'
import type { IconProps } from '../Icon'

export function ChevronIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M13.45 12L9.41998 7.97L10.38 7L15.38 12L10.38 17L9.41998 16.03L13.45 12Z" fill="currentColor"/>
    </svg>
  )
}
