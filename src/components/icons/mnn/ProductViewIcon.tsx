import React from 'react'
import type { IconProps } from '../Icon'

export function ProductViewIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ color }}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 3c1 5.5 4 9.5 6.5 9.5s5.5-4 6.5-9.5" />
        <path d="M12 12.5v1" />
        <path d="M12 13.5Q12.5 16.2 15.2 16.7Q12.5 17.2 12 19.9Q11.5 17.2 8.8 16.7Q11.5 16.2 12 13.5z" />
      </g>
    </svg>
  )
}
