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
      <path d="M20.384 12.416C20.592 12.208 20.592 11.872 20.384 11.656L16.96 8.23998C16.752 8.03198 16.408 8.03198 16.2 8.23998C15.992 8.44798 15.992 8.79198 16.2 8.99998L19.24 12.04L16.2 15.08C15.992 15.288 15.992 15.632 16.2 15.84C16.408 16.048 16.752 16.048 16.96 15.84L20.384 12.416ZM10.4 12.576H20V11.504H10.4V12.576Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M4.888 4.936H12V4H4V20.8H12V19.864H4.888V4.936Z" fill="currentColor"/>
    </svg>
  )
}
