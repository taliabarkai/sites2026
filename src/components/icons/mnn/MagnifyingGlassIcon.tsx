import React from 'react'
import type { IconProps } from '../Icon'

export function MagnifyingGlassIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M16.17 15.04C18.74 11.91 18.56 7.27 15.63 4.34C12.52 1.22 7.46 1.22 4.34 4.34C1.22 7.46 1.22 12.52 4.34 15.63C7.34 18.63 12.13 18.75 15.26 15.98L21.22 22L22.15 21.08L16.17 15.04ZM14.71 14.71C17.32 12.1 17.32 7.87 14.71 5.26C12.1 2.65 7.87 2.65 5.26 5.26C2.65 7.87 2.65 12.1 5.26 14.71C7.87 17.32 12.1 17.32 14.71 14.71Z" fill="currentColor"/>
    </svg>
  )
}
