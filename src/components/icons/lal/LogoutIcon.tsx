import React from 'react'
import type { IconProps } from '../Icon'

export function LogoutIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M11.25 12H20.25" stroke="currentColor" strokeWidth="1.19" strokeLinecap="round"/>
<path d="M16.25 7.5L20.64 11.89C20.7 11.95 20.7 12.05 20.64 12.11L16.25 16.5" stroke="currentColor" strokeWidth="1.19" strokeLinecap="round"/>
<path d="M11.02 19.29H4.67002V4.71H11.02C11.35 4.71 11.62 4.44 11.62 4.11C11.62 3.77 11.35 3.5 11.02 3.5H4.07002C3.73002 3.5 3.46002 3.77 3.46002 4.11V19.89C3.46002 20.23 3.73002 20.5 4.07002 20.5H11.02C11.35 20.5 11.62 20.23 11.62 19.89C11.62 19.56 11.35 19.29 11.02 19.29Z" fill="currentColor"/>
    </svg>
  )
}
