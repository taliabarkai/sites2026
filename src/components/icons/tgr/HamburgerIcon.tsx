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
      <path d="M22.31 4H1.69C1.30892 4 1 4.30892 1 4.69C1 5.07108 1.30892 5.38 1.69 5.38H22.31C22.6911 5.38 23 5.07108 23 4.69C23 4.30892 22.6911 4 22.31 4Z" fill="currentColor"/>
<path d="M22.31 11.38H1.69C1.30892 11.38 1 11.6889 1 12.07C1 12.4511 1.30892 12.76 1.69 12.76H22.31C22.6911 12.76 23 12.4511 23 12.07C23 11.6889 22.6911 11.38 22.31 11.38Z" fill="currentColor"/>
<path d="M22.31 18.77H1.69C1.30892 18.77 1 19.0789 1 19.46C1 19.8411 1.30892 20.15 1.69 20.15H22.31C22.6911 20.15 23 19.8411 23 19.46C23 19.0789 22.6911 18.77 22.31 18.77Z" fill="currentColor"/>
    </svg>
  )
}
