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
      <path fillRule="evenodd" clipRule="evenodd" d="M9.87002 6L15.35 11.37C15.49 11.5 15.57 11.69 15.57 11.89C15.57 12.09 15.5 12.28 15.36 12.42L9.89002 18L8.83002 16.96L13.78 11.91L8.83002 7.06L9.87002 6Z" fill="currentColor"/>
    </svg>
  )
}
