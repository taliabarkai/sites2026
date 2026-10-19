import React from 'react'
import type { IconProps } from '../Icon'

export function ProductViewIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ color }}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3c1 6 4 10 6 10s5-4 6-10" />
        <circle cx="12" cy="16" r="2.5" />
      </g>
    </svg>
  )
}
