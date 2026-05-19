import React from 'react'
import type { IconProps } from '../Icon'

export function SingleViewIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M24 0.0114746H0V22.8686H24V0.0114746Z" fill="currentColor"/>
    </svg>
  )
}
