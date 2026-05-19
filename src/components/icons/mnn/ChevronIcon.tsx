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
      <path fillRule="evenodd" clipRule="evenodd" d="M10.27 6L15.75 11.37C15.89 11.5 15.97 11.69 15.97 11.89C15.97 12.09 15.9 12.28 15.76 12.42L10.29 18L9.22998 16.96L14.18 11.91L9.22998 7.06L10.27 6Z" fill="currentColor"/>
    </svg>
  )
}
