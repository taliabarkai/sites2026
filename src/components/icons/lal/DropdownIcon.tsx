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
      <path fillRule="evenodd" clipRule="evenodd" d="M13.23 11.5L8.5 16.34L9.64 17.5L15.5 11.5L9.64 5.5L8.5 6.66L13.23 11.5Z" fill="currentColor"/>
    </svg>
  )
}
