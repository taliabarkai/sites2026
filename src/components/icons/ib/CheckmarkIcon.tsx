import React from 'react'
import type { IconProps } from '../Icon'

export function CheckmarkIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M5.20001 12.23L10.06 17.21L18.77 8.49998L17.07 6.78998L10.07 13.79L6.91001 10.52L5.20001 12.23Z" fill="currentColor"/>
    </svg>
  )
}
