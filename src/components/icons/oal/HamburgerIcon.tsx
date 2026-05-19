import React from 'react'
import type { IconProps } from '../Icon'

export function HamburgerIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M21 6.89998H3V5.09998H21V6.89998ZM21 12.9H3V11.1H21V12.9ZM3 18.9H21V17.1H3V18.9Z" fill="currentColor"/>
    </svg>
  )
}
