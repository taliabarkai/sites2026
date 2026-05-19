import React from 'react'
import type { IconProps } from '../Icon'

export function PersonIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M7.34999 7.78C7.34999 5.3 9.35999 3.3 11.83 3.3C14.3 3.3 16.31 5.3 16.31 7.78C16.31 10.26 14.3 12.27 11.83 12.27C9.35999 12.27 7.34999 10.26 7.34999 7.78ZM11.83 2C8.63999 2 6.04999 4.59 6.04999 7.78C6.04999 9.89 7.17999 11.73 8.84999 12.74C4.70999 13.99 1.67999 17.64 1.67999 22H2.97999C2.97999 17.39 6.97999 13.58 12 13.58C17.03 13.58 21.03 17.39 21.03 22H22.33C22.33 17.56 19.18 13.85 14.92 12.67C16.53 11.65 17.61 9.84 17.61 7.78C17.61 4.59 15.02 2 11.83 2Z" fill="currentColor"/>
    </svg>
  )
}
