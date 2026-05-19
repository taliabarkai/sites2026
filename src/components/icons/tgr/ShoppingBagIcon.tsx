import React from 'react'
import type { IconProps } from '../Icon'

export function ShoppingBagIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M15.36 6.86H17.38C17.84 6.86 18.23 7.2 18.28 7.67L19.69 19.98C19.75 20.53 19.33 21 18.78 21H3.21999C2.67999 21 2.24999 20.53 2.31999 19.98L3.71999 7.67C3.76999 7.2 4.15999 6.86 4.62999 6.86H6.42999C6.59999 4.66 8.56999 3 10.89 3C13.21 3 15.19 4.66 15.36 6.86ZM14.26 6.86C14.09 5.34 12.69 4.1 10.89 4.1C9.09999 4.1 7.69999 5.34 7.52999 6.86H14.26ZM3.42999 19.9L4.78999 7.95H17.21L18.58 19.9H3.42999Z" fill="currentColor"/>
    </svg>
  )
}
