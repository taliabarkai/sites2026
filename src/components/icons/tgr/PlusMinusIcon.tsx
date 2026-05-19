import React from 'react'
import type { IconProps } from '../Icon'

export function PlusMinusIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M11.75 17.75C11.47 17.75 11.25 17.53 11.25 17.25V6.25C11.25 5.97 11.47 5.75 11.75 5.75H12.25C12.53 5.75 12.75 5.97 12.75 6.25V17.25C12.75 17.53 12.53 17.75 12.25 17.75H11.75Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M6 11.5C6 11.22 6.22 11 6.5 11H17.5C17.78 11 18 11.22 18 11.5V12C18 12.28 17.78 12.5 17.5 12.5H6.5C6.22 12.5 6 12.28 6 12V11.5Z" fill="currentColor"/>
    </svg>
  )
}
