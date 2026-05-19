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
      <path d="M12.156 6H8.97601H4.75201L4.59601 18H12.156" stroke="currentColor" strokeWidth="1.584" strokeLinecap="square"/>
<path d="M9.888 11.8199H19.008" stroke="currentColor" strokeWidth="1.584"/>
<path d="M15.9 8.30396L19.404 11.82L15.9 15.324" stroke="currentColor" strokeWidth="1.584"/>
    </svg>
  )
}
