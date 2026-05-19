import React from 'react'
import type { IconProps } from '../Icon'

export function MapPinIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M11.8 4C8.59 4 6 6.71 6 10C6 11.19 6.36 12.13 6.91 13.03L11.29 20.11C11.4 20.29 11.59 20.4 11.8 20.4C12.01 20.4 12.2 20.29 12.31 20.11L16.69 13.03C17.24 12.13 17.6 11.19 17.6 10C17.6 6.71 15.01 4 11.8 4ZM11.8 5.2C14.34 5.2 16.4 7.33 16.4 10C16.4 10.96 16.15 11.61 15.66 12.4L11.8 18.65L7.94 12.4C7.45 11.61 7.2 10.96 7.2 10C7.2 7.33 9.27 5.2 11.8 5.2ZM11.8 6.8C10.15 6.8 8.8 8.15 8.8 9.8C8.8 11.45 10.15 12.8 11.8 12.8C13.45 12.8 14.8 11.45 14.8 9.8C14.8 8.15 13.45 6.8 11.8 6.8ZM11.8 8C12.8 8 13.6 8.8 13.6 9.8C13.6 10.8 12.8 11.6 11.8 11.6C10.8 11.6 10 10.8 10 9.8C10 8.8 10.8 8 11.8 8Z" fill="currentColor"/>
    </svg>
  )
}
