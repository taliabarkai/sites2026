import React from 'react'
import type { IconProps } from '../Icon'

export function PaperFreeIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M17.03 7.47C17.03 7.39 16.99 7.3 16.93 7.24L13.79 4.1C13.73 4.04 13.64 4 13.55 4H5.33C5.15 4 5 4.15 5 4.33V19.7C5 19.89 5.15 20.04 5.33 20.04H13.72C13.94 19.66 13.94 19.37 13.73 19.37H5.67V4.67H13.02V7.67C13.02 7.86 13.17 8.01 13.35 8.01H16.36V13.3C16.36 13.42 16.69 13.7 17.03 13.3V7.47ZM13.89 7.34V4.94L16.09 7.34H13.89Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M16.69 17.5L17.4 18.21C17.53 18.34 17.74 18.34 17.87 18.21C18 18.08 18 17.87 17.87 17.74L17.17 17.03L17.87 16.32C18 16.19 18 15.98 17.87 15.85C17.74 15.72 17.53 15.72 17.4 15.85L16.69 16.56L15.98 15.85C15.85 15.72 15.64 15.72 15.51 15.85C15.38 15.98 15.38 16.19 15.51 16.32L16.22 17.03L15.51 17.74C15.38 17.87 15.38 18.08 15.51 18.21C15.64 18.34 15.85 18.34 15.98 18.21L16.69 17.5ZM16.69 20.04C18.35 20.04 19.7 18.69 19.7 17.03C19.7 15.37 18.35 14.02 16.69 14.02C15.03 14.02 13.69 15.37 13.69 17.03C13.69 18.69 15.03 20.04 16.69 20.04Z" fill="currentColor"/>
    </svg>
  )
}
