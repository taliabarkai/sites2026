import React from 'react'
import type { IconProps } from '../Icon'

export function ProductViewIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ color }}>
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4.5" y="3" width="15" height="18" rx="1" />
        <rect x="7.5" y="6" width="9" height="12" rx=".5" />
      </g>
    </svg>
  )
}
