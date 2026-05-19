import React from 'react'
import type { IconProps } from '../Icon'

export function ReturnIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M6.40002 7.97424H17.6" stroke="currentColor" strokeWidth="1.16129"/>
<path d="M14.4 4.49036L18 7.97423L14.4 11.4581" stroke="currentColor" strokeWidth="1.16129"/>
<path d="M18 14.9419H6.79999" stroke="currentColor" strokeWidth="1.16129"/>
<path d="M10 18.4257L6.40002 14.9419L10 11.458" stroke="currentColor" strokeWidth="1.16129"/>
    </svg>
  )
}
