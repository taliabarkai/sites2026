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
      <path d="M19.83 7.48992H17.94C17.83 6.03992 17.18 4.68992 16.11 3.69992C15.04 2.70992 13.65 2.16992 12.19 2.16992C10.74 2.16992 9.34 2.70992 8.28 3.69992C7.21 4.68992 6.56 6.03992 6.45 7.48992H4.56L2.19 21.6899H22.19L19.83 7.48992ZM12.19 3.05992C13.41 3.05992 14.58 3.50992 15.48 4.32992C16.38 5.14992 16.94 6.27992 17.05 7.48992H7.34C7.45 6.27992 8.01 5.14992 8.91 4.32992C9.81 3.50992 10.98 3.05992 12.19 3.05992ZM5.32 8.37992H19.07L21.14 20.7999H3.25L5.32 8.37992Z" fill="currentColor"/>
    </svg>
  )
}
