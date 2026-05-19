import React from 'react'
import type { IconProps } from '../Icon'

export function HamburgerIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M24 3.43005H0V4.72005H24V3.43005Z" fill="currentColor"/>
<path d="M24 11.14H0V12.43H24V11.14Z" fill="currentColor"/>
<path d="M24 18.86H0V20.15H24V18.86Z" fill="currentColor"/>
    </svg>
  )
}
