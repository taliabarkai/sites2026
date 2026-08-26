import React from 'react'
import type { IconProps } from '../Icon'

export function KeyIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <circle cx="7.25" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10.75 12H20.5M17.5 12V15M14.25 12V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
