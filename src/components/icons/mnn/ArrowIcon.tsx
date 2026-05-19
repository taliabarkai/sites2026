import React from 'react'
import type { IconProps } from '../Icon'

export function ArrowIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M19.53 12.53C19.82 12.24 19.82 11.76 19.53 11.47L14.76 6.70001C14.46 6.40001 13.99 6.40001 13.7 6.70001C13.4 6.99001 13.4 7.46001 13.7 7.76001L17.94 12L13.7 16.24C13.4 16.54 13.4 17.01 13.7 17.3C13.99 17.6 14.46 17.6 14.76 17.3L19.53 12.53ZM5 12.75H19V11.25H5V12.75Z" fill="currentColor"/>
    </svg>
  )
}
