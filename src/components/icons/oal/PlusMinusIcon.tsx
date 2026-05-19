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
      <path fillRule="evenodd" clipRule="evenodd" d="M6.5 11.0699H17.5V12.5699H6.5V11.0699Z" fill="currentColor"/>
    </svg>
  )
}
