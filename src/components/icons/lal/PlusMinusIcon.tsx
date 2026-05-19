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
      <path fillRule="evenodd" clipRule="evenodd" d="M6 11.5C6 11.22 6.22 11 6.5 11H17.5C17.78 11 18 11.22 18 11.5V12.14C18 12.41 17.78 12.64 17.5 12.64H6.5C6.22 12.64 6 12.41 6 12.14V11.5Z" fill="currentColor"/>
    </svg>
  )
}
