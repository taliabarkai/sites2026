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
      <path fillRule="evenodd" clipRule="evenodd" d="M13.9114 6.30001H16.2429H16.8257L16.8857 6.8743L18.42 21.24L18.4886 21.9514H17.7772H0.925723H0.214294L0.291437 21.24L1.82572 6.8743L1.88572 6.30001H2.46001H4.56858C4.76572 3.90858 6.78858 2.04858 9.24001 2.04858C11.6914 2.04858 13.7143 3.90858 13.9114 6.30001ZM12.6172 6.30001C12.4286 4.63716 10.9972 3.3343 9.24001 3.3343C7.48287 3.3343 6.05144 4.63716 5.86287 6.30001H12.6172ZM1.64572 20.6657L3.04287 7.58573H15.6686L17.0657 20.6657H1.64572Z" fill="currentColor"/>
    </svg>
  )
}
