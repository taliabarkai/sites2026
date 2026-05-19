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
      <path fillRule="evenodd" clipRule="evenodd" d="M13.74 12L10.11 8.37L10.99 7.5L15.49 12L10.99 16.5L10.11 15.63L13.74 12Z" fill="currentColor"/>
    </svg>
  )
}
