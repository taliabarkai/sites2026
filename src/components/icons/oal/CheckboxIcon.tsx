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
      <path d="M12 19.4C16.0869 19.4 19.4 16.0869 19.4 12C19.4 7.91307 16.0869 4.59998 12 4.59998C7.91307 4.59998 4.59998 7.91307 4.59998 12C4.59998 16.0869 7.91307 19.4 12 19.4Z" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}
