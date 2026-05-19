import React from 'react'
import type { IconProps } from '../Icon'

export function CheckmarkIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M19.24 8.56L8.64999 19.14L4.23999 14.73" stroke="currentColor" strokeWidth="1.88" strokeLinecap="square" strokeLinejoin="round"/>
    </svg>
  )
}
