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
      <path fillRule="evenodd" clipRule="evenodd" d="M13.1512 12.1C13.3512 11.91 13.3512 11.59 13.1512 11.4L9.96123 8.19997C9.69123 7.92997 9.69123 7.49997 9.96123 7.22997C10.2312 6.96997 10.6612 6.96997 10.9312 7.22997L15.0912 11.4C15.2912 11.59 15.2912 11.91 15.0912 12.1L10.9312 16.27C10.6612 16.53 10.2312 16.53 9.96123 16.27C9.69123 16 9.69123 15.57 9.96123 15.3L13.1512 12.1Z" fill="currentColor"/>
    </svg>
  )
}
