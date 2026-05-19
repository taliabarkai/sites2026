import React from 'react'
import type { IconProps } from '../Icon'

export function CheckboxIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M12 19.64C16.2194 19.64 19.64 16.2194 19.64 12C19.64 7.78053 16.2194 4.35999 12 4.35999C7.78053 4.35999 4.35999 7.78053 4.35999 12C4.35999 16.2194 7.78053 19.64 12 19.64Z" stroke="currentColor" strokeWidth="0.73"/>
    </svg>
  )
}
